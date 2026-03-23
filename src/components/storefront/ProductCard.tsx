'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Product } from '@/types/onx';

interface ProductCardProps {
  product: Product;
  minPrice: number;
  compareAtPrice?: number;
  variantCount: number;
  inStock: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Footwear': 'bg-amber-50',
  'Packs & Bags': 'bg-emerald-50',
  'Shelter': 'bg-sky-50',
  'Apparel': 'bg-violet-50',
  'Accessories': 'bg-rose-50',
  'Sleep': 'bg-indigo-50',
};

export function ProductCard({ product, minPrice, compareAtPrice, variantCount, inStock }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = product.imageURLs?.[0];
  const category = product.categories?.[0] ?? '';
  const fallbackBg = CATEGORY_COLORS[category] ?? 'bg-gray-100';
  const isOnSale = product.tags?.includes('sale');
  const isNew = product.tags?.includes('new-arrival');

  return (
    <Link href={`/products/${product.id}`} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200">
      <div className={`relative aspect-square overflow-hidden ${fallbackBg}`}>
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-300">{product.name.charAt(0)}</span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isNew && (
            <span className="bg-teal-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">New</span>
          )}
          {isOnSale && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">Sale</span>
          )}
        </div>

        {!inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{category}</p>
        <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors mb-1.5 leading-snug">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">${minPrice.toFixed(2)}</span>
          {compareAtPrice && compareAtPrice > minPrice && (
            <span className="text-sm text-gray-400 line-through">${compareAtPrice.toFixed(2)}</span>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-1">
          {variantCount} {variantCount === 1 ? 'option' : 'options'} available
        </p>
      </div>
    </Link>
  );
}
