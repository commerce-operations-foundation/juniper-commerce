'use client';

import { useState } from 'react';
import { Product, ProductVariant, InventoryItem } from '@/types/onx';
import { ShoppingCart, Check, Truck, Shield, RotateCcw } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  variants: ProductVariant[];
  inventory: InventoryItem[];
}

export function ProductDetail({ product, variants, inventory }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(variants[0] ?? null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const imageUrl = selectedVariant?.imageURLs?.[0] ?? product.imageURLs?.[0];

  const totalStock = selectedVariant
    ? inventory.filter(i => i.sku === selectedVariant.sku).reduce((s, i) => s + i.available, 0)
    : 0;

  const handleAddToCart = () => {
    if (!selectedVariant || totalStock === 0) return;

    const existing = JSON.parse(localStorage.getItem('juniper_cart') ?? '[]');
    const idx = existing.findIndex((i: { sku: string }) => i.sku === selectedVariant.sku);

    if (idx >= 0) {
      existing[idx].quantity += quantity;
    } else {
      existing.push({
        sku: selectedVariant.sku,
        productId: product.id,
        name: selectedVariant.title ?? product.name,
        price: selectedVariant.price ?? 0,
        quantity,
        imageUrl: imageUrl ?? '',
        options: Object.fromEntries(
          (selectedVariant.selectedOptions ?? []).map(o => [o.name, o.value])
        ),
      });
    }

    localStorage.setItem('juniper_cart', JSON.stringify(existing));
    window.dispatchEvent(new Event('cart-updated'));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const specs = product.customFields?.filter(f => f.name && f.value) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <span className="text-6xl font-bold text-gray-200">{product.name.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-teal-600 font-medium mb-2 uppercase tracking-wide">
            {product.categories?.[0] ?? 'Product'}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-900">
              ${(selectedVariant?.price ?? 0).toFixed(2)}
            </span>
            {selectedVariant?.compareAtPrice && selectedVariant.compareAtPrice > (selectedVariant.price ?? 0) && (
              <span className="text-lg text-gray-400 line-through">
                ${selectedVariant.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Variant selector */}
          {product.options.map(option => (
            <div key={option.name} className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {option.name}: <span className="text-gray-900 font-semibold">
                  {selectedVariant?.selectedOptions?.find(o => o.name === option.name)?.value}
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {option.values.map(value => {
                  const variant = variants.find(v =>
                    v.selectedOptions?.some(o => o.name === option.name && o.value === value)
                  );
                  const isSelected = selectedVariant?.id === variant?.id;
                  const variantStock = variant
                    ? inventory.filter(i => i.sku === variant.sku).reduce((s, i) => s + i.available, 0)
                    : 0;

                  return (
                    <button
                      key={value}
                      onClick={() => variant && setSelectedVariant(variant)}
                      disabled={!variant}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-500/20'
                          : variantStock > 0
                            ? 'border-gray-200 text-gray-700 hover:border-gray-400'
                            : 'border-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Stock indicator */}
          <div className="mb-5">
            {totalStock > 0 ? (
              <p className="text-sm text-green-600 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                {totalStock > 10 ? 'In Stock' : `Only ${totalStock} left`}
              </p>
            ) : (
              <p className="text-sm text-red-500">Out of stock</p>
            )}
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex gap-3 mb-6">
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3 py-2.5 text-gray-500 hover:text-gray-900 transition-colors"
              >
                −
              </button>
              <span className="px-3 py-2.5 text-sm font-medium min-w-[2rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="px-3 py-2.5 text-gray-500 hover:text-gray-900 transition-colors"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={totalStock === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-base font-semibold transition-all ${
                addedToCart
                  ? 'bg-green-500 text-white'
                  : totalStock > 0
                    ? 'bg-gray-900 hover:bg-gray-800 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {addedToCart ? (
                <>
                  <Check className="w-5 h-5" /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </>
              )}
            </button>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-5">
            <div className="text-center">
              <Truck className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">Free shipping over $150</p>
            </div>
            <div className="text-center">
              <Shield className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">Lifetime warranty</p>
            </div>
            <div className="text-center">
              <RotateCcw className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">60-day returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications */}
      {specs.length > 0 && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {specs.map(field => (
              <div key={field.name} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500 capitalize">{field.name.replace(/_/g, ' ')}</span>
                <span className="text-sm font-medium text-gray-900">{field.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SKU info */}
      {selectedVariant && (
        <div className="mt-6 text-xs text-gray-400">
          SKU: {selectedVariant.sku} · {selectedVariant.weight?.value} {selectedVariant.weight?.unit}
        </div>
      )}
    </div>
  );
}
