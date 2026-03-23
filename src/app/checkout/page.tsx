'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface CartItem { sku: string; name: string; price: number; quantity: number; }

type Step = 'info' | 'shipping' | 'payment' | 'confirm';

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [step, setStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', phone: '',
    address1: '', address2: '', city: '', state: '', zip: '', country: 'US',
    cardNumber: '', cardExpiry: '', cardCvc: '',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('juniper_cart');
      if (raw) {
        const parsed = JSON.parse(raw);
        setItems(Array.isArray(parsed) ? parsed : parsed.items ?? []);
      }
    } catch { /* empty cart */ }
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 150 ? 0 : 9.99;
  const tax = subtotal * 0.0875;
  const total = subtotal + shipping + tax;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ucp/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ sku: i.sku, quantity: i.quantity })),
          customer: { email: form.email, firstName: form.firstName, lastName: form.lastName, phone: form.phone },
          shippingAddress: {
            address1: form.address1, address2: form.address2,
            city: form.city, stateOrProvince: form.state,
            zipCodeOrPostalCode: form.zip, country: form.country,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed');
      setOrderId(data.orderId);
      localStorage.removeItem('juniper_cart');
      window.dispatchEvent(new Event('cart-updated'));
      setStep('confirm');
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  if (step === 'confirm' && orderId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-2">Thank you, {form.firstName}!</p>
        <p className="text-sm text-gray-400 mb-6">Order ID: <span className="font-mono font-medium text-gray-700">{orderId}</span></p>
        <div className="flex flex-col gap-3">
          <Link href={`/orders/${orderId}`} className="btn-primary justify-center">Track Your Order <ArrowRight className="w-4 h-4" /></Link>
          <Link href="/products" className="btn-outline justify-center">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const inputCls = "w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm transition-all";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout</h1>
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 mb-8">
        This is a demo checkout. No real charges will be made. Orders are processed via the onX <code className="font-mono text-xs bg-amber-100 px-1 rounded">create-sales-order</code> operation.
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Contact Information</h2>
            <div className="space-y-4">
              <input name="email" placeholder="Email address" value={form.email} onChange={handleInput} className={inputCls} type="email" />
              <div className="grid grid-cols-2 gap-4">
                <input name="firstName" placeholder="First name" value={form.firstName} onChange={handleInput} className={inputCls} />
                <input name="lastName" placeholder="Last name" value={form.lastName} onChange={handleInput} className={inputCls} />
              </div>
              <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={handleInput} className={inputCls} />
            </div>
          </div>

          {/* Shipping */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Shipping Address</h2>
            <div className="space-y-4">
              <input name="address1" placeholder="Street address" value={form.address1} onChange={handleInput} className={inputCls} />
              <input name="address2" placeholder="Apt, suite, etc. (optional)" value={form.address2} onChange={handleInput} className={inputCls} />
              <div className="grid grid-cols-2 gap-4">
                <input name="city" placeholder="City" value={form.city} onChange={handleInput} className={inputCls} />
                <input name="state" placeholder="State / Province" value={form.state} onChange={handleInput} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input name="zip" placeholder="ZIP / Postal code" value={form.zip} onChange={handleInput} className={inputCls} />
                <input name="country" placeholder="Country" value={form.country} onChange={handleInput} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1a1a2e]">Payment</h2>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Simulated (demo)
              </span>
            </div>
            <div className="space-y-4">
              <input name="cardNumber" value={form.cardNumber} onChange={handleInput} className={inputCls} placeholder="Card number" />
              <div className="grid grid-cols-2 gap-4">
                <input name="cardExpiry" value={form.cardExpiry} onChange={handleInput} className={inputCls} placeholder="MM/YY" />
                <input name="cardCvc" value={form.cardCvc} onChange={handleInput} className={inputCls} placeholder="CVC" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Demo: payment is always approved. Uses onX create-sales-order under the hood.</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={loading || !form.email || !form.firstName || !form.address1}
            className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
              loading || !form.email || !form.firstName || !form.address1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-teal-500 hover:bg-teal-600 text-white'
            }`}
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</> : <>Place Order · ${total.toFixed(2)} <ArrowRight className="w-5 h-5" /></>}
          </button>
        </div>

        {/* Order summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-[#1a1a2e] mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.sku} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-2">{item.name} × {item.quantity}</span>
                  <span className="font-medium text-gray-800 whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span><span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-[#1a1a2e] text-base pt-2 border-t border-gray-100">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

