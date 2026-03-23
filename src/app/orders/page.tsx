import { getOrdersClient } from '@/lib/onx-client';
import Link from 'next/link';
import { Package, ArrowRight, Clock, Info } from 'lucide-react';

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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[s] ?? map.pending}`}>
      {s}
    </span>
  );
}

export default async function OrdersPage() {
  const { items: orders } = await getOrdersClient({ limit: 20 });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Orders</h1>
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800 mb-8">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <span>Showing all demo orders. In production, orders are scoped to the authenticated user via the onX <code className="font-mono text-xs bg-blue-100 px-1 rounded">get-orders</code> operation.</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-500">No orders yet</h2>
          <Link href="/products" className="btn-primary mt-4">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} href={`/orders/${order.id}`} className="card p-5 flex items-center gap-5 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold text-[#1a1a2e]">{order.name ?? order.id}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {order.lineItems.length} item{order.lineItems.length !== 1 ? 's' : ''} ·{' '}
                  {order.customer?.firstName} {order.customer?.lastName}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <Clock className="w-3 h-3" />
                  {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-[#1a1a2e]">${order.totalPrice?.toFixed(2)}</div>
                <div className="text-xs text-gray-400">{order.currency ?? 'USD'}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-500 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
