import { getOrdersClient, fulfillOrderClient } from '@/lib/onx-client';
import { FulfillOrderButton } from '@/components/admin/FulfillOrderButton';
import Link from 'next/link';
import { Package, ArrowRight, Clock } from 'lucide-react';

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
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[s] ?? map.pending}`}>{s}</span>;
}

export default async function AdminOrdersPage() {
  const { items: orders } = await getOrdersClient({ limit: 50 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a2e]">Order Management</h1>
          <p className="text-gray-500 mt-1">{orders.length} total orders</p>
        </div>
        <Link href="/admin" className="btn-outline text-sm py-2 px-4">← Dashboard</Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Order</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Customer</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Items</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Total</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Date</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <Link href={`/orders/${order.id}`} className="font-mono text-sm text-teal-600 hover:underline">
                    {order.name ?? order.id}
                  </Link>
                </td>
                <td className="px-5 py-4 text-sm text-gray-700">
                  {order.customer?.firstName} {order.customer?.lastName}
                  <div className="text-xs text-gray-400">{order.customer?.email}</div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">
                  {order.lineItems.length} item{order.lineItems.length !== 1 ? 's' : ''}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-[#1a1a2e]">
                  ${order.totalPrice?.toFixed(2)}
                </td>
                <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                <td className="px-5 py-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Link href={`/orders/${order.id}`} className="text-xs text-teal-600 hover:underline font-medium">
                      View
                    </Link>
                    {(order.status === 'confirmed' || order.status === 'processing') && (
                      <FulfillOrderButton orderId={order.id} />
                    )}
                    {order.status === 'shipped' && (
                      <span className="text-xs text-gray-400">Shipped</span>
                    )}
                    {order.status === 'delivered' && (
                      <span className="text-xs text-green-600">Delivered</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
