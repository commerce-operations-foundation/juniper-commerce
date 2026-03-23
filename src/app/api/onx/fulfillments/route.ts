import { NextRequest, NextResponse } from 'next/server';
import { getFulfillmentsClient, fulfillOrderClient } from '@/lib/onx-client';

export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get('orderId') ?? undefined;
    const { items, total } = await getFulfillmentsClient({ orderId });
    return NextResponse.json({ items, total });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fulfillment = await fulfillOrderClient(body);
    return NextResponse.json(fulfillment, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
