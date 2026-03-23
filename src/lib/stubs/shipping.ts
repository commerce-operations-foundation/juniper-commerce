export interface ShipmentResult {
  shipmentId: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDelivery: string;
  shippingCost: number;
  currency: string;
  labelUrl: string;
  message: string;
  _stub: true;
}

export interface ShippingRate {
  carrier: string;
  service: string;
  cost: number;
  currency: string;
  estimatedDays: number;
  message: string;
  _stub: true;
}

const CARRIERS: Record<string, { prefix: string; trackingBase: string }> = {
  UPS: { prefix: '1Z999AA1', trackingBase: 'https://www.ups.com/track?tracknum=' },
  FedEx: { prefix: '794644', trackingBase: 'https://www.fedex.com/fedextrack/?trknbr=' },
  USPS: { prefix: '9400111899', trackingBase: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=' },
};

export function createShipment(carrier: string = 'UPS'): ShipmentResult {
  const c = CARRIERS[carrier] ?? CARRIERS.UPS;
  const trackingNumber = `${c.prefix}${Date.now().toString().slice(-10)}`;
  const estimatedDelivery = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];

  return {
    shipmentId: `shp_stub_${Date.now()}`,
    carrier,
    trackingNumber,
    trackingUrl: `${c.trackingBase}${trackingNumber}`,
    estimatedDelivery,
    shippingCost: 12.99,
    currency: 'USD',
    labelUrl: `https://labels.example.com/stub/${trackingNumber}.pdf`,
    message: `[STUB] Shipment created with ${carrier}. In production, integrate with EasyPost, ShipStation, or your carrier API. Replace this stub in lib/stubs/shipping.ts.`,
    _stub: true,
  };
}

export function getRates(weight: number = 2.0): ShippingRate[] {
  return [
    {
      carrier: 'UPS', service: 'Ground', cost: 9.99, currency: 'USD', estimatedDays: 5,
      message: '[STUB] Rate simulated. Replace with real carrier rate API.', _stub: true,
    },
    {
      carrier: 'UPS', service: '2-Day Air', cost: 24.99, currency: 'USD', estimatedDays: 2,
      message: '[STUB] Rate simulated.', _stub: true,
    },
    {
      carrier: 'FedEx', service: 'Express', cost: 19.99, currency: 'USD', estimatedDays: 3,
      message: '[STUB] Rate simulated.', _stub: true,
    },
    {
      carrier: 'USPS', service: 'Priority Mail', cost: 7.99, currency: 'USD', estimatedDays: 3,
      message: '[STUB] Rate simulated.', _stub: true,
    },
  ];
}
