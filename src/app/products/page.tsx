'use client';
export const dynamic = 'force-dynamic';

import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/storefront/ProductCard';
import { products, productVariants, getCategories } from '@/lib/data/products';
import { getTotalAvailableBySku } from '@/lib/data/inventory';
import { Search } from 'lucide-react';

type SortOption = 'name-asc' | 'price-asc' | 'price-desc' | 'newest';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  const categories = ['All', ...getCategories()];

  const enrichedProducts = useMemo(() => {
    return products.map(product => {
      const variants = productVariants.filter(v => v.productId === product.id);
      const prices = variants.map(v => v.price ?? 0).filter(p => p > 0);
      const compareAtPrices = variants.map(v => v.compareAtPrice ?? 0).filter(p => p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const compareAtPrice = compareAtPrices.length > 0 ? Math.min(...compareAtPrices) : undefined;
      const inStock = variants.some(v => getTotalAvailableBySku(v.sku) > 0);

      return { product, variants, minPrice, compareAtPrice, inStock, variantCount: variants.length };
    });
  }, []);

  const filtered = useMemo(() => {
    let result = enrichedProducts;

    if (selectedCategory !== 'All') {
      result = result.filter(({ product }) =>
        product.categories?.includes(selectedCategory)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(({ product }) =>
        product.name.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q) ||
        product.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.minPrice - b.minPrice);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.minPrice - a.minPrice);
        break;
      case 'newest':
        result = [...result].sort((a, b) =>
          new Date(b.product.createdAt).getTime() - new Date(a.product.createdAt).getTime()
        );
        break;
      default:
        result = [...result].sort((a, b) => a.product.name.localeCompare(b.product.name));
    }

    return result;
  }, [enrichedProducts, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
        <p className="text-gray-500">{filtered.length} products</p>
      </div>

      {/* Search and controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
        >
          <option value="name-asc">Name A–Z</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(({ product, minPrice, compareAtPrice, variantCount, inStock }) => (
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
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No products found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="mt-4 text-teal-600 font-medium text-sm hover:text-teal-700"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

