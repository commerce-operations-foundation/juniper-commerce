import { NextRequest, NextResponse } from 'next/server';
import { getOrderClient, getFulfillmentsClient } from '@/lib/onx-client';

export async function GET(req: NextRequest) {
  return handleFulfillment(req);
}

export async function POST(req: NextRequest) {
  return handleFulfillment(req);
}

async function handleFulfillment(req: NextRequest) {
  try {
    let orderId: string | undefined;

    if (req.method === 'GET') {
      orderId = req.nextUrl.searchParams.get('orderId') ?? undefined;
    } else {
      const body = await req.json();
      orderId = body.orderId;
    }

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const order = await getOrderClient(orderId);
    if (!order) {
      return NextResponse.json({ error: `Order ${orderId} not found` }, { status: 404 });
    }

    const { items: fulfillments } = await getFulfillmentsClient({ orderId });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.name ?? order.id,
      status: order.status,
      fulfillments: fulfillments.map(f => ({
        id: f.id,
        status: f.status,
        carrier: f.shippingCarrier,
        shippingClass: f.shippingClass,
        trackingNumbers: f.trackingNumbers,
        estimatedDelivery: f.expectedDeliveryDate,
        items: f.lineItems.map(li => ({ sku: li.sku, quantity: li.quantity })),
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: 'Fulfillment query failed', details: String(err) }, { status: 500 });
  }
}
