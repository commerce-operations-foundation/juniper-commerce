export interface UCPDiscoveryManifest {
  version: string;
  name: string;
  description: string;
  baseUrl: string;
  capabilities: UCPCapability[];
  auth: UCPAuthConfig;
  contact?: {
    name: string;
    email: string;
    url: string;
  };
}

export interface UCPCapability {
  id: string;
  type: string;
  description: string;
  endpoint: string;
  methods: string[];
  schema?: Record<string, unknown>;
}

export interface UCPAuthConfig {
  type: string;
  description: string;
  tokenUrl?: string;
  scopes?: string[];
  apiKeyHeader?: string;
}

export interface UCPCatalogRequest {
  query?: string;
  category?: string;
  limit?: number;
  offset?: number;
  filters?: Record<string, string>;
}

export interface UCPCatalogResponse {
  items: UCPProduct[];
  total: number;
  offset: number;
  limit: number;
}

export interface UCPProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category?: string;
  imageUrl?: string;
  available: boolean;
  variants?: UCPProductVariant[];
}

export interface UCPProductVariant {
  sku: string;
  title: string;
  price: number;
  available: boolean;
  options: Record<string, string>;
}

export interface UCPCheckoutRequest {
  items: Array<{ sku: string; quantity: number }>;
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  shippingAddress: {
    address1: string;
    address2?: string;
    city: string;
    stateOrProvince: string;
    zipCodeOrPostalCode: string;
    country: string;
  };
  paymentToken?: string;
}

export interface UCPCheckoutResponse {
  orderId: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  estimatedDelivery?: string;
}

export interface UCPFulfillmentRequest {
  orderId: string;
}

export interface UCPFulfillmentResponse {
  orderId: string;
  status: string;
  fulfillments: Array<{
    id: string;
    status: string;
    carrier?: string;
    trackingNumbers: string[];
    estimatedDelivery?: string;
    items: Array<{ sku: string; quantity: number }>;
  }>;
}
