"use client";

import React, { useState, useEffect } from 'react';
import AppShell from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button, cn } from "@/components/ui/Button";
import { BarChart3, TrendingUp, ShoppingCart, Package, Users, ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import { productsDB, customersDB, salesDB, seedDatabase } from "@/lib/localdb";

export default function AnalyticsPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const loadData = () => {
    setSales(salesDB.getAll());
    setProducts(productsDB.getAll());
    setCustomers(customersDB.getAll());
  };

  useEffect(() => {
    seedDatabase();
    loadData();
    const handleSync = () => loadData();
    window.addEventListener('mrfancy_db_synced', handleSync);
    return () => window.removeEventListener('mrfancy_db_synced', handleSync);
  }, []);

  const totalRevenue = sales.reduce((s, sale) => s + (sale.totalAmount || 0), 0);
  const totalOrders = sales.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const totalProfit = sales.reduce((s, sale) => {
    const itemCost = (sale.items || []).reduce((c: number, item: any) => {
      const product = products.find((p: any) => p._id === item.productId);
      return c + ((product?.costPrice || 0) * (item.quantity || 0));
    }, 0);
    return s + ((sale.totalAmount || 0) - itemCost);
  }, 0);

  // Category breakdown
  const categoryMap: Record<string, { count: number; revenue: number }> = {};
  sales.forEach(sale => {
    (sale.items || []).forEach((item: any) => {
      const product = products.find((p: any) => p._id === item.productId);
      const cat = product?.category || 'Unknown';
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, revenue: 0 };
      categoryMap[cat].count += item.quantity || 0;
      categoryMap[cat].revenue += item.totalPrice || 0;
    });
  });

  // Top products by quantity sold
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  sales.forEach(sale => {
    (sale.items || []).forEach((item: any) => {
      if (!productSales[item.productId]) productSales[item.productId] = { name: item.name, qty: 0, revenue: 0 };
      productSales[item.productId].qty += item.quantity || 0;
      productSales[item.productId].revenue += item.totalPrice || 0;
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const kpis = [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-gold", bg: "bg-gold/10" },
    { label: "Total Orders", value: totalOrders, icon: ShoppingCart, color: "text-navy", bg: "bg-navy/10" },
    { label: "Avg Order Value", value: `₹${avgOrderValue}`, icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
    { label: "Est. Profit", value: `₹${Math.round(totalProfit).toLocaleString()}`, icon: ArrowUpRight, color: "text-gold", bg: "bg-gold/10" },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-navy">Analytics & Reports</h2>
          <p className="text-brown/60 font-medium">Deep insights into your store performance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((k, i) => (
            <Card key={i} className="border-none shadow-sm bg-ivory">
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${k.bg} ${k.color} w-fit mb-4`}><k.icon className="w-6 h-6" /></div>
                <p className="text-sm font-semibold text-brown/50 uppercase tracking-wider">{k.label}</p>
                <p className="text-3xl font-bold text-navy mt-1">{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Breakdown */}
          <Card className="border-none shadow-sm bg-ivory">
            <CardHeader><CardTitle>Sales by Category</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(categoryMap).length === 0 ? (
                <p className="text-brown/30 italic text-sm text-center py-8">No sales data yet. Complete a POS transaction to see insights.</p>
              ) : Object.entries(categoryMap).map(([cat, data]) => (
                <div key={cat} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-bold text-navy">{cat}</div>
                  <div className="flex-1 h-8 bg-cream rounded-lg overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gold to-gold-light rounded-lg flex items-center px-3" style={{ width: `${Math.min(100, (data.revenue / (totalRevenue || 1)) * 100)}%` }}>
                      <span className="text-[10px] font-black text-white whitespace-nowrap">₹{data.revenue}</span>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-brown/40 w-16 text-right">{data.count} sold</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="border-none shadow-sm bg-ivory">
            <CardHeader><CardTitle>Top Products</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-brown/30 italic text-sm text-center py-8">Start selling to see your top products here.</p>
              ) : topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-cream/50">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold font-black text-sm">#{i + 1}</div>
                  <div className="flex-1">
                    <p className="font-bold text-navy text-sm">{p.name}</p>
                    <p className="text-[10px] text-brown/40">{p.qty} units sold</p>
                  </div>
                  <p className="font-black text-gold">₹{p.revenue}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Inventory Health */}
        <Card className="border-none shadow-sm bg-ivory">
          <CardHeader><CardTitle>Inventory Health</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-cream rounded-xl">
                <p className="text-3xl font-black text-navy">{products.length}</p>
                <p className="text-xs font-bold text-brown/40 uppercase">Total SKUs</p>
              </div>
              <div className="text-center p-4 bg-cream rounded-xl">
                <p className="text-3xl font-black text-success">{products.filter(p => p.stockQuantity >= p.lowStockThreshold).length}</p>
                <p className="text-xs font-bold text-brown/40 uppercase">In Stock</p>
              </div>
              <div className="text-center p-4 bg-crimson/5 rounded-xl">
                <p className="text-3xl font-black text-crimson">{products.filter(p => p.stockQuantity < p.lowStockThreshold).length}</p>
                <p className="text-xs font-bold text-brown/40 uppercase">Low Stock</p>
              </div>
              <div className="text-center p-4 bg-cream rounded-xl">
                <p className="text-3xl font-black text-navy">₹{products.reduce((s, p) => s + (p.stockQuantity * p.costPrice), 0).toLocaleString()}</p>
                <p className="text-xs font-bold text-brown/40 uppercase">Stock Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
