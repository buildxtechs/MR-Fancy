import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sale from '@/models/Sale';
import Product from '@/models/Product';
import Customer from '@/models/Customer';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();
    const { customerId, items, totalAmount, discount, paymentMode, _id } = data;

    // 1. Generate Bill Number
    const count = await Sale.countDocuments();
    const billNumber = `MR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(count + 1).toString().padStart(4, '0')}`;

    // 2. Create Sale Record
    let sale;
    if (_id) {
      sale = await Sale.findByIdAndUpdate(_id, {
        customer: customerId,
        items,
        totalAmount,
        discount,
        paymentMode,
        billNumber,
      }, { new: true, upsert: true });
    } else {
      sale = await Sale.create({
        customer: customerId,
        items,
        totalAmount,
        discount,
        paymentMode,
        billNumber,
      });
    }

    // 3. Update Product Inventory
    for (const item of items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stockQuantity: -item.quantity }
        });
      }
    }

    // 4. Update Customer Loyalty Points (1 pt per ₹100)
    if (customerId) {
      const customer = await Customer.findById(customerId);
      if (customer) {
        const pointsEarned = Math.floor(totalAmount / 100);
        await Customer.findByIdAndUpdate(customerId, {
          $inc: { loyaltyPoints: pointsEarned },
          $push: { purchaseHistory: sale._id }
        });
      }
    }

    return NextResponse.json({ success: true, sale }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const sales = await Sale.find().sort({ createdAt: -1 });
    
    // Populate customer names manually to be highly robust
    const enrichedSales = await Promise.all(sales.map(async (sale: any) => {
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

    return NextResponse.json({ success: true, sales: enrichedSales });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) throw new Error('ID is required');
    await Sale.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
