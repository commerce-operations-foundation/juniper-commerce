import { getOrdersClient, getInventoryItems, getFulfillmentsClient } from '@/lib/onx-client';
import Link from 'next/link';
import { ShoppingBag, Package, Warehouse, RotateCcw, TrendingUp, Clock, ArrowRight, AlertCircle } from 'lucide-react';

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
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${map[s] ?? map.pending}`}>{s}</span>;
}

export default async function AdminPage() {
  const { items: orders, total: totalOrders } = await getOrdersClient({ limit: 50 });
  const { items: inventory } = await getInventoryItems({});
  const { items: fulfillments } = await getFulfillmentsClient({});

  const revenue = orders.reduce((s, o) => s + (o.totalPrice ?? 0), 0);
  const pendingOrders = orders.filter(o => ['confirmed', 'processing'].includes(o.status ?? '')).length;
  const lowStockSkus = new Set(
    inventory.filter(i => i.available < 10).map(i => i.sku)
  ).size;
  const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a2e]">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Juniper Commerce · onX MCP Integration</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/orders" className="btn-secondary text-sm py-2 px-4">Orders <ArrowRight className="w-4 h-4" /></Link>
          <Link href="/admin/inventory" className="btn-outline text-sm py-2 px-4">Inventory</Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Revenue', value: `$${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-teal-600 bg-teal-50' },
          { label: 'Total Orders', value: String(totalOrders), icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
          { label: 'Pending Fulfillment', value: String(pendingOrders), icon: Clock, color: 'text-yellow-600 bg-yellow-50', alert: pendingOrders > 0 },
          { label: 'Low Stock SKUs', value: String(lowStockSkus), icon: AlertCircle, color: 'text-red-600 bg-red-50', alert: lowStockSkus > 0 },
        ].map(({ label, value, icon: Icon, color, alert }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">{label}</span>
              <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1a1a2e]">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[#1a1a2e]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-teal-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center gap-4 hover:bg-gray-50 -mx-2 px-2 py-2.5 rounded-lg transition-colors group">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a1a2e]">{order.name ?? order.id}</p>
                  <p className="text-xs text-gray-400">{order.customer?.firstName} {order.customer?.lastName}</p>
                </div>
                <StatusBadge status={order.status} />
                <span className="text-sm font-semibold text-gray-700">${order.totalPrice?.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-[#1a1a2e] mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/admin/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Manage Orders</p>
                  <p className="text-xs text-gray-400">{pendingOrders} need action</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 ml-auto transition-colors" />
              </Link>
              <Link href="/admin/inventory" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center"><Warehouse className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Inventory</p>
                  <p className="text-xs text-gray-400">{lowStockSkus} low stock</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 ml-auto transition-colors" />
              </Link>
              <Link href="/conformance" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-teal-600" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Run Conformance</p>
                  <p className="text-xs text-gray-400">Test onX endpoints</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 ml-auto transition-colors" />
              </Link>
            </div>
          </div>

          <div className="card p-5 bg-[#1a1a2e] text-white">
            <h3 className="font-semibold mb-2">UCP Discovery</h3>
            <p className="text-gray-400 text-xs mb-3">Live manifest at /.well-known/ucp</p>
            <Link href="/.well-known/ucp" target="_blank" className="text-teal-400 text-xs font-medium hover:underline">
              View Manifest →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
