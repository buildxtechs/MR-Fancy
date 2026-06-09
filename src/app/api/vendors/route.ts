import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vendor from '@/models/Vendor';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    const filter: any = {};
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } }
      ];
    }

    const vendors = await Vendor.find(filter);
    return NextResponse.json({ success: true, vendors });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();
    
    let vendor;
    if (data._id) {
      vendor = await Vendor.findByIdAndUpdate(data._id, data, { new: true, upsert: true });
    } else {
      vendor = await Vendor.create(data);
    }
    return NextResponse.json({ success: true, vendor }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all');
    
    if (all === 'true') {
      await Vendor.deleteMany({});
      return NextResponse.json({ success: true, message: 'All vendors deleted' });
    }
    
    if (!id) throw new Error('ID is required');
    await Vendor.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
