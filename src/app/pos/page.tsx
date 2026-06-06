"use client";

import React, { useState, useEffect, useRef } from 'react';
import AppShell from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button, cn } from "@/components/ui/Button";
import { 
  Search, ShoppingCart, Trash2, Plus, Minus, 
  Zap, CreditCard, Banknote, Smartphone, Tag, Package, Printer, Share2, X, Check,
  Edit3, Gift, Star
} from "lucide-react";
import CustomerSelect from "@/components/pos/CustomerSelect";
import { productsDB, salesDB, customersDB, seedDatabase } from "@/lib/localdb";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
}

function getSettings() {
  if (typeof window === 'undefined') return { pointValue: 0.5 };
  const raw = localStorage.getItem('mrfancy_settings');
  const settings = raw ? JSON.parse(raw) : {};
  return { pointValue: settings.pointValue ?? 0.5, ...settings };
}

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
  const [isLoading, setIsLoading] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const settings = getSettings();

  // Fetch products from localStorage
  useEffect(() => {
    seedDatabase();
    const fetchProducts = () => {
      const allProducts = productsDB.getAll({ q: searchQuery });
      setProducts(allProducts);
    };
    const debounce = setTimeout(fetchProducts, searchQuery.length > 2 ? 300 : 0);

    const handleSync = () => {
      fetchProducts();
    };
    window.addEventListener('mrfancy_db_synced', handleSync);

    return () => {
      clearTimeout(debounce);
      window.removeEventListener('mrfancy_db_synced', handleSync);
    };
  }, [searchQuery]);

  // Keyboard shortcut for focusing search (F1)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Get customer's available points
  const customerPoints = selectedCustomer
    ? (customersDB.getById((selectedCustomer as any)._id || selectedCustomer.id)?.loyaltyPoints || 0)
    : 0;
  const maxRedeemValue = customerPoints * settings.pointValue;

  // Recalculate when customer or redeem changes
  useEffect(() => {
    if (!redeemPoints || !selectedCustomer) {
      setPointsToRedeem(0);
      return;
    }
    const availablePoints = customerPoints;
    const sub = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) - discount;
    const maxPointsForBill = Math.floor(sub / settings.pointValue);
    setPointsToRedeem(Math.min(availablePoints, maxPointsForBill));
  }, [redeemPoints, selectedCustomer, cart, discount, customerPoints, settings.pointValue]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product._id);
      if (existing) {
        return prev.map(item => item.id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: product._id, name: product.name, price: product.sellingPrice, quantity: 1 }];
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = searchQuery.trim();
      if (!query) return;

      const allProducts = productsDB.getAll();
      const matchedProduct = allProducts.find((p: any) => 
        (p.sku && p.sku.toLowerCase() === query.toLowerCase()) || 
        (p.barcode && p.barcode.toLowerCase() === query.toLowerCase())
      );

      if (matchedProduct) {
        addToCart(matchedProduct);
        setSearchQuery('');
      }
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const setQuantity = (id: string, qty: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, qty) } : item));
  };

  const setPrice = (id: string, price: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, price: Math.max(0, price) } : item));
  };

  const setNote = (id: string, note: string) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, note } : item));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    if (editingItem === id) setEditingItem(null);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const pointsDiscount = pointsToRedeem * settings.pointValue;
  const total = Math.max(0, subtotal - discount - pointsDiscount);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }
    setIsLoading(true);

    try {
      const saleItems = cart.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        note: item.note || '',
      }));

      const count = salesDB.count();
      const billNumber = `MR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(count + 1).toString().padStart(4, '0')}`;

      const custId = selectedCustomer ? ((selectedCustomer as any)._id || selectedCustomer.id) : null;

      const sale = salesDB.create({
        customer: custId,
        items: saleItems,
        totalAmount: total,
        discount,
        pointsRedeemed: pointsToRedeem,
        pointsDiscount,
        paymentMode,
        billNumber,
      });

      // Update inventory
      for (const item of saleItems) {
        const product = productsDB.getById(item.productId);
        if (product) {
          productsDB.update(item.productId, {
            stockQuantity: Math.max(0, product.stockQuantity - item.quantity)
          });
        }
      }

      // Update loyalty: deduct redeemed points, add new points
      if (custId) {
        const customer = customersDB.getById(custId);
        if (customer) {
          const newPoints = Math.max(0, (customer.loyaltyPoints || 0) - pointsToRedeem + Math.floor(total / 100));
          customersDB.update(custId, {
            loyaltyPoints: newPoints,
            purchaseHistory: [...(customer.purchaseHistory || []), sale._id]
          });
        }
      }

      setCompletedSale({ ...sale, billNumber, customer: selectedCustomer, items: saleItems, pointsRedeemed: pointsToRedeem, pointsDiscount });
      setCart([]);
      setSelectedCustomer(null);
      setDiscount(0);
      setRedeemPoints(false);
      setPointsToRedeem(0);
      setEditingItem(null);
    } catch (error) {
      alert("Failed to process checkout");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintBill = (sale: any) => {
    const pw = window.open('', '_blank', 'width=300,height=600');
    if (!pw) return;
    const rows = (sale.items || []).map((i: any) => `<tr><td style="font-size:11px">${i.name}</td><td style="text-align:center;font-size:11px">${i.quantity}</td><td style="text-align:right;font-size:11px">₹${i.totalPrice}</td></tr>`).join('');
    const pointsRow = sale.pointsRedeemed > 0 ? `<tr><td colspan="2">Points Redeemed (${sale.pointsRedeemed})</td><td style="text-align:right">-₹${sale.pointsDiscount?.toFixed(2)}</td></tr>` : '';
    pw.document.write(`<!DOCTYPE html><html><head><title>${sale.billNumber}</title><style>body{font-family:monospace;width:72mm;margin:0 auto;padding:8px;font-size:12px}.c{text-align:center}.b{font-weight:bold}.l{border-top:1px dashed #000;margin:6px 0}table{width:100%;border-collapse:collapse}td{padding:2px 0}</style></head><body><div class="c"><img src="/logo.png" width="60"><br><span class="b" style="font-size:14px">MR FANCY STORES</span><br><span style="font-size:10px">Gifts • Fancy • Grocery</span></div><div class="l"></div><div style="font-size:10px"><b>Bill:</b> ${sale.billNumber}<br><b>Date:</b> ${new Date(sale.createdAt).toLocaleString('en-IN')}<br><b>Customer:</b> ${sale.customer?.name || 'Walk-in'}<br><b>Payment:</b> ${sale.paymentMode}</div><div class="l"></div><table><tr class="b"><td>Item</td><td style="text-align:center">Qty</td><td style="text-align:right">Amt</td></tr>${rows}</table><div class="l"></div><table>${sale.discount > 0 ? `<tr><td>Discount</td><td style="text-align:right">-₹${sale.discount}</td></tr>` : ''}${pointsRow}<tr class="b" style="font-size:14px"><td>TOTAL</td><td style="text-align:right">₹${sale.totalAmount.toFixed(2)}</td></tr></table><div class="l"></div><div class="c" style="font-size:10px"><br>Thank you! 🙏</div></body></html>`);
    pw.document.close();
    setTimeout(() => pw.print(), 300);
  };

  const handleWhatsAppBill = (sale: any) => {
    const phone = sale.customer?.phone || '';
    if (!phone) return;
    const items = (sale.items || []).map((i: any) => `• ${i.name} x${i.quantity} = ₹${i.totalPrice}`).join('\n');
    const pointsLine = sale.pointsRedeemed > 0 ? `\n🎁 Points Redeemed: ${sale.pointsRedeemed} (-₹${sale.pointsDiscount?.toFixed(2)})` : '';
    const msg = encodeURIComponent(`🧾 *MR FANCY STORES*\n━━━━━━━━━━━━━━━\n📋 Bill: ${sale.billNumber}\n📅 ${new Date(sale.createdAt).toLocaleString('en-IN')}\n👤 ${sale.customer?.name || 'Walk-in'}\n━━━━━━━━━━━━━━━\n${items}\n━━━━━━━━━━━━━━━${pointsLine}\n💰 *Total: ₹${sale.totalAmount.toFixed(2)}*\n💳 Paid via: ${sale.paymentMode}\n\nThank you! 🙏`);
    window.open(`https://wa.me/${phone.startsWith('+') ? phone : '91' + phone}?text=${msg}`, '_blank');
  };

  return (
    <AppShell>
      {/* Post-Checkout Bill Modal */}
      {completedSale && (
        <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-ivory rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg, #0F2640, #1E3A5F)' }}>
              <div className="w-14 h-14 bg-success rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Payment Successful!</h3>
              <p className="text-gold-light text-sm font-bold mt-1">{completedSale.billNumber}</p>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-brown/50">Customer</span><span className="font-bold text-navy">{completedSale.customer?.name || 'Walk-in'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-brown/50">Payment</span><span className="font-bold text-navy">{completedSale.paymentMode}</span></div>
              {completedSale.pointsRedeemed > 0 && (
                <div className="flex justify-between text-sm"><span className="text-brown/50">Points Redeemed</span><span className="font-bold text-gold">{completedSale.pointsRedeemed} pts (-₹{completedSale.pointsDiscount?.toFixed(2)})</span></div>
              )}
              <div className="border-t border-border/30 pt-3 flex justify-between"><span className="text-lg font-bold text-navy">Total Paid</span><span className="text-2xl font-black text-gold">₹{completedSale.totalAmount?.toFixed(2)}</span></div>
              <div className="border-t border-border/30 pt-3 space-y-1">
                {(completedSale.items || []).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs text-brown/50"><span>{item.name} x{item.quantity}</span><span>₹{item.totalPrice}</span></div>
                ))}
              </div>
            </div>
            <div className="p-6 bg-cream/50 border-t border-border/30 space-y-3">
              <div className="flex gap-3">
                <Button variant="primary" className="flex-1 gap-2 h-12" onClick={() => handlePrintBill(completedSale)}><Printer className="w-4 h-4" /> Print Bill</Button>
                <Button variant="accent" className="flex-1 gap-2 h-12" onClick={() => handleWhatsAppBill(completedSale)} disabled={!completedSale.customer?.phone}><Share2 className="w-4 h-4" /> WhatsApp</Button>
              </div>
              <Button variant="ghost" className="w-full" onClick={() => setCompletedSale(null)}>Close & New Order</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
        
        {/* Left Side: Product Selection */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brown/40 group-focus-within:text-gold transition-colors" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Scan barcode or search items (F1)..." 
                className="w-full bg-ivory border-none rounded-2xl py-4 h-14 pl-12 pr-4 text-lg shadow-sm ring-1 ring-border focus:ring-2 focus:ring-gold/40 transition-all outline-none text-navy"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
              {products.map((product) => (
                <Card 
                  key={product._id} 
                  className={cn(
                    "cursor-pointer group hover:ring-2 hover:ring-gold/40 transition-all border-none bg-ivory p-4 flex flex-col justify-between h-48",
                    product.stockQuantity < product.lowStockThreshold ? "ring-1 ring-crimson/20" : ""
                  )}
                  onClick={() => addToCart(product)}
                >
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-brown/50 uppercase tracking-tighter">{product.category}</span>
                      {product.stockQuantity < product.lowStockThreshold && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-crimson/10 text-crimson font-black rounded-sm">LOW</span>
                      )}
                    </div>
                    <h4 className="font-bold text-navy leading-tight group-hover:text-gold transition-colors">{product.name}</h4>
                    <p className="text-[10px] text-brown/40 font-mono tracking-wider">{product.sku}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-lg font-black text-navy">₹{product.sellingPrice}</p>
                    <div className="p-2 rounded-lg bg-cream text-brown/30 group-hover:bg-gold group-hover:text-white transition-all">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Cart & Checkout */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <Card className="flex-1 flex flex-col border-none shadow-xl bg-ivory overflow-hidden rounded-3xl">
            <div className="text-white p-6" style={{ background: 'linear-gradient(135deg, #0F2640 0%, #1E3A5F 100%)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold/20 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-gold-light" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">Current Order</CardTitle>
                    <p className="text-[10px] text-gold-light/60 font-bold uppercase tracking-widest">{cart.length} items in cart</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10" onClick={() => { setCart([]); setEditingItem(null); }}>
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              <CustomerSelect 
                selectedCustomer={selectedCustomer} 
                onSelect={(c) => { setSelectedCustomer(c as any); setRedeemPoints(false); setPointsToRedeem(0); }} 
              />
              
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-brown/20 gap-4 py-12">
                  <Package className="w-16 h-16 stroke-[1px]" />
                  <p className="font-medium">Cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="rounded-xl bg-cream/50 border border-transparent hover:border-gold/20 transition-all overflow-hidden">
                    {/* Main row */}
                    <div className="flex items-center gap-2 p-3">
                      <div className="flex-1 text-left min-w-0">
                        <h5 className="text-sm font-bold text-navy line-clamp-1">{item.name}</h5>
                        {editingItem !== item.id && (
                          <p className="text-xs font-semibold text-brown/50">₹{item.price} each</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 bg-ivory px-2 py-1 rounded-lg border border-border">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-0.5 hover:text-gold transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          className="w-8 text-center text-sm font-black text-navy bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={item.quantity}
                          onChange={(e) => setQuantity(item.id, parseInt(e.target.value) || 1)}
                          min={1}
                        />
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-0.5 hover:text-gold transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm font-black text-navy min-w-[50px] text-right">₹{(item.price * item.quantity).toFixed(0)}</p>
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => setEditingItem(editingItem === item.id ? null : item.id)} className={cn("p-1 rounded transition-colors", editingItem === item.id ? "text-gold bg-gold/10" : "text-brown/30 hover:text-gold")}>
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button onClick={() => removeFromCart(item.id)} className="p-1 rounded text-brown/30 hover:text-crimson transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {/* Expanded edit row */}
                    {editingItem === item.id && (
                      <div className="px-3 pb-3 space-y-2 border-t border-border/20 pt-2">
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-brown/40 uppercase w-12">Price</label>
                          <div className="flex items-center gap-1 bg-ivory border border-border rounded-lg px-2 py-1 flex-1">
                            <span className="text-xs text-brown/40">₹</span>
                            <input
                              type="number"
                              className="w-full text-sm font-bold text-navy bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              value={item.price}
                              onChange={(e) => setPrice(item.id, Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-brown/40 uppercase w-12">Note</label>
                          <input
                            type="text"
                            placeholder="e.g. Gift wrap, special request..."
                            className="w-full text-xs bg-ivory border border-border rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-gold/20 text-navy"
                            value={item.note || ''}
                            onChange={(e) => setNote(item.id, e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-5 p-6 bg-cream/80 border-t border-border/30">
              <div className="space-y-3 w-full">
                {/* Payment mode buttons */}
                <div className="flex gap-2">
                  <Button variant={paymentMode === 'Cash' ? 'primary' : 'outline'} className="flex-1 h-10 rounded-xl gap-1.5 font-bold text-xs" onClick={() => setPaymentMode('Cash')}>
                    <Banknote className="w-4 h-4" /> Cash
                  </Button>
                  <Button variant={paymentMode === 'UPI' ? 'accent' : 'outline'} className="flex-1 h-10 rounded-xl gap-1.5 font-bold text-xs" onClick={() => setPaymentMode('UPI')}>
                    <Smartphone className="w-4 h-4" /> UPI
                  </Button>
                  <Button variant={paymentMode === 'Card' ? 'secondary' : 'outline'} className="flex-1 h-10 rounded-xl gap-1.5 font-bold text-xs" onClick={() => setPaymentMode('Card')}>
                    <CreditCard className="w-4 h-4" /> Card
                  </Button>
                </div>

                {/* Loyalty points redemption */}
                {selectedCustomer && customerPoints > 0 && (
                  <div className="bg-gold/5 border border-gold/20 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-gold fill-gold" />
                        <span className="text-xs font-bold text-navy">{customerPoints} pts available</span>
                        <span className="text-[10px] text-brown/40">(₹{settings.pointValue}/pt)</span>
                      </div>
                      <button
                        onClick={() => setRedeemPoints(!redeemPoints)}
                        className={cn(
                          "w-10 h-5 rounded-full transition-all relative",
                          redeemPoints ? "bg-gold" : "bg-brown/20"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm",
                          redeemPoints ? "left-5.5" : "left-0.5"
                        )} style={{ left: redeemPoints ? '22px' : '2px' }} />
                      </button>
                    </div>
                    {redeemPoints && pointsToRedeem > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gold font-bold flex items-center gap-1"><Gift className="w-3 h-3" /> Redeeming {pointsToRedeem} pts</span>
                        <span className="font-black text-gold">-₹{pointsDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Price summary */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-brown/50 font-semibold text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gold font-bold text-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3 h-3" />
                      <span>Discount</span>
                    </div>
                    <input 
                      type="number" 
                      className="w-20 bg-transparent border-b border-gold/20 text-right outline-none p-0 focus:border-gold text-gold font-bold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                  </div>
                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-gold font-bold text-sm">
                      <span className="flex items-center gap-2"><Star className="w-3 h-3 fill-gold" /> Points</span>
                      <span>-₹{pointsDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-black text-navy pt-2">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button 
                className={cn(
                  "w-full h-14 rounded-2xl text-lg font-black gap-3 shadow-xl transition-all hover:-translate-y-1 active:scale-[0.98]",
                  cart.length > 0 ? "shadow-gold/20" : "opacity-50"
                )} 
                variant="accent"
                disabled={cart.length === 0}
                onClick={handleCheckout}
                isLoading={isLoading}
              >
                <Zap className="w-5 h-5 fill-white" />
                PAY ₹{total.toFixed(2)}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
