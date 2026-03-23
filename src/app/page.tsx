import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { products, productVariants, getCategories } from '@/lib/data/products';
import { getTotalAvailableBySku } from '@/lib/data/inventory';
import { ProductCard } from '@/components/storefront/ProductCard';

export const dynamic = 'force-dynamic';

const CATEGORY_IMAGES: Record<string, string> = {
  'Footwear': 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=300&fit=crop',
  'Packs & Bags': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
  'Shelter': 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop',
  'Apparel': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=300&fit=crop',
  'Accessories': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop',
  'Sleep': 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=400&h=300&fit=crop',
};

function getFeaturedProducts() {
  const featured = products.filter(p =>
    p.tags?.includes('new-arrival') || p.tags?.includes('sale')
  ).slice(0, 4);

  if (featured.length < 4) {
    const rest = products.filter(p => !featured.includes(p)).slice(0, 4 - featured.length);
    featured.push(...rest);
  }

  return featured.map(product => {
    const variants = productVariants.filter(v => v.productId === product.id);
    const prices = variants.map(v => v.price ?? 0).filter(p => p > 0);
    const compareAtPrices = variants.map(v => v.compareAtPrice ?? 0).filter(p => p > 0);
    return {
      product,
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      compareAtPrice: compareAtPrices.length > 0 ? Math.min(...compareAtPrices) : undefined,
      variantCount: variants.length,
      inStock: variants.some(v => getTotalAvailableBySku(v.sku) > 0),
    };
  });
}

export default function HomePage() {
  const featured = getFeaturedProducts();
  const categories = getCategories();
  const productCount = products.length;

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=600&fit=crop&auto=format"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 max-w-xl">
            Gear for every trail ahead
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-lg">
            Technical outdoor equipment tested in the backcountry. {productCount} products across {categories.length} categories.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg transition-colors">
              Shop All <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/docs" className="inline-flex items-center gap-2 border border-white/40 hover:border-white text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Developer Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(cat => {
            const count = products.filter(p => p.categories?.includes(cat)).length;
            const img = CATEGORY_IMAGES[cat];
            return (
              <Link
                key={cat}
                href={`/products`}
                className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-100"
              >
                {img && (
                  <img src={img} alt={cat} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-semibold text-sm">{cat}</p>
                  <p className="text-white/70 text-xs">{count} products</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Gear</h2>
            <Link href="/products" className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(({ product, minPrice, compareAtPrice, variantCount, inStock }) => (
              <ProductCard
                key={product.id}
                product={product}
                minPrice={minPrice}
                compareAtPrice={compareAtPrice}
                variantCount={variantCount}
                inStock={inStock}
              />
            ))}
          </div>
        </div>
      </section>

      {/* onX standard banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-gray-900 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <p className="text-teal-400 text-sm font-medium uppercase tracking-wide mb-2">Powered by onX</p>
            <h3 className="text-2xl font-bold text-white mb-3">Built on the Order Network eXchange Standard</h3>
            <p className="text-gray-400 leading-relaxed">
              This store is a reference implementation of the onX standard by the Commerce Operations Foundation.
              Every order, fulfillment event, and inventory check flows through the standard 12 onX operations.
              Connect via MCP, HTTP, or UCP.
            </p>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <Link href="/conformance" className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
              Run Conformance Tests
            </Link>
            <Link href="/admin" className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Admin Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
