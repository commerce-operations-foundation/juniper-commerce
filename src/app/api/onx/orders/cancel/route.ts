import { NextRequest, NextResponse } from 'next/server';
import { cancelOrderClient } from '@/lib/onx-client';

export async function POST(req: NextRequest) {
  try {
    const { orderId, reason } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    const order = await cancelOrderClient(orderId, reason);
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
