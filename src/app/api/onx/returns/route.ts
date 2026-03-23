import { NextRequest, NextResponse } from 'next/server';
import { getReturnsClient, createReturnClient } from '@/lib/onx-client';

export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get('orderId') ?? undefined;
    const { items, total } = await getReturnsClient({ orderId });
    return NextResponse.json({ items, total });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ret = await createReturnClient({
      orderId: body.orderId,
      outcome: body.outcome,
      returnLineItems: body.returnLineItems,
    });
    return NextResponse.json(ret, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
