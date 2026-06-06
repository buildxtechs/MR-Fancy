"use client";

import React from 'react';
import { Bell, Search, User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Header() {
  return (
    <header className="h-16 bg-ivory/90 backdrop-blur-md border-b border-border/40 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40 group-focus-within:text-gold transition-colors" />
          <input 
            type="text" 
            placeholder="Search products, customers, bills..." 
            className="w-full bg-cream border border-border/40 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-gold/20 focus:border-gold/40 focus:bg-ivory transition-all outline-none text-navy placeholder:text-brown/40"
          />
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative hover:bg-gold/5">
          <Bell className="w-5 h-5 text-navy/60" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-crimson rounded-full border-2 border-ivory" />
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-gold/5">
          <Globe className="w-5 h-5 text-navy/60" />
        </Button>
        
        <div className="h-8 w-[1px] bg-border mx-2" />
        
        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-navy leading-none">Admin Store</p>
            <p className="text-[10px] text-brown/60 font-medium">Tamil Nadu, India</p>
          </div>
          <div className="w-10 h-10 bg-cream rounded-full flex items-center justify-center border border-border group-hover:border-gold transition-colors overflow-hidden">
            <img src="/logo.png" alt="MR Fancy Store" className="w-full h-full object-contain p-1" />
          </div>
        </div>
      </div>
    </header>
  );
}
