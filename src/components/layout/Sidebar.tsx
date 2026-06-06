"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Truck, 
  Settings, 
  MessageSquare,
  LogOut,
  ChevronRight,
  FileText,
  Receipt
} from 'lucide-react';
import { cn } from '@/components/ui/Button';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'POS / Billing', icon: ShoppingCart, href: '/pos' },
  { name: 'Invoices', icon: Receipt, href: '/invoices' },
  { name: 'Inventory', icon: Package, href: '/inventory' },
  { name: 'Customers', icon: Users, href: '/customers' },
  { name: 'Vendors', icon: Truck, href: '/vendors' },
  { name: 'Analytics', icon: BarChart3, href: '/analytics' },
  { name: 'Marketing', icon: MessageSquare, href: '/marketing' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen flex flex-col fixed left-0 top-0 z-50 transition-all duration-300"
      style={{ background: 'linear-gradient(180deg, #0F2640 0%, #1E3A5F 100%)' }}
    >
      {/* Logo Section */}
      <div className="p-5 flex items-center gap-3 border-b border-white/10">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 shadow-lg flex-shrink-0 animate-pulse-glow">
          <img src="/logo.png" alt="MR Fancy Store" className="w-full h-full object-contain p-0.5" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">MR Fancy</h1>
          <p className="text-[9px] text-gold-light font-bold uppercase tracking-[0.25em]">Retail SaaS</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-gold text-white shadow-lg shadow-gold/20" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-gold-light transition-colors")} />
              <span className="font-medium text-sm">{item.name}</span>
              {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-3 mt-auto border-t border-white/10">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-crimson/20 hover:text-crimson-light transition-all group text-white/50">
          <LogOut className="w-5 h-5 group-hover:text-crimson-light transition-colors" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
