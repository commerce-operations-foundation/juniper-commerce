'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2, ArrowRight, Mountain } from 'lucide-react';

interface CartItem {
  sku: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  options?: Record<string, string>;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('juniper_cart');
      if (raw) {
        const parsed = JSON.parse(raw);
        setItems(Array.isArray(parsed) ? parsed : parsed.items ?? []);
      }
    } catch { /* empty cart */ }
  }, []);

  const save = (updated: CartItem[]) => {
    setItems(updated);
    localStorage.setItem('juniper_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateQuantity = (sku: string, quantity: number) => {
    save(quantity <= 0 ? items.filter(i => i.sku !== sku) : items.map(i => i.sku === sku ? { ...i, quantity } : i));
  };

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 150 ? 0 : 9.99;
  const tax = Math.round(subtotal * 0.0875 * 100) / 100;
  const total = subtotal + shipping + tax;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some gear and come back.</p>
        <Link href="/products" className="inline-flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors">
          <Mountain className="w-4 h-4" /> Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.sku} className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4">
              <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-300">{item.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</p>
                    {item.options && Object.entries(item.options).map(([k, v]) => (
                      <p key={k} className="text-xs text-gray-500">{k}: {v}</p>
                    ))}
                  </div>
                  <button onClick={() => updateQuantity(item.sku, 0)} className="text-gray-400 hover:text-red-500 transition-colors p-1" aria-label={`Remove ${item.name}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.sku, item.quantity - 1)} className="px-3 py-1.5 hover:bg-gray-50 text-gray-600 font-bold transition-colors" aria-label="Decrease quantity">−</button>
                    <span className="px-3 py-1.5 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.sku, item.quantity + 1)} className="px-3 py-1.5 hover:bg-gray-50 text-gray-600 font-bold transition-colors" aria-label="Increase quantity">+</button>
                  </div>
                  <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {subtotal > 0 && subtotal < 150 && (
              <div className="text-xs text-teal-700 bg-teal-50 rounded-lg p-3 mb-4">
                Add ${(150 - subtotal).toFixed(2)} more for free shipping
              </div>
            )}

            <Link href="/checkout" className="block w-full text-center bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 rounded-lg transition-colors">
              Checkout <ArrowRight className="w-4 h-4 inline ml-1" />
            </Link>
            <Link href="/products" className="block text-center text-sm text-gray-500 hover:text-teal-600 mt-3 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

