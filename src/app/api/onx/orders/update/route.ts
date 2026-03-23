import { NextRequest, NextResponse } from 'next/server';
import { updateOrderClient } from '@/lib/onx-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status, orderNote, shippingAddress, customFields } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const order = await updateOrderClient({ orderId, status, orderNote, shippingAddress, customFields });
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
