export interface Address {
  address1?: string;
  address2?: string;
  city?: string;
  company?: string;
  country?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  stateOrProvince?: string;
  zipCodeOrPostalCode?: string;
}

export interface CustomField {
  name: string;
  value: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  externalId?: string;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  name: string;
  description?: string;
  handle?: string;
  status?: string;
  tags?: string[];
  vendor?: string;
  categories?: string[];
  options: ProductOption[];
  imageURLs?: string[];
  customFields?: CustomField[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  externalId?: string;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  sku: string;
  barcode?: string;
  title?: string;
  selectedOptions?: Array<{ name: string; value: string }>;
  price?: number;
  currency?: string;
  compareAtPrice?: number;
  cost?: number;
  weight?: { value: number; unit: string };
  dimensions?: { length: number; width: number; height: number; unit: string };
  imageURLs?: string[];
  taxable?: boolean;
  inventoryNotTracked?: boolean;
  customFields?: CustomField[];
}

export interface Customer {
  id: string;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  type?: string;
  status?: string;
  notes?: string;
  addresses?: Array<{ name: string; address: Address }>;
  customFields?: CustomField[];
  tags?: string[];
}

export interface LineItem {
  id?: string;
  sku: string;
  quantity: number;
  unitPrice?: number;
  unitDiscount?: number;
  totalPrice?: number;
  name?: string;
  customFields?: CustomField[];
}

export interface Order {
  id: string;
  externalId?: string;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  name?: string;
  status?: string;
  customer?: Customer;
  lineItems: LineItem[];
  billingAddress?: Address;
  shippingAddress?: Address;
  currency?: string;
  subTotalPrice?: number;
  orderTax?: number;
  shippingPrice?: number;
  totalPrice?: number;
  orderNote?: string;
  orderSource?: string;
  shippingCarrier?: string;
  shippingClass?: string;
  tags?: string[];
  customFields?: CustomField[];
  paymentStatus?: string;
}

export interface Fulfillment {
  id: string;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  orderId: string;
  trackingNumbers: string[];
  lineItems: LineItem[];
  status?: string;
  shippingCarrier?: string;
  shippingClass?: string;
  shippingAddress?: Address;
  expectedShipDate?: string;
  expectedDeliveryDate?: string;
  locationId?: string;
  customFields?: CustomField[];
}

export interface InventoryItem {
  tenantId: string;
  sku: string;
  locationId: string;
  onHand?: number;
  unavailable?: number;
  available: number;
}

export interface Return {
  id: string;
  returnNumber?: string;
  orderId: string;
  status?: string;
  outcome?: string;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  returnLineItems?: Array<{
    orderLineItemId?: string;
    sku?: string;
    quantityReturned?: number;
    returnReason?: string;
    unitPrice?: number;
    refundAmount?: number;
    restockFee?: number;
    name?: string;
  }>;
  totalQuantity?: number;
  returnTotal?: number;
  refundAmount?: number;
  restockingFee?: number;
  refundStatus?: string;
  refundMethod?: string;
  completedAt?: string;
}
