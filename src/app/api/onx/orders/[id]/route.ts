import { NextRequest, NextResponse } from 'next/server';
import { getOrderClient, cancelOrderClient, fulfillOrderClient } from '@/lib/onx-client';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderClient(id);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  return NextResponse.json(order);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { reason } = await req.json().catch(() => ({}));
    const order = await cancelOrderClient(id, reason);
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
