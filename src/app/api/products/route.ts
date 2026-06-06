import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';

    const filter: any = {};
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { sku: { $regex: query, $options: 'i' } },
        { barcode: { $regex: query, $options: 'i' } }
      ];
    }
    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter);
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();
    
    let product;
    if (data._id) {
      product = await Product.findByIdAndUpdate(data._id, data, { new: true, upsert: true });
    } else {
      product = await Product.create(data);
    }
    return NextResponse.json({ success: true, product }, { status: 201 });
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
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
