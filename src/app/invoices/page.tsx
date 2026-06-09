"use client";

import React, { useState, useEffect } from 'react';
import AppShell from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button, cn } from "@/components/ui/Button";
import { Receipt, Search, Printer, Share2, Eye, Phone, Calendar, Filter } from "lucide-react";
import { salesDB, customersDB, seedDatabase } from "@/lib/localdb";

function getSettings() {
  if (typeof window === 'undefined') return {
    name: 'MR Fancy Stores',
    tagline: 'Gifts • Fancy • Grocery',
    phone: '+91 98765 43210',
    address: 'Chengam',
    gst: '33AABCU9603R1ZM',
    gstEnabled: false,
    pointValue: 0.5,
  };
  const raw = localStorage.getItem('mrfancy_settings');
  const settings = raw ? JSON.parse(raw) : {};
  return {
    name: settings.name || 'MR Fancy Stores',
    tagline: settings.tagline || 'Gifts • Fancy • Grocery',
    phone: settings.phone || '+91 98765 43210',
    address: settings.address || 'Chengam',
    gst: settings.gst || '33AABCU9603R1ZM',
    gstEnabled: settings.gstEnabled ?? false,
    pointValue: settings.pointValue ?? 0.5,
  };
}

export default function InvoicesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleClearImmediately = async () => {
    setShowClearModal(false);
    localStorage.removeItem('mrfancy_sales');
    try {
      await fetch('/api/sales?all=true', { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to clear sales in cloud:', e);
    }
    fetchSales();
    window.dispatchEvent(new Event('mrfancy_db_synced'));
    alert('All sales records have been cleared.');
  };

  const handlePrintSummaryAndClear = async () => {
    const pw = window.open('', '_blank', 'width=300,height=600');
    if (!pw) return;

    const settings = getSettings();
    const d = new Date();
    const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const totalAmt = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const rows = sales.map(s => `
      <tr>
        <td style="font-size:11px; text-align:left;">${s.billNumber}</td>
        <td style="font-size:11px; text-align:right;">₹${s.totalAmount.toFixed(2)}</td>
      </tr>
    `).join('');

    pw.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Sales Summary Report</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 80mm;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
    }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      line-height: 1.3;
      color: #000000;
      padding: 4px 6px;
      box-sizing: border-box;
    }
    .c { text-align: center; }
    .b { font-weight: bold; }
    .line {
      border-top: 1px dashed #000;
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    td, th {
      padding: 2px 0;
    }
  </style>
</head>
<body>
  <div class="c b" style="font-size:14px;">SALES RESET SUMMARY</div>
  <div class="c">${settings.name.toUpperCase()}</div>
  <div class="line"></div>
  <div style="font-size: 10px;">
    Reset Date: ${dateStr} ${timeStr}<br>
    Total Invoices: ${sales.length}
  </div>
  <div class="line"></div>
  <table>
    <thead>
      <tr class="b">
        <th style="text-align:left; font-size:11px;">Bill Number</th>
        <th style="text-align:right; font-size:11px;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <div class="line"></div>
  <table>
    <tr class="b">
      <td style="font-size:13px;">GRAND TOTAL</td>
      <td style="text-align:right; font-size:13px;">₹${totalAmt.toFixed(2)}</td>
    </tr>
  </table>
  <div class="line"></div>
  <div class="c" style="font-size:10px;">End of Report</div>
  <div class="line"></div>
</body>
</html>`);

    pw.document.close();
    setTimeout(() => {
      pw.print();
      handleClearImmediately();
    }, 500);
  };

  useEffect(() => {
    seedDatabase();
    fetchSales();
    const handleSync = () => fetchSales();
    window.addEventListener('mrfancy_db_synced', handleSync);
    return () => window.removeEventListener('mrfancy_db_synced', handleSync);
  }, [search]);

  const fetchSales = () => {
    let allSales = salesDB.getAll()
      .map((s: any) => ({ ...s, customer: customersDB.getById(s.customer) || { name: 'Walk-in' } }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (search) {
      const q = search.toLowerCase();
      allSales = allSales.filter((s: any) =>
        s.billNumber?.toLowerCase().includes(q) || s.customer?.name?.toLowerCase().includes(q)
      );
    }
    setSales(allSales);
  };

  const handlePrint = (sale: any) => {
    const pw = window.open('', '_blank', 'width=300,height=600');
    if (!pw) return;

    const settings = getSettings();
    const d = new Date(sale.createdAt);
    const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

    const totalQty = (sale.items || []).reduce((sum: number, item: any) => sum + item.quantity, 0);
    const subtotal = (sale.items || []).reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    
    // Calculate tax and subtotal before tax
    const discountVal = sale.discount || 0;
    const pointsDiscountVal = sale.pointsDiscount || 0;
    const finalTotal = sale.totalAmount;
    
    // GST is calculated as inclusive of the final price if enabled
    const isGst = sale.gstEnabled ?? true;
    const taxableAmount = isGst ? (finalTotal / 1.18) : finalTotal;
    const cgst = isGst ? (taxableAmount * 0.09) : 0;
    const sgst = isGst ? (taxableAmount * 0.09) : 0;
    const subTotalBeforeTax = finalTotal - cgst - sgst;

    const rows = (sale.items || []).map((i: any) => `
      <tr>
        <td style="font-size:11px; text-align:left; word-break:break-word; max-width:110px;">${i.name}</td>
        <td style="text-align:center;font-size:11px;">${i.quantity}</td>
        <td style="text-align:right;font-size:11px;">${(i.unitPrice || (i.totalPrice / i.quantity)).toFixed(2)}</td>
        <td style="text-align:right;font-size:11px;">${i.totalPrice.toFixed(2)}</td>
      </tr>
    `).join('');

    const pointsRow = sale.pointsRedeemed > 0 ? `
      <tr>
        <td colspan="3">Points Redeemed (${sale.pointsRedeemed})</td>
        <td style="text-align:right;">-₹${pointsDiscountVal.toFixed(2)}</td>
      </tr>
    ` : '';

    pw.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${sale.billNumber}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 80mm;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
    }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      line-height: 1.3;
      color: #000000;
      padding: 4px 6px;
      box-sizing: border-box;
    }
    .c { text-align: center; }
    .b { font-weight: bold; }
    .r { text-align: right; }
    .store-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 2px;
      letter-spacing: 0.5px;
    }
    .store-tagline {
      font-size: 11px;
      margin-bottom: 2px;
    }
    .store-details {
      font-size: 11px;
      margin-bottom: 4px;
    }
    .line {
      border-top: 1px dashed #000;
      margin: 5px 0;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin: 4px 0;
    }
    .info-table td {
      padding: 1px 0;
      vertical-align: top;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin: 4px 0;
    }
    .items-table th, .items-table td {
      padding: 3px 0;
      vertical-align: top;
    }
    .items-table th {
      font-weight: bold;
      border-bottom: 1px dashed #000;
    }
    .totals-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin: 4px 0;
    }
    .totals-table td {
      padding: 2px 0;
    }
    .total-row {
      font-size: 16px;
      font-weight: bold;
    }
    .footer {
      font-size: 11px;
      margin-top: 6px;
    }
    .footer-thankyou {
      font-size: 12px;
      margin-bottom: 2px;
    }
    .footer-visit {
      font-size: 11px;
      margin-bottom: 4px;
    }
    .footer-store {
      font-size: 12px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="c">
    <div class="store-name">${settings.name.toUpperCase()}</div>
    <div class="store-tagline">${settings.tagline}</div>
    <div class="store-details">
      ${settings.address.toUpperCase()}<br>
      Ph: ${settings.phone}<br>
      GSTIN: ${settings.gst}
    </div>
  </div>

  <div class="line"></div>

  <table class="info-table">
    <tr>
      <td style="width: 55%;">Bill No : ${sale.billNumber}</td>
      <td style="width: 45%; text-align: right;">Date : ${dateStr}</td>
    </tr>
    <tr>
      <td>Customer: ${sale.customer?.name || 'Walk-in'}</td>
      <td style="text-align: right;">Time : ${timeStr}</td>
    </tr>
    <tr>
      <td>Cashier : Admin</td>
      <td style="text-align: right;">Payment : ${sale.paymentMode}</td>
    </tr>
  </table>

  <div class="line"></div>

  <table class="items-table">
    <thead>
      <tr class="b">
        <th style="text-align: left; width: 45%;">Item</th>
        <th style="text-align: center; width: 15%;">Qty</th>
        <th style="text-align: right; width: 20%;">Rate</th>
        <th style="text-align: right; width: 20%;">Amt</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="line"></div>

  <table class="totals-table">
    <tr>
      <td style="width: 45%;">Sub Total</td>
      <td style="text-align: center; width: 15%;">${totalQty}</td>
      <td style="text-align: right; width: 40%;">₹${subTotalBeforeTax.toFixed(2)}</td>
    </tr>
    ${discountVal > 0 ? `<tr><td>Discount</td><td></td><td style="text-align: right;">-₹${discountVal.toFixed(2)}</td></tr>` : ''}
    ${pointsRow}
    ${isGst ? `
    <tr>
      <td>CGST @ 9%</td>
      <td></td>
      <td style="text-align: right;">₹${cgst.toFixed(2)}</td>
    </tr>
    <tr>
      <td>SGST @ 9%</td>
      <td></td>
      <td style="text-align: right;">₹${sgst.toFixed(2)}</td>
    </tr>
    ` : ''}
    <tr class="line"><td colspan="3"></td></tr>
    <tr class="total-row">
      <td style="font-size: 16px;">TOTAL</td>
      <td></td>
      <td style="text-align: right; font-size: 16px;">₹${finalTotal.toFixed(2)}</td>
    </tr>
  </table>

  <div class="line"></div>

  <table class="info-table" style="margin-top: 2px;">
    <tr>
      <td>Payment Mode : ${sale.paymentMode}</td>
    </tr>
  </table>

  <div class="c footer">
    <div class="footer-thankyou">Thank You For Shopping!</div>
    <div class="footer-visit">Visit Again</div>
    <div class="footer-store">${settings.name.toUpperCase()}</div>
  </div>
  <div class="line"></div>
</body>
</html>`);
    pw.document.close();
    setTimeout(() => { pw.print(); }, 300);
  };

  const handleWhatsApp = (sale: any) => {
    const items = (sale.items || []).map((i: any) => `• ${i.name} x${i.quantity} = ₹${i.totalPrice}`).join('\n');
    const msg = encodeURIComponent(
      `🧾 *MR FANCY STORES*\n━━━━━━━━━━━━━━━\n📋 Bill: ${sale.billNumber}\n📅 ${new Date(sale.createdAt).toLocaleString('en-IN')}\n👤 ${sale.customer?.name}\n━━━━━━━━━━━━━━━\n${items}\n━━━━━━━━━━━━━━━\n💰 *Total: ₹${sale.totalAmount.toFixed(2)}*\n💳 Paid via: ${sale.paymentMode}\n\nThank you for shopping! 🙏`
    );
    const phone = sale.customer?.phone || '';
    window.open(`https://wa.me/${phone.startsWith('+') ? phone : '91' + phone}?text=${msg}`, '_blank');
  };

  return (
    <AppShell>
      {/* Clear Invoices Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-ivory rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg, #0F2640, #1E3A5F)' }}>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <img src="/logo.png" className="w-10 h-10 object-contain" alt="Store Logo" />
              </div>
              <h3 className="text-xl font-bold text-white">Reset Invoice Records?</h3>
              <p className="text-gold-light text-xs mt-1">This will permanently delete all sales and invoice records.</p>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-brown/70 leading-relaxed text-center">
                Before clearing, you can print a summary of all current invoices (showing Bill Numbers and totals) for your store records.
              </p>
            </div>
            <div className="p-6 bg-cream/50 border-t border-border/30 space-y-3">
              <div className="flex gap-3">
                <Button variant="accent" className="flex-1 font-bold h-12" onClick={handlePrintSummaryAndClear}>Print & Clear</Button>
                <Button variant="outline" className="flex-1 text-crimson border-crimson/20 hover:bg-crimson/5 font-bold h-12" onClick={handleClearImmediately}>Clear (Skip)</Button>
              </div>
              <Button variant="ghost" className="w-full text-brown/50" onClick={() => setShowClearModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-navy">Invoices & Bills</h2>
            <p className="text-brown/60 font-medium">View, print, and share all your transaction records.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-brown/40">
              <Receipt className="w-4 h-4" /> {sales.length} Total Bills
            </div>
            {sales.length > 0 && (
              <Button 
                variant="outline" 
                className="text-crimson border-crimson/20 hover:bg-crimson/5 h-10 rounded-xl font-bold text-xs"
                onClick={() => setShowClearModal(true)}
              >
                Clear Invoices
              </Button>
            )}
          </div>
        </div>

        <Card className="border-none shadow-sm bg-ivory overflow-hidden rounded-2xl">
          <CardHeader className="p-6 border-b border-border/30 bg-cream/30">
            <div className="flex-1 max-w-md relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40 group-focus-within:text-gold transition-colors" />
              <input type="text" placeholder="Search by bill number or customer..." className="w-full bg-ivory border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-gold/20 outline-none border text-navy" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream/50 text-[11px] font-black text-brown/50 uppercase tracking-widest border-b border-border/30">
                  <th className="px-6 py-4">Bill Number</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {sales.length === 0 ? (
                  <tr><td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-brown/20">
                      <Receipt className="w-12 h-12 stroke-[1px]" />
                      <p className="font-medium">No invoices yet</p>
                      <p className="text-xs">Complete a sale from POS to see bills here</p>
                    </div>
                  </td></tr>
                ) : sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-cream/50 transition-colors group">
                    <td className="px-6 py-4"><span className="font-black text-navy text-sm">{sale.billNumber}</span></td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-navy text-sm">{sale.customer?.name}</p>
                      {sale.customer?.phone && <p className="text-[10px] text-brown/40 flex items-center gap-1"><Phone className="w-3 h-3" />{sale.customer.phone}</p>}
                    </td>
                    <td className="px-6 py-4 text-xs text-brown/50">{new Date(sale.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-4"><span className="font-black text-gold">₹{sale.totalAmount?.toFixed(2)}</span></td>
                    <td className="px-6 py-4"><span className={cn("px-2 py-1 rounded-lg text-[10px] font-bold uppercase", sale.paymentMode === 'Cash' ? 'bg-success/10 text-success' : sale.paymentMode === 'UPI' ? 'bg-gold/10 text-gold' : 'bg-navy/10 text-navy')}>{sale.paymentMode}</span></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-brown/40 hover:text-gold" title="Print" onClick={() => handlePrint(sale)}>
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-brown/40 hover:text-success" title="WhatsApp" onClick={() => handleWhatsApp(sale)}>
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
