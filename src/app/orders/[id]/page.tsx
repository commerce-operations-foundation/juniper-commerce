import { notFound } from 'next/navigation';
import { getOrderClient, getFulfillmentsClient, getReturnsClient } from '@/lib/onx-client';
import Link from 'next/link';
import { Package, Truck, ChevronRight, MapPin, CheckCircle2, Circle, Clock, RotateCcw } from 'lucide-react';

export const dynamic = 'force-dynamic';

function StatusBadge({ status }: { status?: string }) {
  const s = status ?? 'pending';
  const map: Record<string, string> = {
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${map[s] ?? map.pending}`}>
      {s}
    </span>
  );
}

const STATUS_TIMELINE = ['confirmed', 'processing', 'shipped', 'delivered'];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderClient(id);
  if (!order) notFound();

  const { items: fulfillments } = await getFulfillmentsClient({ orderId: order.id });
  const { items: returns } = await getReturnsClient({ orderId: order.id });

  const statusIdx = STATUS_TIMELINE.indexOf(order.status ?? '');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/orders" className="hover:text-teal-600 transition-colors">Orders</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-700 font-mono">{order.name ?? order.id}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Order {order.name ?? order.id}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Placed {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      {order.status !== 'cancelled' && (
        <div className="card p-6 mb-6">
          <h2 className="text-sm font-semibold text-[#1a1a2e] mb-5 uppercase tracking-wider">Order Progress</h2>
          <div className="flex items-center">
            {STATUS_TIMELINE.map((s, idx) => {
              const done = idx <= statusIdx;
              const current = idx === statusIdx;
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                      done ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-gray-200 text-gray-400'
                    }`}>
                      {done ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs mt-1.5 font-medium capitalize whitespace-nowrap ${
                      current ? 'text-teal-600' : done ? 'text-gray-600' : 'text-gray-400'
                    }`}>{s}</span>
                  </div>
                  {idx < STATUS_TIMELINE.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 -mt-4 ${idx < statusIdx ? 'bg-teal-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Line items */}
        <div className="card p-5">
          <h2 className="font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2"><Package className="w-4 h-4" /> Items</h2>
          <div className="space-y-3">
            {order.lineItems.map((item, idx) => (
              <div key={item.id ?? idx} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-800">{item.name ?? item.sku}</p>
                  <p className="text-gray-400 text-xs">SKU: {item.sku} · Qty: {item.quantity}</p>
                </div>
                {item.totalPrice != null && <span className="font-semibold text-gray-700">${item.totalPrice.toFixed(2)}</span>}
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5 text-sm text-gray-600">
            {order.subTotalPrice != null && <div className="flex justify-between"><span>Subtotal</span><span>${order.subTotalPrice.toFixed(2)}</span></div>}
            {order.shippingPrice != null && <div className="flex justify-between"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `$${order.shippingPrice.toFixed(2)}`}</span></div>}
            {order.orderTax != null && <div className="flex justify-between"><span>Tax</span><span>${order.orderTax.toFixed(2)}</span></div>}
            {order.totalPrice != null && (
              <div className="flex justify-between font-bold text-[#1a1a2e] text-base pt-1 border-t border-gray-100">
                <span>Total</span><span>${order.totalPrice.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Shipping address */}
        <div className="card p-5">
          <h2 className="font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2"><MapPin className="w-4 h-4" /> Ship To</h2>
          {order.shippingAddress ? (
            <address className="not-italic text-sm text-gray-600 leading-relaxed">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
              {order.shippingAddress.company && <>{order.shippingAddress.company}<br /></>}
              {order.shippingAddress.address1}<br />
              {order.shippingAddress.address2 && <>{order.shippingAddress.address2}<br /></>}
              {order.shippingAddress.city}, {order.shippingAddress.stateOrProvince} {order.shippingAddress.zipCodeOrPostalCode}<br />
              {order.shippingAddress.country}
            </address>
          ) : <p className="text-gray-400 text-sm">No shipping address</p>}

          {order.customer?.email && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Customer</p>
              <p className="text-sm text-gray-700">{order.customer.firstName} {order.customer.lastName}</p>
              <p className="text-sm text-gray-500">{order.customer.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Fulfillments */}
      {fulfillments.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2"><Truck className="w-4 h-4" /> Fulfillments</h2>
          {fulfillments.map(f => (
            <div key={f.id} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {f.shippingCarrier} {f.shippingClass}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                  {f.status}
                </span>
              </div>
              {f.trackingNumbers.map(tn => (
                <p key={tn} className="text-sm font-mono text-teal-600 mb-1">📦 {tn}</p>
              ))}
              {f.expectedDeliveryDate && (
                <p className="text-xs text-gray-400 mt-2">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {f.status === 'delivered' ? 'Delivered' : 'Expected'}: {new Date(f.expectedDeliveryDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Returns */}
      {returns.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="font-semibold text-[#1a1a2e] mb-4 flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Returns</h2>
          {returns.map(r => (
            <div key={r.id} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-gray-700">{r.returnNumber}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {r.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">Refund: ${r.refundAmount?.toFixed(2)} · {r.outcome}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Link href="/orders" className="btn-outline text-sm py-2 px-4">← All Orders</Link>
        <Link href="/products" className="btn-secondary text-sm py-2 px-4">Shop Again</Link>
      </div>
    </div>
  );
}
