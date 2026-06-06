import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    const filter: any = {};
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(filter);
    return NextResponse.json({ success: true, customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();

    // Check for duplicate phone if it's a new customer
    if (!data._id) {
      const existing = await Customer.findOne({ phone: data.phone });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Customer with this phone already exists' }, { status: 400 });
      }
    }

    let customer;
    if (data._id) {
      customer = await Customer.findByIdAndUpdate(data._id, data, { new: true, upsert: true });
    } else {
      customer = await Customer.create({
        ...data,
        loyaltyPoints: data.loyaltyPoints || 0,
        purchaseHistory: data.purchaseHistory || [],
      });
    }
    return NextResponse.json({ success: true, customer }, { status: 201 });
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
    await Customer.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
