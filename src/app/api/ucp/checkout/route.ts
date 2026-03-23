import { NextRequest, NextResponse } from 'next/server';
import { createSalesOrder } from '@/lib/onx-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.items?.length || !body.customer?.email || !body.shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: items, customer.email, shippingAddress' },
        { status: 400 }
      );
    }

    // Translate UCP request → onX create-sales-order
    const order = await createSalesOrder({
      customer: {
        email: body.customer.email,
        firstName: body.customer.firstName ?? '',
        lastName: body.customer.lastName ?? '',
        phone: body.customer.phone,
      },
      lineItems: body.items.map((item: { sku: string; quantity: number }) => ({
        sku: item.sku,
        quantity: item.quantity,
      })),
      shippingAddress: body.shippingAddress,
      currency: body.currency ?? 'USD',
      orderNote: body.orderNote,
    });

    // Translate onX order → UCP checkout response
    const estimatedDelivery = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.name ?? order.id,
      status: order.status,
      total: order.totalPrice,
      currency: order.currency ?? 'USD',
      estimatedDelivery,
      lineItems: order.lineItems.map(li => ({
        sku: li.sku,
        name: li.name,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        totalPrice: li.totalPrice,
      })),
      shippingAddress: order.shippingAddress,
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Checkout failed', details: String(err) }, { status: 500 });
  }
}
