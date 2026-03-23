import type { Order, Product, ProductVariant, Customer, Fulfillment, InventoryItem, Return } from '@/types/onx';
import type { DataProvider, PaginatedResult } from './data/provider';
import { InMemoryProvider } from './data/providers/memory';

export type { DataProvider } from './data/provider';

const DATA_MODE = process.env.DATA_MODE ?? 'memory';

export function getProvider(sessionId?: string): DataProvider {
  switch (DATA_MODE) {
    case 'postgres': {
      const { PostgresProvider } = require('./data/providers/postgres');
      return new PostgresProvider();
    }
    case 'sqlite': {
      const { SQLiteProvider } = require('./data/providers/sqlite');
      return new SQLiteProvider();
    }
    case 'memory':
    default:
      return new InMemoryProvider(sessionId);
  }
}

const defaultProvider = getProvider();

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(params?: {
  status?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}): Promise<{ items: Product[]; total: number }> {
  return defaultProvider.getProducts(params);
}

export async function getProductVariants(params?: {
  productId?: string;
  sku?: string;
}): Promise<{ items: ProductVariant[]; total: number }> {
  return defaultProvider.getProductVariants(params);
}

// ── Customers ─────────────────────────────────────────────────────────────────

export async function getCustomers(params?: {
  email?: string;
  type?: string;
}): Promise<{ items: Customer[]; total: number }> {
  return defaultProvider.getCustomers(params);
}

// ── Inventory ─────────────────────────────────────────────────────────────────

export async function getInventoryItems(params?: {
  sku?: string;
  locationId?: string;
}): Promise<{ items: InventoryItem[]; total: number }> {
  return defaultProvider.getInventory(params);
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getOrdersClient(params?: {
  status?: string;
  customerId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: Order[]; total: number }> {
  return defaultProvider.getOrders(params);
}

export async function getOrderClient(id: string): Promise<Order | null> {
  return defaultProvider.getOrderById(id);
}

export async function createSalesOrder(input: {
  customer: { email: string; firstName: string; lastName: string; phone?: string };
  lineItems: Array<{ sku: string; quantity: number }>;
  shippingAddress: {
    address1: string; address2?: string; city: string;
    stateOrProvince: string; zipCodeOrPostalCode: string; country: string;
  };
  currency?: string;
  orderNote?: string;
}): Promise<Order> {
  return defaultProvider.createOrder(input);
}

export async function fulfillOrderClient(input: {
  orderId: string;
  trackingNumbers: string[];
  carrier: string;
  shippingClass?: string;
  lineItems?: Array<{ sku: string; quantity: number }>;
}): Promise<Fulfillment> {
  return defaultProvider.createFulfillment(input);
}

export async function updateOrderClient(input: {
  orderId: string;
  status?: string;
  orderNote?: string;
  shippingAddress?: {
    address1: string; address2?: string; city: string;
    stateOrProvince: string; zipCodeOrPostalCode: string; country: string;
  };
  customFields?: Array<{ name: string; value: string }>;
}): Promise<Order> {
  return defaultProvider.updateOrder(input);
}

export async function cancelOrderClient(orderId: string, reason?: string): Promise<Order> {
  return defaultProvider.cancelOrder(orderId, reason);
}

export async function getFulfillmentsClient(params?: {
  orderId?: string;
}): Promise<{ items: Fulfillment[]; total: number }> {
  return defaultProvider.getFulfillments(params);
}

export async function getReturnsClient(params?: {
  orderId?: string;
}): Promise<{ items: Return[]; total: number }> {
  return defaultProvider.getReturns(params);
}

export async function createReturnClient(input: {
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
}): Promise<Return> {
  return defaultProvider.createReturn(input);
}
