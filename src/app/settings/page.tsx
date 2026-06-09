"use client";

import React, { useState } from 'react';
import AppShell from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Settings, Store, Database, Globe, Shield, Bell, Save, Trash2, RotateCcw, Gift } from "lucide-react";
import { useDialog } from "@/components/ui/DialogProvider";

export default function SettingsPage() {
  const { showAlert, showConfirm } = useDialog();
  const [storeInfo, setStoreInfo] = useState(() => {
    if (typeof window === 'undefined') return {
      name: 'MR Fancy Stores',
      tagline: 'Gifts • Fancy • Grocery',
      phone: '+91 98765 43210',
      address: 'Main Road, Tamil Nadu, India',
      gst: '33AABCU9603R1ZM',
      printerWidth: '80mm',
      language: 'English',
      pointValue: 0.5,
      gstEnabled: false,
    };
    const saved = localStorage.getItem('mrfancy_settings');
    const defaults = {
      name: 'MR Fancy Stores',
      tagline: 'Gifts • Fancy • Grocery',
      phone: '+91 98765 43210',
      address: 'Main Road, Tamil Nadu, India',
      gst: '33AABCU9603R1ZM',
      printerWidth: '80mm',
      language: 'English',
      pointValue: 0.5,
      gstEnabled: false,
    };
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  });

  const handleSave = async () => {
    localStorage.setItem('mrfancy_settings', JSON.stringify(storeInfo));
    await showAlert({
      title: 'Settings Saved',
      message: 'Settings saved successfully!',
      type: 'success'
    });
  };

  const handleClearData = async () => {
    const confirmed = await showConfirm({
      title: 'Clear Data?',
      message: '⚠️ This will delete customers, sales, and vendors. Product inventory will be preserved. Are you sure?',
      type: 'warning'
    });
    if (confirmed) {
      ['mrfancy_customers', 'mrfancy_sales', 'mrfancy_vendors'].forEach(k => localStorage.removeItem(k));
      
      try {
        await Promise.all([
          fetch('/api/sales?all=true', { method: 'DELETE' }),
          fetch('/api/customers?all=true', { method: 'DELETE' }),
          fetch('/api/vendors?all=true', { method: 'DELETE' })
        ]);
        await showAlert({
          title: 'Success',
          message: 'Data cleared successfully.',
          type: 'success'
        });
      } catch (e) {
        console.error('Failed to clear cloud database:', e);
        await showAlert({
          title: 'Database Sync Error',
          message: 'Data cleared from local store, but failed to sync to cloud.',
          type: 'error'
        });
      }
      
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const data = {
      products: JSON.parse(localStorage.getItem('mrfancy_products') || '[]'),
      customers: JSON.parse(localStorage.getItem('mrfancy_customers') || '[]'),
      sales: JSON.parse(localStorage.getItem('mrfancy_sales') || '[]'),
      vendors: JSON.parse(localStorage.getItem('mrfancy_vendors') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `mrfancy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-navy">Settings</h2>
          <p className="text-brown/60 font-medium">Configure your store, printer, and application preferences.</p>
        </div>

        {/* Store Info */}
        <Card className="border-none shadow-sm bg-ivory">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 bg-gold/10 rounded-lg"><Store className="w-5 h-5 text-gold" /></div>
            <CardTitle>Store Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Store Name', key: 'name', placeholder: 'MR Fancy Stores' },
              { label: 'Tagline', key: 'tagline', placeholder: 'Gifts • Fancy • Grocery' },
              { label: 'Phone', key: 'phone', placeholder: '+91 98765 43210' },
              { label: 'GST Number', key: 'gst', placeholder: 'GSTIN' },
            ].map(f => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-sm font-bold text-navy uppercase tracking-tight">{f.label}</label>
                <input className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold/20 text-navy" placeholder={f.placeholder} value={(storeInfo as any)[f.key]} onChange={(e) => setStoreInfo({ ...storeInfo, [f.key]: e.target.value })} />
              </div>
            ))}
            <div className="col-span-2 space-y-1.5 flex items-center justify-between bg-cream border border-border rounded-xl px-4 py-3">
              <label className="text-sm font-bold text-navy uppercase tracking-tight">Enable GST Tax (18%) on Bills by Default</label>
              <button
                type="button"
                onClick={() => setStoreInfo({ ...storeInfo, gstEnabled: !storeInfo.gstEnabled })}
                className={`w-10 h-5 rounded-full transition-all relative ${storeInfo.gstEnabled ? "bg-success" : "bg-brown/20"}`}
              >
                <div
                  className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm"
                  style={{ left: storeInfo.gstEnabled ? '22px' : '2px' }}
                />
              </button>
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-bold text-navy uppercase tracking-tight">Address</label>
              <textarea className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold/20 text-navy resize-none" rows={2} value={storeInfo.address} onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm bg-ivory">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="p-2 bg-gold/10 rounded-lg"><Globe className="w-5 h-5 text-gold" /></div>
              <CardTitle>Language</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {['English', 'Tamil'].map(l => (
                  <Button key={l} variant={storeInfo.language === l ? 'accent' : 'outline'} className="flex-1" onClick={() => setStoreInfo({ ...storeInfo, language: l })}>{l === 'Tamil' ? 'தமிழ் (Tamil)' : l}</Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Loyalty Program */}
          <Card className="border-none shadow-sm bg-ivory">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="p-2 bg-gold/10 rounded-lg"><Gift className="w-5 h-5 text-gold" /></div>
              <CardTitle>Loyalty Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-navy uppercase tracking-tight">Point Value (₹ per point)</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="w-full bg-cream border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gold/20 text-navy font-bold" 
                  value={storeInfo.pointValue} 
                  onChange={(e) => setStoreInfo({ ...storeInfo, pointValue: Number(e.target.value) })} 
                />
              </div>
              <p className="text-xs text-brown/40 font-medium italic">Example: If point value is 0.5, 100 points = ₹50 discount.</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Management */}
        <Card className="border-none shadow-sm bg-ivory">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 bg-navy/10 rounded-lg"><Database className="w-5 h-5 text-navy" /></div>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2" onClick={handleExportData}>
                <Save className="w-4 h-4" /> Export Backup (JSON)
              </Button>
              <Button variant="outline" className="gap-2 text-crimson border-crimson/20 hover:bg-crimson/5" onClick={handleClearData}>
                <Trash2 className="w-4 h-4" /> Clear All Data
              </Button>
            </div>
            <p className="text-xs text-brown/40">Export downloads all your data as a JSON file. Clear data removes everything and re-seeds defaults on reload.</p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button variant="accent" className="gap-2 h-12 px-8 rounded-xl shadow-lg shadow-gold/20" onClick={handleSave}>
            <Save className="w-5 h-5" /> Save All Settings
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
