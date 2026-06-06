import { NextResponse } from 'next/server';
import { customersDB, seedDatabase } from '@/lib/localdb';

export async function GET(req: Request) {
  try {
    seedDatabase();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    const customers = customersDB.getAll({ q: query });
    return NextResponse.json({ success: true, customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    seedDatabase();
    const data = await req.json();

    // Check for duplicate phone
    const existing = customersDB.getAll({ q: data.phone });
    if (existing.some((c: any) => c.phone === data.phone)) {
      return NextResponse.json({ success: false, error: 'Customer with this phone already exists' }, { status: 400 });
    }

    const customer = customersDB.create({
      ...data,
      loyaltyPoints: 0,
      purchaseHistory: [],
    });
    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
