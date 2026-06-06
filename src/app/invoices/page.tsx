"use client";

import React, { useState, useEffect } from 'react';
import AppShell from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button, cn } from "@/components/ui/Button";
import { Receipt, Search, Printer, Share2, Eye, Phone, Calendar, Filter } from "lucide-react";
import { salesDB, customersDB, seedDatabase } from "@/lib/localdb";

export default function InvoicesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState<any>(null);

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
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (!printWindow) return;
    const itemsHtml = (sale.items || []).map((item: any) =>
      `<tr><td style="text-align:left;font-size:11px">${item.name}</td><td style="text-align:center;font-size:11px">${item.quantity}</td><td style="text-align:right;font-size:11px">₹${item.totalPrice}</td></tr>`
    ).join('');
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Bill ${sale.billNumber}</title>
    <style>body{font-family:monospace;width:72mm;margin:0 auto;padding:8px;font-size:12px}
    .center{text-align:center}.bold{font-weight:bold}.line{border-top:1px dashed #000;margin:6px 0}
    table{width:100%;border-collapse:collapse}td{padding:2px 0}</style></head><body>
    <div class="center"><img src="/logo.png" width="60" style="margin-bottom:4px"><br>
    <span class="bold" style="font-size:14px">MR FANCY STORES</span><br>
    <span style="font-size:10px">Gifts • Fancy • Grocery</span><br>
    <span style="font-size:9px">Tamil Nadu, India</span></div>
    <div class="line"></div>
    <div style="font-size:10px"><strong>Bill:</strong> ${sale.billNumber}<br>
    <strong>Date:</strong> ${new Date(sale.createdAt).toLocaleString('en-IN')}<br>
    <strong>Customer:</strong> ${sale.customer?.name}<br>
    <strong>Payment:</strong> ${sale.paymentMode}</div>
    <div class="line"></div>
    <table><tr class="bold"><td>Item</td><td style="text-align:center">Qty</td><td style="text-align:right">Amt</td></tr>
    <tr><td colspan="3"><div class="line" style="margin:2px 0"></div></td></tr>${itemsHtml}</table>
    <div class="line"></div>
    <table><tr><td>Subtotal</td><td style="text-align:right">₹${(sale.totalAmount + (sale.discount || 0)).toFixed(2)}</td></tr>
    ${sale.discount > 0 ? `<tr><td>Discount</td><td style="text-align:right">-₹${sale.discount.toFixed(2)}</td></tr>` : ''}
    <tr class="bold" style="font-size:14px"><td>TOTAL</td><td style="text-align:right">₹${sale.totalAmount.toFixed(2)}</td></tr></table>
    <div class="line"></div>
    <div class="center" style="font-size:10px"><br>Thank you for shopping!<br>Visit again 🙏</div>
    </body></html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 300);
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
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-navy">Invoices & Bills</h2>
            <p className="text-brown/60 font-medium">View, print, and share all your transaction records.</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-brown/40">
            <Receipt className="w-4 h-4" /> {sales.length} Total Bills
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
