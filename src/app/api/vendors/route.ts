import { NextResponse } from 'next/server';
import { vendorsDB, seedDatabase } from '@/lib/localdb';

export async function GET(req: Request) {
  try {
    seedDatabase();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    const vendors = vendorsDB.getAll({ q: query });
    return NextResponse.json({ success: true, vendors });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    seedDatabase();
    const data = await req.json();
    const vendor = vendorsDB.create(data);
    return NextResponse.json({ success: true, vendor }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
