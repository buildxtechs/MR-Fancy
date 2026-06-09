"use client";

import React, { useState } from 'react';
import { UserPlus, Search, X, CheckCircle2, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { customersDB, seedDatabase } from '@/lib/localdb';

interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
}

interface CustomerSelectProps {
  onSelect: (customer: Customer | null) => void;
  selectedCustomer: Customer | null;
}

export default function CustomerSelect({ onSelect, selectedCustomer }: CustomerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  React.useEffect(() => {
    seedDatabase();
    if (search.length > 1) {
      setCustomers(customersDB.getAll({ q: search }));
    } else if (search.length === 0 && isOpen) {
      setCustomers(customersDB.getAll());
    } else {
      setCustomers([]);
    }
  }, [search, isOpen]);

  const handleRegister = () => {
    if (!newName || !newPhone) return;
    const existing = customersDB.getAll({ q: newPhone });
    if (existing.some((c: any) => c.phone === newPhone)) {
      alert('Customer with this phone already exists');
      return;
    }
    const customer = customersDB.create({ name: newName, phone: newPhone, loyaltyPoints: 0, segment: 'Regular', purchaseHistory: [] });
    onSelect(customer);
    setIsOpen(false);
    setIsRegistering(false);
    setNewName('');
    setNewPhone('');
  };

  if (selectedCustomer) {
    return (
      <div className="flex items-center justify-between p-3 bg-gold/5 border border-gold/20 rounded-xl mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-white">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-navy">{selectedCustomer.name}</p>
            <p className="text-[10px] text-brown/50 font-bold uppercase tracking-widest">{(selectedCustomer as any).phone} • {(selectedCustomer as any).loyaltyPoints || 0} pts</p>
          </div>
        </div>
        <button onClick={() => onSelect(null)} className="text-brown/30 hover:text-crimson p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative mb-4">
      {!isOpen ? (
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 py-6 rounded-xl border-dashed border-2 text-brown/40 hover:text-gold hover:border-gold hover:bg-gold/5 transition-all"
          onClick={() => setIsOpen(true)}
        >
          <UserPlus className="w-5 h-5" />
          Link Customer (Optional)
        </Button>
      ) : (
        <Card className="p-4 border-gold shadow-xl animate-fade-in">
          {!isRegistering ? (
            <>
              <div className="flex items-center gap-2 mb-4 bg-cream rounded-lg px-3">
                <Search className="w-4 h-4 text-brown/40" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Search by name or mobile..." 
                  className="flex-1 bg-transparent py-2 text-sm outline-none text-navy"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  type="button"
                  title="Add Customer"
                  className="p-1.5 bg-gold/10 hover:bg-gold/20 text-gold rounded-md flex items-center justify-center transition-colors"
                  onClick={() => setIsRegistering(true)}
                >
                  <UserPlus className="w-4 h-4" />
                </button>
                <X className="w-4 h-4 text-brown/30 cursor-pointer hover:text-navy" onClick={() => setIsOpen(false)} />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                {customers.length > 0 ? (
                  customers.map((c: any) => (
                    <div 
                      key={c._id} 
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-cream cursor-pointer transition-colors"
                      onClick={() => { onSelect(c); setIsOpen(false); }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-cream rounded-lg flex items-center justify-center text-brown/40">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-navy">{c.name}</p>
                          <p className="text-xs text-brown/40">{c.phone}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-xs text-brown/30 mb-3">No customer found</p>
                    <Button size="sm" variant="accent" className="rounded-lg" onClick={() => setIsRegistering(true)}>Create New Customer</Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-navy">New Customer</h4>
                <X className="w-4 h-4 text-brown/30 cursor-pointer" onClick={() => setIsRegistering(false)} />
              </div>
              <div className="space-y-3">
                <input placeholder="Full Name" className="w-full bg-cream rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gold text-navy" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <input placeholder="Mobile Number" className="w-full bg-cream rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gold text-navy" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1" onClick={() => setIsRegistering(false)}>Cancel</Button>
                  <Button variant="accent" className="flex-1" onClick={handleRegister}>Create & Link</Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
