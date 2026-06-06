import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sale from '@/models/Sale';
import Product from '@/models/Product';
import Customer from '@/models/Customer';

export async function GET() {
  try {
    await dbConnect();

    // Today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allSales = await Sale.find();
    const allProducts = await Product.find();
    const allCustomers = await Customer.find();

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
    const sortedSales = allSales
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    const recentSales = await Promise.all(sortedSales.map(async (sale: any) => {
      let customerName = 'Walk-in';
      if (sale.customer) {
        const cust = await Customer.findById(sale.customer);
        if (cust) {
          customerName = cust.name;
        }
      }
      return {
        ...sale.toObject(),
        customer: { name: customerName }
      };
    }));

    return NextResponse.json({
      success: true,
      stats: { todayRevenue, todayOrders, lowStockCount, customerCount },
      recentSales
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
