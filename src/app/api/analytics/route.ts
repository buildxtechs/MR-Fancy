import { NextResponse } from 'next/server';
import { salesDB, productsDB, customersDB, seedDatabase } from '@/lib/localdb';

export async function GET() {
  try {
    seedDatabase();

    // Today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const allSales = salesDB.getAll();
    const allProducts = productsDB.getAll();
    const allCustomers = customersDB.getAll();

    // Today's sales
    const todaySales = allSales.filter((s: any) => new Date(s.createdAt) >= today);
    const todayRevenue = todaySales.reduce((sum: number, s: any) => sum + (s.totalAmount || 0), 0);
    const todayOrders = todaySales.length;

    // Low stock count
    const lowStockCount = allProducts.filter(
      (p: any) => p.stockQuantity < p.lowStockThreshold
    ).length;

    // Customer count
    const customerCount = allCustomers.length;

    // Recent sales (last 10)
    const recentSales = allSales
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((sale: any) => {
        const customer = customersDB.getById(sale.customer);
        return { ...sale, customer: customer || { name: 'Walk-in' } };
      });

    return NextResponse.json({
      success: true,
      stats: { todayRevenue, todayOrders, lowStockCount, customerCount },
      recentSales
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
