import { getInventoryItems } from '@/lib/onx-client';
import { products } from '@/lib/data/products';
import Link from 'next/link';
import { Warehouse, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const { items: inventory } = await getInventoryItems({});

  // Group by SKU
  const bySku = new Map<string, typeof inventory>();
  for (const item of inventory) {
    if (!bySku.has(item.sku)) bySku.set(item.sku, []);
    bySku.get(item.sku)!.push(item);
  }

  // Get product name for each SKU
  const { productVariants } = await import('@/lib/data/products');
  const skuToName = new Map(productVariants.map(v => [v.sku, v.title ?? v.sku]));

  const summary = Array.from(bySku.entries()).map(([sku, items]) => ({
    sku,
    name: skuToName.get(sku) ?? sku,
    totalOnHand: items.reduce((s, i) => s + (i.onHand ?? 0), 0),
    totalAvailable: items.reduce((s, i) => s + i.available, 0),
    totalUnavailable: items.reduce((s, i) => s + (i.unavailable ?? 0), 0),
    byLocation: items,
    isLow: items.reduce((s, i) => s + i.available, 0) < 30,
  })).sort((a, b) => a.sku.localeCompare(b.sku));

  const lowCount = summary.filter(s => s.isLow).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a2e]">Inventory</h1>
          <p className="text-gray-500 mt-1">{summary.length} SKUs across 3 warehouses</p>
        </div>
        <div className="flex items-center gap-3">
          {lowCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <AlertCircle className="w-4 h-4" /> {lowCount} low stock
            </div>
          )}
          <Link href="/admin" className="btn-outline text-sm py-2 px-4">← Dashboard</Link>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">SKU</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Product</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">On Hand</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Available</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Unavailable</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">WH001</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">WH002</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">WH003</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {summary.map(({ sku, name, totalOnHand, totalAvailable, totalUnavailable, byLocation, isLow }) => {
              const wh001 = byLocation.find(i => i.locationId === 'WH001')?.available ?? 0;
              const wh002 = byLocation.find(i => i.locationId === 'WH002')?.available ?? 0;
              const wh003 = byLocation.find(i => i.locationId === 'WH003')?.available ?? 0;
              return (
                <tr key={sku} className={`hover:bg-gray-50/50 transition-colors ${isLow ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-5 py-3.5 font-mono text-sm font-medium text-teal-700">{sku}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-700 max-w-xs truncate">{name}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-[#1a1a2e]">{totalOnHand}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-green-700">{totalAvailable}</td>
                  <td className="px-5 py-3.5 text-sm text-red-500">{totalUnavailable}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{wh001}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{wh002}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{wh003}</td>
                  <td className="px-5 py-3.5">
                    {totalAvailable === 0
                      ? <span className="badge bg-red-100 text-red-800">Out of Stock</span>
                      : isLow
                      ? <span className="badge bg-amber-100 text-amber-800">Low Stock</span>
                      : <span className="badge bg-green-100 text-green-800">In Stock</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
