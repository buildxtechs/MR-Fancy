"use client";

import React, { useState, useEffect } from 'react';
import AppShell from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button, cn } from "@/components/ui/Button";
import { Plus, Search, Filter, Edit3, Trash2, ArrowUpDown, Package, X } from "lucide-react";
import { productsDB, seedDatabase } from "@/lib/localdb";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: 'Fancy', costPrice: 0, sellingPrice: 0, stockQuantity: 0, sku: '', barcode: '', lowStockThreshold: 10, unit: 'pcs'
  });

  useEffect(() => {
    seedDatabase();
    fetchProducts();
    const handleSync = () => fetchProducts();
    window.addEventListener('mrfancy_db_synced', handleSync);
    return () => window.removeEventListener('mrfancy_db_synced', handleSync);
  }, [search]);

  const fetchProducts = () => {
    const items = productsDB.getAll({ q: search });
    setProducts(items);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    productsDB.create(formData);
    setIsModalOpen(false);
    fetchProducts();
    setFormData({ name: '', category: 'Fancy', costPrice: 0, sellingPrice: 0, stockQuantity: 0, sku: '', barcode: '', lowStockThreshold: 10, unit: 'pcs' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      productsDB.delete(id);
      fetchProducts();
    }
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Product Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl border-none shadow-2xl animate-fade-in overflow-hidden">
              <div className="p-6 text-center relative" style={{ background: 'linear-gradient(135deg, #0F2640, #1E3A5F)' }}>
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <img src="/logo.png" className="w-10 h-10 object-contain" alt="Store Logo" />
                </div>
                <h3 className="text-xl font-bold text-white">Add New Product</h3>
                <button
                  type="button"
                  className="absolute right-4 top-4 text-white/60 hover:text-white transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <CardContent className="p-8 grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight">Product Name</label>
                    <input required className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold/20 text-navy" placeholder="e.g. Leather Wallet M-542" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight">Category</label>
                    <select className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none text-navy" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                      {['Fancy', 'Gifts', 'Grocery', 'Custom'].map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight">SKU / Code</label>
                    <input required className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none text-navy" placeholder="SKU-001" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight">Barcode (Optional)</label>
                    <input className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold/20 text-navy" placeholder="e.g. 890123456001" value={formData.barcode} onChange={(e) => setFormData({...formData, barcode: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight">Cost Price (₹)</label>
                    <input type="number" required className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none text-navy" value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight">Selling Price (₹)</label>
                    <input type="number" required className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none text-navy" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight">Initial Stock</label>
                    <input type="number" required className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none text-navy" value={formData.stockQuantity} onChange={(e) => setFormData({...formData, stockQuantity: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight">Low Stock Alert</label>
                    <input type="number" className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none text-navy" value={formData.lowStockThreshold} onChange={(e) => setFormData({...formData, lowStockThreshold: Number(e.target.value)})} />
                  </div>
                </CardContent>
                <CardFooter className="p-6 bg-cream flex gap-3">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="accent" className="flex-1">Create Product</Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-navy">Inventory Management</h2>
            <p className="text-brown/60 font-medium">Manage your products, stock levels, and pricing.</p>
          </div>
          <Button className="gap-2 h-12 px-6 rounded-xl shadow-lg shadow-gold/20" variant="accent" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-5 h-5" />
            Add New Product
          </Button>
        </div>

        <Card className="border-none shadow-sm bg-ivory overflow-hidden rounded-2xl">
          <CardHeader className="p-6 border-b border-border/30 flex flex-row items-center justify-between bg-cream/30">
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40 group-focus-within:text-gold transition-colors" />
                <input type="text" placeholder="Search by SKU, name, or barcode..." className="w-full bg-ivory border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-gold/20 transition-all outline-none border text-navy" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="text-sm font-bold text-brown/50 uppercase tracking-widest bg-cream px-3 py-1 rounded-full">
              {products.length} Items Total
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-cream/50 text-[11px] font-black text-brown/50 uppercase tracking-widest border-b border-border/30">
                    <th className="px-6 py-4">Product Details</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price (Cost/Sell)</th>
                    <th className="px-6 py-4">Stock Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2 text-brown/20">
                          <Package className="w-12 h-12 stroke-[1px]" />
                          <p className="font-medium">No products found</p>
                          <Button variant="ghost" size="sm" onClick={() => setSearch('')}>Clear Search</Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p._id} className="hover:bg-cream/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-bold text-navy group-hover:text-gold transition-colors">{p.name}</p>
                            <p className="text-[10px] font-mono text-brown/40 uppercase tracking-wider">
                              SKU: {p.sku}{p.barcode ? ` | Barcode: ${p.barcode}` : ''}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-2.5 py-1 bg-cream text-brown/60 rounded-lg text-[10px] font-bold uppercase tracking-tight">{p.category}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm">
                            <p className="text-brown/30 line-through text-[10px]">₹{p.costPrice}</p>
                            <p className="font-black text-navy">₹{p.sellingPrice}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <p className={p.stockQuantity < p.lowStockThreshold ? "text-crimson font-black text-sm" : "text-navy font-black text-sm"}>
                                {p.stockQuantity} {p.unit}
                              </p>
                              {p.stockQuantity < p.lowStockThreshold && (
                                <span className="p-1 bg-crimson/10 text-crimson rounded-full animate-pulse">
                                  <ArrowUpDown className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <div className="w-24 h-1.5 bg-cream rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${p.stockQuantity < p.lowStockThreshold ? 'bg-crimson' : 'bg-success'}`}
                                style={{ width: `${Math.min(100, (p.stockQuantity / (p.lowStockThreshold * 3)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-brown/40 hover:text-gold">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-brown/40 hover:text-crimson" onClick={() => handleDelete(p._id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
