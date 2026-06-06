"use client";

import React, { useState, useEffect } from 'react';
import AppShell from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button, cn } from "@/components/ui/Button";
import { Truck, Search, Plus, Phone, MapPin, CreditCard, Package, X, Edit3, Trash2 } from "lucide-react";
import { vendorsDB, seedDatabase } from "@/lib/localdb";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', productsSupplied: '', creditBalance: 0 });

  useEffect(() => {
    seedDatabase();
    fetchVendors();
  }, [search]);

  const fetchVendors = () => {
    setVendors(vendorsDB.getAll({ q: search }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      productsSupplied: formData.productsSupplied.split(',').map(s => s.trim()).filter(Boolean),
    };
    if (editingVendor) {
      vendorsDB.update(editingVendor._id, data);
    } else {
      vendorsDB.create(data);
    }
    setIsModalOpen(false);
    setEditingVendor(null);
    fetchVendors();
    setFormData({ name: '', phone: '', address: '', productsSupplied: '', creditBalance: 0 });
  };

  const handleEdit = (vendor: any) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      phone: vendor.phone,
      address: vendor.address || '',
      productsSupplied: (vendor.productsSupplied || []).join(', '),
      creditBalance: vendor.creditBalance || 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete vendor "${name}"? This cannot be undone.`)) {
      vendorsDB.delete(id);
      fetchVendors();
    }
  };

  const openCreateModal = () => {
    setEditingVendor(null);
    setFormData({ name: '', phone: '', address: '', productsSupplied: '', creditBalance: 0 });
    setIsModalOpen(true);
  };

  const totalCredit = vendors.reduce((s, v) => s + (v.creditBalance || 0), 0);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        {isModalOpen && (
          <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-none shadow-2xl animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between p-6 bg-cream">
                <CardTitle>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</CardTitle>
                <X className="w-5 h-5 text-brown/40 cursor-pointer hover:text-navy" onClick={() => { setIsModalOpen(false); setEditingVendor(null); }} />
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="p-8 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight">Vendor Name</label>
                    <input required className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold/20 text-navy" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight">Phone</label>
                    <input required className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none text-navy" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight">Address</label>
                    <input className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none text-navy" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight">Products Supplied (comma separated)</label>
                    <input className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none text-navy" placeholder="FW-001, HC-004" value={formData.productsSupplied} onChange={(e) => setFormData({...formData, productsSupplied: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight">Credit Balance (₹)</label>
                    <input type="number" className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none text-navy" value={formData.creditBalance} onChange={(e) => setFormData({...formData, creditBalance: Number(e.target.value)})} />
                  </div>
                </CardContent>
                <div className="p-6 bg-cream flex gap-3">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => { setIsModalOpen(false); setEditingVendor(null); }}>Cancel</Button>
                  <Button type="submit" variant="accent" className="flex-1">{editingVendor ? 'Save Changes' : 'Add Vendor'}</Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-navy">Vendor Management</h2>
            <p className="text-brown/60 font-medium">Track suppliers, product sourcing, and credit balances.</p>
          </div>
          <Button className="gap-2 h-12 px-6 rounded-xl shadow-lg shadow-gold/20" variant="accent" onClick={openCreateModal}>
            <Plus className="w-5 h-5" /> Add Vendor
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm bg-ivory p-6 flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-gold/10 text-gold rounded-full"><Truck className="w-6 h-6" /></div>
            <p className="text-2xl font-black text-navy">{vendors.length}</p>
            <p className="text-xs font-bold text-brown/40 uppercase tracking-widest">Total Vendors</p>
          </Card>
          <Card className="border-none shadow-sm bg-ivory p-6 flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-crimson/10 text-crimson rounded-full"><CreditCard className="w-6 h-6" /></div>
            <p className="text-2xl font-black text-crimson">₹{totalCredit.toLocaleString()}</p>
            <p className="text-xs font-bold text-brown/40 uppercase tracking-widest">Pending Credit</p>
          </Card>
          <Card className="border-none shadow-sm bg-ivory p-6 flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-success/10 text-success rounded-full"><Package className="w-6 h-6" /></div>
            <p className="text-2xl font-black text-navy">{vendors.reduce((s, v) => s + (v.productsSupplied?.length || 0), 0)}</p>
            <p className="text-xs font-bold text-brown/40 uppercase tracking-widest">Products Supplied</p>
          </Card>
        </div>

        <Card className="border-none shadow-sm bg-ivory overflow-hidden rounded-2xl">
          <CardHeader className="p-6 border-b border-border/30 bg-cream/30">
            <div className="flex-1 max-w-md relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40 group-focus-within:text-gold transition-colors" />
              <input type="text" placeholder="Search vendors..." className="w-full bg-ivory border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-gold/20 outline-none border text-navy" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream/50 text-[11px] font-black text-brown/50 uppercase tracking-widest border-b border-border/30">
                  <th className="px-6 py-4">Vendor</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Products</th><th className="px-6 py-4">Credit</th><th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {vendors.length === 0 ? (
                  <tr><td colSpan={5} className="py-20 text-center text-brown/30 italic">No vendors found</td></tr>
                ) : vendors.map(v => (
                  <tr key={v._id} className="hover:bg-cream/50 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="font-bold text-navy">{v.name}</p>
                      {v.address && <p className="text-[10px] text-brown/40 flex items-center gap-1"><MapPin className="w-3 h-3" />{v.address}</p>}
                    </td>
                    <td className="px-6 py-5 text-xs text-brown/50"><div className="flex items-center gap-1"><Phone className="w-3 h-3" />{v.phone}</div></td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1">
                        {(v.productsSupplied || []).map((p: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-cream rounded text-[10px] font-mono text-brown/50">{p}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn("font-black", v.creditBalance > 0 ? "text-crimson" : "text-success")}>
                        ₹{(v.creditBalance || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-brown/40 hover:text-gold" onClick={() => handleEdit(v)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-brown/40 hover:text-crimson" onClick={() => handleDelete(v._id, v.name)}>
                          <Trash2 className="w-4 h-4" />
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
