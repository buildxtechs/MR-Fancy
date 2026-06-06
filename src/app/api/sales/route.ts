import { NextResponse } from 'next/server';
import { salesDB, productsDB, customersDB, seedDatabase } from '@/lib/localdb';

export async function POST(req: Request) {
  try {
    seedDatabase();
    const data = await req.json();
    const { customerId, items, totalAmount, discount, paymentMode } = data;

    // 1. Generate Bill Number
    const count = salesDB.count();
    const billNumber = `MR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(count + 1).toString().padStart(4, '0')}`;

    // 2. Create Sale Record
    const sale = salesDB.create({
      customer: customerId,
      items,
      totalAmount,
      discount,
      paymentMode,
      billNumber,
    });

    // 3. Update Product Inventory
    for (const item of items) {
      const product = productsDB.getById(item.productId);
      if (product) {
        productsDB.update(item.productId, {
          stockQuantity: Math.max(0, product.stockQuantity - item.quantity)
        });
      }
    }

    // 4. Update Customer Loyalty Points (1 pt per ₹100)
    const customer = customersDB.getById(customerId);
    if (customer) {
      const pointsEarned = Math.floor(totalAmount / 100);
      customersDB.update(customerId, {
        loyaltyPoints: (customer.loyaltyPoints || 0) + pointsEarned,
        purchaseHistory: [...(customer.purchaseHistory || []), sale._id]
      });
    }

    return NextResponse.json({ success: true, sale }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    seedDatabase();
    const sales = salesDB.getAll();
    
    // Populate customer names
    const enrichedSales = sales.map((sale: any) => {
      const customer = customersDB.getById(sale.customer);
      return { ...sale, customer: customer || { name: 'Unknown' } };
    }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, sales: enrichedSales });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
