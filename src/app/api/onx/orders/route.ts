import { NextRequest, NextResponse } from 'next/server';
import { getOrdersClient, createSalesOrder } from '@/lib/onx-client';

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const { items, total } = await getOrdersClient({
      status: params.get('status') ?? undefined,
      limit: parseInt(params.get('limit') ?? '50'),
      offset: parseInt(params.get('offset') ?? '0'),
    });
    return NextResponse.json({ items, total });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order = await createSalesOrder(body);
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
