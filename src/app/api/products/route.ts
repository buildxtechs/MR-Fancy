import { NextResponse } from 'next/server';
import { productsDB, seedDatabase } from '@/lib/localdb';

export async function GET(req: Request) {
  try {
    seedDatabase();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';

    const products = productsDB.getAll({ q: query, category: category || undefined });
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    seedDatabase();
    const data = await req.json();
    const product = productsDB.create(data);
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
