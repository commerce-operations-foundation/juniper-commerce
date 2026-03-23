'use client';
import { useState } from 'react';
import { Truck, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function FulfillOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleFulfill = async () => {
    setLoading(true);
    try {
      const trackingNum = `1Z${Math.random().toString(36).slice(2, 10).toUpperCase()}${Date.now().toString().slice(-6)}`;
      const res = await fetch('/api/onx/fulfillments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          trackingNumbers: [trackingNum],
          carrier: 'UPS',
          shippingClass: 'Ground',
        }),
      });
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.refresh(), 1000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
      <Check className="w-3 h-3" /> Fulfilled!
    </span>
  );

  return (
    <button
      onClick={handleFulfill}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-60"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />}
      {loading ? 'Fulfilling...' : 'Fulfill'}
    </button>
  );
}
