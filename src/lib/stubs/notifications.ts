export interface NotificationResult {
  notificationId: string;
  channel: 'email' | 'sms';
  to: string;
  subject: string;
  status: 'sent';
  message: string;
  _stub: true;
}

export function sendOrderConfirmation(email: string, orderId: string, orderName: string): NotificationResult {
  console.log(`[STUB] Order confirmation email to ${email} for ${orderName}`);
  return {
    notificationId: `notif_stub_${Date.now()}`,
    channel: 'email',
    to: email,
    subject: `Order Confirmed: ${orderName}`,
    status: 'sent',
    message: `[STUB] Email notification logged to console. In production, integrate with SendGrid, SES, or your email service. Replace this stub in lib/stubs/notifications.ts.`,
    _stub: true,
  };
}

export function sendShipmentNotification(email: string, orderId: string, trackingNumber: string, carrier: string): NotificationResult {
  console.log(`[STUB] Shipment notification to ${email}: ${carrier} ${trackingNumber}`);
  return {
    notificationId: `notif_stub_${Date.now()}`,
    channel: 'email',
    to: email,
    subject: `Your order has shipped — ${carrier} ${trackingNumber}`,
    status: 'sent',
    message: '[STUB] Shipment notification logged to console.',
    _stub: true,
  };
}

export function sendReturnConfirmation(email: string, returnId: string): NotificationResult {
  console.log(`[STUB] Return confirmation to ${email} for return ${returnId}`);
  return {
    notificationId: `notif_stub_${Date.now()}`,
    channel: 'email',
    to: email,
    subject: `Return Request Received: ${returnId}`,
    status: 'sent',
    message: '[STUB] Return notification logged to console.',
    _stub: true,
  };
}
