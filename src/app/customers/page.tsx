"use client";

import React, { useState, useEffect } from 'react';
import AppShell from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button, cn } from "@/components/ui/Button";
import { Users, Search, Plus, MessageSquare, History, Star, Phone, X, Edit3, Trash2 } from "lucide-react";
import { customersDB, seedDatabase } from "@/lib/localdb";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', segment: 'Regular' });

  useEffect(() => {
    seedDatabase();
    fetchCustomers();
    const handleSync = () => fetchCustomers();
    window.addEventListener('mrfancy_db_synced', handleSync);
    return () => window.removeEventListener('mrfancy_db_synced', handleSync);
  }, [search]);

  const fetchCustomers = () => {
    setCustomers(customersDB.getAll({ q: search }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      // Check for duplicate phone among other customers
      const existing = customersDB.getAll();
      if (existing.some((c: any) => c.phone === formData.phone && c._id !== editingCustomer._id)) {
        alert('Customer with this phone already exists');
        return;
      }
      // Update existing customer
      customersDB.update(editingCustomer._id, {
        name: formData.name,
        phone: formData.phone,
        segment: formData.segment,
      });
    } else {
      // Create new customer
      const existing = customersDB.getAll({ q: formData.phone });
      if (existing.some((c: any) => c.phone === formData.phone)) {
        alert('Customer with this phone already exists');
        return;
      }
      customersDB.create({ ...formData, loyaltyPoints: 0, purchaseHistory: [] });
    }
    setIsModalOpen(false);
    setEditingCustomer(null);
    fetchCustomers();
    setFormData({ name: '', phone: '', segment: 'Regular' });
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({ name: customer.name, phone: customer.phone, segment: customer.segment || 'Regular' });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete customer "${name}"? This cannot be undone.`)) {
      customersDB.delete(id);
      fetchCustomers();
    }
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', segment: 'Regular' });
    setIsModalOpen(true);
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        {isModalOpen && (
          <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-none shadow-2xl animate-fade-in overflow-hidden">
              <div className="p-6 text-center relative" style={{ background: 'linear-gradient(135deg, #0F2640, #1E3A5F)' }}>
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <img src="/logo.png" className="w-10 h-10 object-contain" alt="Store Logo" />
                </div>
                <h3 className="text-xl font-bold text-white">{editingCustomer ? 'Edit Customer' : 'Register New Customer'}</h3>
                <button
                  type="button"
                  className="absolute right-4 top-4 text-white/60 hover:text-white transition-colors"
                  onClick={() => { setIsModalOpen(false); setEditingCustomer(null); }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight">Full Name</label>
                    <input required className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold/20 text-navy" placeholder="e.g. Ramesh Kumar" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight">Mobile Number</label>
                    <input required className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none text-navy" placeholder="9876543210" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-navy uppercase tracking-tight">Segment</label>
                    <select className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none text-navy" value={formData.segment} onChange={(e) => setFormData({...formData, segment: e.target.value})}>
                      <option>Regular</option><option>VIP</option><option>High Spender</option>
                    </select>
                  </div>
                </CardContent>
                <div className="p-6 bg-cream flex gap-3">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => { setIsModalOpen(false); setEditingCustomer(null); }}>Cancel</Button>
                  <Button type="submit" variant="accent" className="flex-1">{editingCustomer ? 'Save Changes' : 'Register Customer'}</Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-navy">Customer CRM</h2>
            <p className="text-brown/60 font-medium">Manage your relationships and loyalty programs.</p>
          </div>
          <Button className="gap-2 h-12 px-6 rounded-xl shadow-lg shadow-gold/20" variant="accent" onClick={openCreateModal}>
            <Plus className="w-5 h-5" /> Add Customer
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Users, val: customers.length, label: 'Total Registered', color: 'bg-gold/10 text-gold' },
            { icon: Star, val: customers.filter(c => c.segment === 'VIP').length, label: 'VIP Members', color: 'bg-success/10 text-success' },
            { icon: History, val: customers.filter(c => (c.purchaseHistory?.length || 0) > 0).length, label: 'Repeat Buyers', color: 'bg-gold/10 text-gold' },
          ].map((s, i) => (
            <Card key={i} className="border-none shadow-sm bg-ivory p-6 flex flex-col items-center text-center gap-2">
              <div className={`p-3 rounded-full ${s.color}`}><s.icon className="w-6 h-6" /></div>
              <p className="text-2xl font-black text-navy">{s.val}</p>
              <p className="text-xs font-bold text-brown/40 uppercase tracking-widest">{s.label}</p>
            </Card>
          ))}
        </div>

        <Card className="border-none shadow-sm bg-ivory overflow-hidden rounded-2xl">
          <CardHeader className="p-6 border-b border-border/30 flex flex-row items-center justify-between bg-cream/30">
            <div className="flex-1 max-w-md relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40 group-focus-within:text-gold transition-colors" />
              <input type="text" placeholder="Search by name or phone..." className="w-full bg-ivory border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-gold/20 outline-none border text-navy" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream/50 text-[11px] font-black text-brown/50 uppercase tracking-widest border-b border-border/30">
                  <th className="px-6 py-4">Customer</th><th className="px-6 py-4">Points</th><th className="px-6 py-4">Segment</th><th className="px-6 py-4">Orders</th><th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {customers.length === 0 ? (
                  <tr><td colSpan={5} className="py-20 text-center text-brown/30 italic">No customers found</td></tr>
                ) : customers.map((c) => (
                  <tr key={c._id} className="hover:bg-cream/50 transition-colors group">
                    <td className="px-6 py-5"><p className="font-bold text-navy">{c.name}</p><p className="text-xs text-brown/40 flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</p></td>
                    <td className="px-6 py-5"><span className="font-black text-gold">{c.loyaltyPoints || 0} pts</span></td>
                    <td className="px-6 py-5"><span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase", c.segment === 'VIP' ? "bg-gold/10 text-gold" : "bg-cream text-brown/60")}>{c.segment || 'Regular'}</span></td>
                    <td className="px-6 py-5 text-xs text-brown/50">{c.purchaseHistory?.length || 0} Orders</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-brown/40 hover:text-gold" onClick={() => handleEdit(c)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-brown/40 hover:text-crimson" onClick={() => handleDelete(c._id, c.name)}>
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
