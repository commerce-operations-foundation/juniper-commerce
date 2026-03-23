export interface PaymentResult {
  transactionId: string;
  status: 'authorized' | 'captured' | 'declined';
  amount: number;
  currency: string;
  method: string;
  last4: string;
  message: string;
  _stub: true;
}

export function processPayment(amount: number, currency: string = 'USD'): PaymentResult {
  return {
    transactionId: `txn_stub_${Date.now()}`,
    status: 'captured',
    amount,
    currency,
    method: 'credit_card',
    last4: '4242',
    message: '[STUB] Payment simulated. In production, integrate with Stripe, Adyen, or your payment gateway. Replace this stub in lib/stubs/payment.ts.',
    _stub: true,
  };
}

export function refundPayment(transactionId: string, amount: number, currency: string = 'USD'): PaymentResult {
  return {
    transactionId: `ref_stub_${Date.now()}`,
    status: 'captured',
    amount: -amount,
    currency,
    method: 'refund',
    last4: '4242',
    message: `[STUB] Refund of ${currency} ${amount.toFixed(2)} simulated for ${transactionId}. In production, call your payment gateway's refund API.`,
    _stub: true,
  };
}
