import type {
  Product, ProductVariant, Customer,
  Order, Fulfillment, InventoryItem, Return, LineItem,
} from '@/types/onx';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export interface ProductFilter {
  status?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface VariantFilter {
  productId?: string;
  sku?: string;
}

export interface CustomerFilter {
  email?: string;
  type?: string;
}

export interface InventoryFilter {
  sku?: string;
  locationId?: string;
}

export interface OrderFilter {
  status?: string;
  customerId?: string;
  limit?: number;
  offset?: number;
}

export interface FulfillmentFilter {
  orderId?: string;
}

export interface ReturnFilter {
  orderId?: string;
}

export interface CreateOrderInput {
  customer: { email: string; firstName: string; lastName: string; phone?: string };
  lineItems: Array<{ sku: string; quantity: number }>;
  shippingAddress: {
    address1: string; address2?: string; city: string;
    stateOrProvince: string; zipCodeOrPostalCode: string; country: string;
  };
  currency?: string;
  orderNote?: string;
}

export interface CreateFulfillmentInput {
  orderId: string;
  trackingNumbers: string[];
  carrier: string;
  shippingClass?: string;
  lineItems?: Array<{ sku: string; quantity: number }>;
}

export interface CreateReturnInput {
  orderId: string;
  outcome?: string;
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
}

export interface UpdateOrderInput {
  orderId: string;
  status?: string;
  orderNote?: string;
  shippingAddress?: {
    address1: string; address2?: string; city: string;
    stateOrProvince: string; zipCodeOrPostalCode: string; country: string;
  };
  customFields?: Array<{ name: string; value: string }>;
}

export interface DataProvider {
  // Products (read-only in demo, read-write in install)
  getProducts(filter?: ProductFilter): Promise<PaginatedResult<Product>>;
  getProductById(id: string): Promise<Product | null>;
  getProductVariants(filter?: VariantFilter): Promise<PaginatedResult<ProductVariant>>;
  getVariantBySku(sku: string): Promise<ProductVariant | null>;
  getCategories(): Promise<string[]>;

  // Inventory
  getInventory(filter?: InventoryFilter): Promise<PaginatedResult<InventoryItem>>;
  getTotalAvailableBySku(sku: string): Promise<number>;

  // Customers
  getCustomers(filter?: CustomerFilter): Promise<PaginatedResult<Customer>>;

  // Orders
  getOrders(filter?: OrderFilter): Promise<PaginatedResult<Order>>;
  getOrderById(id: string): Promise<Order | null>;
  createOrder(input: CreateOrderInput): Promise<Order>;
  updateOrder(input: UpdateOrderInput): Promise<Order>;
  cancelOrder(orderId: string, reason?: string): Promise<Order>;

  // Fulfillments
  getFulfillments(filter?: FulfillmentFilter): Promise<PaginatedResult<Fulfillment>>;
  createFulfillment(input: CreateFulfillmentInput): Promise<Fulfillment>;

  // Returns
  getReturns(filter?: ReturnFilter): Promise<PaginatedResult<Return>>;
  createReturn(input: CreateReturnInput): Promise<Return>;
}
