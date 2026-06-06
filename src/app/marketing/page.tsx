"use client";

import React, { useState, useEffect } from 'react';
import AppShell from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button, cn } from "@/components/ui/Button";
import { MessageSquare, Send, Users, Phone, Gift, Bell, Megaphone, Calendar } from "lucide-react";
import { customersDB, seedDatabase } from "@/lib/localdb";

export default function MarketingPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('All');

  const loadData = () => {
    setCustomers(customersDB.getAll());
  };

  useEffect(() => {
    seedDatabase();
    loadData();
    const handleSync = () => loadData();
    window.addEventListener('mrfancy_db_synced', handleSync);
    return () => window.removeEventListener('mrfancy_db_synced', handleSync);
  }, []);

  const filteredCustomers = selectedSegment === 'All'
    ? customers
    : customers.filter(c => c.segment === selectedSegment);

  const templates = [
    { title: '🎉 Festival Offer', body: 'Dear {name}, celebrate this festive season with 20% OFF on all Fancy items at MR Fancy Stores! Visit us today. 🎊', icon: Gift },
    { title: '🆕 New Arrivals', body: 'Hi {name}! Fresh stock just arrived — Premium Watches, Silk Pouches & more! Come explore. ✨', icon: Bell },
    { title: '💰 Loyalty Reward', body: 'Congrats {name}! You have {points} loyalty points. Redeem them on your next purchase! 🎁', icon: Megaphone },
    { title: '📅 Reminder', body: 'Hi {name}, it\'s been a while! Visit MR Fancy Stores for exclusive deals this week. We miss you! 🙏', icon: Calendar },
  ];

  const handleSendWhatsApp = (customer: any) => {
    const personalizedMsg = message
      .replace('{name}', customer.name)
      .replace('{points}', customer.loyaltyPoints || 0);
    const encoded = encodeURIComponent(personalizedMsg);
    const phone = customer.phone.startsWith('+') ? customer.phone : '91' + customer.phone;
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  const handleBulkSend = () => {
    if (!message) { alert('Write a message first!'); return; }
    filteredCustomers.forEach((c, i) => {
      setTimeout(() => handleSendWhatsApp(c), i * 500);
    });
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-navy">WhatsApp Marketing</h2>
          <p className="text-brown/60 font-medium">Engage your customers with targeted campaigns.</p>
        </div>

        {/* Audience Selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-brown/50 uppercase">Audience:</span>
          {['All', 'Regular', 'VIP', 'High Spender'].map(seg => (
            <Button key={seg} variant={selectedSegment === seg ? 'accent' : 'outline'} size="sm" className="rounded-full" onClick={() => setSelectedSegment(seg)}>
              {seg} {seg === 'All' ? `(${customers.length})` : `(${customers.filter(c => c.segment === seg).length})`}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Templates + Composer */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm bg-ivory">
              <CardHeader><CardTitle>Quick Templates</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map((t, i) => (
                  <button key={i} onClick={() => setMessage(t.body)} className={cn("text-left p-4 rounded-xl border transition-all", message === t.body ? "border-gold bg-gold/5" : "border-border/30 hover:border-gold/30 bg-cream/30")}>
                    <div className="flex items-center gap-2 mb-2">
                      <t.icon className="w-4 h-4 text-gold" />
                      <p className="font-bold text-navy text-sm">{t.title}</p>
                    </div>
                    <p className="text-xs text-brown/50 line-clamp-2">{t.body}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-ivory">
              <CardHeader><CardTitle>Compose Message</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  rows={4}
                  className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold/20 text-navy text-sm resize-none"
                  placeholder="Type your message. Use {name} and {points} as placeholders..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="flex items-center gap-3">
                  <Button variant="accent" className="gap-2 shadow-lg shadow-gold/20" onClick={handleBulkSend}>
                    <Send className="w-4 h-4" /> Send to {filteredCustomers.length} Customers
                  </Button>
                  <p className="text-xs text-brown/30">Opens WhatsApp for each customer</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Preview */}
          <Card className="border-none shadow-sm bg-ivory h-fit">
            <CardHeader><CardTitle>Target Customers ({filteredCustomers.length})</CardTitle></CardHeader>
            <CardContent className="p-0 max-h-[500px] overflow-y-auto custom-scrollbar">
              <div className="divide-y divide-border/20">
                {filteredCustomers.map(c => (
                  <div key={c._id} className="px-6 py-3 flex items-center justify-between hover:bg-cream/50 transition-colors">
                    <div>
                      <p className="font-bold text-navy text-sm">{c.name}</p>
                      <p className="text-[10px] text-brown/40 flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:bg-success/10" onClick={() => message && handleSendWhatsApp(c)}>
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
