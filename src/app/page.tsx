"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ShoppingCart, Package, Users, TrendingUp, AlertTriangle, ArrowUpRight, BarChart3, ChevronRight, Plus, Check } from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { productsDB, customersDB, salesDB, seedDatabase } from "@/lib/localdb";
import Link from "next/link";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedDatabase();

    // Compute analytics from localStorage
    const allSales = salesDB.getAll();
    const allProducts = productsDB.getAll();
    const allCustomers = customersDB.getAll();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = allSales.filter((s: any) => new Date(s.createdAt) >= today);
    const todayRevenue = todaySales.reduce((sum: number, s: any) => sum + (s.totalAmount || 0), 0);

    const lowStock = allProducts.filter((p: any) => p.stockQuantity < p.lowStockThreshold);

    setStats({
      todayRevenue,
      todayOrders: todaySales.length,
      lowStockCount: lowStock.length,
      customerCount: allCustomers.length,
    });
    setLowStockItems(lowStock.slice(0, 5));

    // Last 7 days chart data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const daySales = allSales.filter((s: any) => {
        const sd = new Date(s.createdAt);
        sd.setHours(0, 0, 0, 0);
        return sd.getTime() === d.getTime();
      });
      const revenue = daySales.reduce((sum: number, s: any) => sum + (s.totalAmount || 0), 0);
      last7Days.push({
        label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        value: revenue,
        fullDate: d.toLocaleDateString('en-IN')
      });
    }
    setChartData(last7Days);

    // Top selling products
    const productSales: any = {};
    allSales.forEach((s: any) => {
      s.items.forEach((item: any) => {
        productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
      });
    });
    const sortedProducts = Object.entries(productSales)
      .map(([id, qty]) => ({ id, qty: qty as number, ...productsDB.getById(id) }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
    setTopProducts(sortedProducts);

    const recent = allSales
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
      .map((sale: any) => {
        const customer = customersDB.getById(sale.customer);
        return { ...sale, customer: customer || { name: 'Walk-in' } };
      });
    setRecentSales(recent);

    setTimeout(() => setLoading(false), 800);
  }, []);

  const kpiCards = [
    { label: "Today's Sales", value: `₹${stats?.todayRevenue?.toLocaleString('en-IN') || 0}`, icon: ShoppingCart, trend: "+12%", color: "text-gold", link: "/invoices" },
    { label: "Today's Orders", value: stats?.todayOrders || 0, icon: Package, trend: "+5%", color: "text-navy", link: "/invoices" },
    { label: "Low Stock Items", value: stats?.lowStockCount || 0, icon: AlertTriangle, trend: stats?.lowStockCount > 0 ? "Action" : "Good", color: stats?.lowStockCount > 0 ? "text-crimson" : "text-success", link: "/inventory" },
    { label: "Total Customers", value: stats?.customerCount || 0, icon: Users, trend: "+8%", color: "text-gold", link: "/customers" },
  ];

  if (loading) return <LoadingScreen />;

  const maxChartVal = Math.max(...chartData.map(d => d.value), 1000);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold text-navy">Vanakkam, Admin! 👋</h2>
            <p className="text-brown/60 font-medium">Here's your store's performance at a glance.</p>
          </div>
          <Link href="/pos">
            <Button variant="accent" className="h-12 px-8 rounded-xl font-bold gap-2 shadow-lg shadow-gold/20">
              <Plus className="w-5 h-5" /> Start New Billing
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((stat, idx) => (
            <Link href={stat.link} key={idx}>
              <Card className="card-hover border-none shadow-sm bg-ivory overflow-hidden h-full group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-cream ${stat.color} group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                      stat.trend === 'Alert' || stat.trend === 'Action' ? "bg-crimson/10 text-crimson" : "bg-success/10 text-success"
                    )}>
                      {stat.trend}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-brown/50 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-3xl font-black text-navy">
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Dashboard Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-sm bg-ivory overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/10">
                <div>
                  <CardTitle className="text-lg">Sales Performance</CardTitle>
                  <p className="text-xs text-brown/40 font-medium tracking-tight">Revenue generated over the last 7 days</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold opacity-60">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gold"></div> Revenue</div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-64 flex items-end justify-between gap-4 w-full relative pt-8">
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                    <div key={i} className="absolute w-full border-t border-border/20 z-0" style={{ bottom: `${p * 100}%` }}>
                      <span className="absolute -left-10 -translate-y-1/2 text-[9px] font-bold text-brown/30">₹{(maxChartVal * p / 1000).toFixed(1)}k</span>
                    </div>
                  ))}
                  
                  {chartData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3 z-10 group relative">
                      <div className="w-full max-w-[40px] bg-gradient-to-t from-gold/60 to-gold rounded-t-lg transition-all duration-500 hover:scale-x-110 relative"
                        style={{ height: `${(d.value / maxChartVal) * 100}%`, minHeight: '4px' }}>
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-navy text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                          ₹{d.value.toLocaleString()}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-brown/50">{d.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm bg-ivory">
                <CardHeader className="flex flex-row items-center justify-between pb-0">
                  <CardTitle className="text-base">Fast Moving Items</CardTitle>
                  <TrendingUp className="w-4 h-4 text-gold" />
                </CardHeader>
                <CardContent className="pt-6">
                  {topProducts.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-brown/30 text-sm italic">No sales data yet</div>
                  ) : (
                    <div className="space-y-4">
                      {topProducts.map((p, i) => (
                        <div key={p.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-gold-dark/40 w-4">{i + 1}</span>
                            <div>
                              <p className="text-sm font-bold text-navy line-clamp-1">{p.name}</p>
                              <p className="text-[10px] text-brown/40 font-bold uppercase">{p.category}</p>
                            </div>
                          </div>
                          <p className="text-sm font-black text-navy">{p.qty} <span className="text-[10px] text-brown/40">sold</span></p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-ivory">
                <CardHeader className="flex flex-row items-center justify-between pb-0">
                  <CardTitle className="text-base text-crimson flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Low Stock
                  </CardTitle>
                  <Link href="/inventory" className="text-xs text-crimson font-bold hover:underline">Refill</Link>
                </CardHeader>
                <CardContent className="pt-6">
                  {lowStockItems.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-center gap-2">
                      <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-success" />
                      </div>
                      <p className="text-xs text-brown/30 italic">All stock levels healthy</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lowStockItems.map((p) => (
                        <div key={p._id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-navy">{p.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="w-24 h-1.5 bg-cream rounded-full overflow-hidden">
                                <div className="h-full bg-crimson" style={{ width: `${(p.stockQuantity / p.lowStockThreshold) * 100}%` }}></div>
                              </div>
                              <span className="text-[10px] font-bold text-crimson">{p.stockQuantity} / {p.lowStockThreshold}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-brown/20" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions / Recent Activity */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-ivory overflow-hidden">
              <CardHeader className="bg-navy p-6">
                <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 p-6">
                <Link href="/pos">
                  <Button className="w-full justify-start gap-4 h-14 rounded-xl text-left" variant="primary">
                    <div className="p-2 bg-white/10 rounded-lg"><ShoppingCart className="w-5 h-5" /></div>
                    <div>
                      <p className="font-bold">New Billing</p>
                      <p className="text-[10px] opacity-60">F1 Shortcut</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/inventory">
                  <Button className="w-full justify-start gap-4 h-14 rounded-xl text-left" variant="secondary">
                    <div className="p-2 bg-navy/10 rounded-lg"><Package className="w-5 h-5" /></div>
                    <div>
                      <p className="font-bold">Add Product</p>
                      <p className="text-[10px] opacity-60">Manage Stock</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/marketing">
                  <Button className="w-full justify-start gap-4 h-14 rounded-xl text-left border-dashed" variant="outline">
                    <div className="p-2 bg-gold/10 rounded-lg"><TrendingUp className="w-5 h-5 text-gold" /></div>
                    <div>
                      <p className="font-bold">Campaigns</p>
                      <p className="text-[10px] opacity-60">WhatsApp Marketing</p>
                    </div>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-ivory">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Sales</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {recentSales.length === 0 ? (
                    <div className="p-12 text-center text-brown/30 text-sm italic">No sales yet today</div>
                  ) : (
                    recentSales.map((sale) => (
                      <Link href="/invoices" key={sale._id}>
                        <div className="px-6 py-4 flex items-center justify-between hover:bg-cream/50 transition-colors cursor-pointer group">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-navy truncate group-hover:text-gold transition-colors">{sale.billNumber}</p>
                            <p className="text-[10px] text-brown/50 font-bold uppercase tracking-widest truncate">
                              {sale.customer?.name} • {sale.paymentMode}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-navy group-hover:text-gold-dark transition-colors">₹{sale.totalAmount.toLocaleString()}</p>
                            <p className="text-[9px] text-brown/40 font-bold">{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                {recentSales.length > 0 && (
                  <div className="p-4 border-t border-border/30">
                    <Link href="/invoices">
                      <Button variant="ghost" className="w-full text-xs font-bold text-brown/40 hover:text-gold">View All Activity</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
