import type {
  Product, ProductVariant, Customer,
  Order, Fulfillment, InventoryItem, Return, LineItem,
} from '@/types/onx';
import type {
  DataProvider, PaginatedResult,
  ProductFilter, VariantFilter, CustomerFilter,
  InventoryFilter, OrderFilter, FulfillmentFilter,
  ReturnFilter, CreateOrderInput, CreateFulfillmentInput, CreateReturnInput,
  UpdateOrderInput,
} from '../provider';
import {
  products as seedProducts,
  productVariants as seedVariants,
  getVariantBySku as seedGetVariantBySku,
  getCategories as seedGetCategories,
  customers as seedCustomers,
  getSeedOrders,
  getSeedFulfillments,
  getSeedReturns,
  getSeedInventory,
} from '../seed';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

interface SessionData {
  orders: Order[];
  fulfillments: Fulfillment[];
  returns: Return[];
  inventory: InventoryItem[];
  lastAccessed: number;
}

const sessions = new Map<string, SessionData>();
const SESSION_TTL_MS = (parseInt(process.env.SESSION_TTL_MINUTES ?? '30', 10)) * 60 * 1000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessions) {
      if (now - session.lastAccessed > SESSION_TTL_MS) {
        sessions.delete(id);
      }
    }
  }, 60_000);
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

function getSession(sessionId: string): SessionData {
  let session = sessions.get(sessionId);
  if (!session) {
    session = {
      orders: deepClone(getSeedOrders()),
      fulfillments: deepClone(getSeedFulfillments()),
      returns: deepClone(getSeedReturns()),
      inventory: deepClone(getSeedInventory()),
      lastAccessed: Date.now(),
    };
    sessions.set(sessionId, session);
    startCleanup();
  }
  session.lastAccessed = Date.now();
  return session;
}

const SHARED_SESSION = '__shared__';

export class InMemoryProvider implements DataProvider {
  private sessionId: string;

  constructor(sessionId?: string) {
    this.sessionId = sessionId ?? SHARED_SESSION;
  }

  private get session(): SessionData {
    return getSession(this.sessionId);
  }

  async getProducts(filter?: ProductFilter): Promise<PaginatedResult<Product>> {
    let result = [...seedProducts];
    if (filter?.status) result = result.filter(p => p.status === filter.status);
    if (filter?.tags?.length) result = result.filter(p => filter.tags!.some(t => p.tags?.includes(t)));
    const total = result.length;
    const offset = filter?.offset ?? 0;
    const limit = filter?.limit ?? 50;
    return { items: result.slice(offset, offset + limit), total };
  }

  async getProductById(id: string): Promise<Product | null> {
    return seedProducts.find(p => p.id === id) ?? null;
  }

  async getProductVariants(filter?: VariantFilter): Promise<PaginatedResult<ProductVariant>> {
    let result = [...seedVariants];
    if (filter?.productId) result = result.filter(v => v.productId === filter.productId);
    if (filter?.sku) result = result.filter(v => v.sku === filter.sku);
    return { items: result, total: result.length };
  }

  async getVariantBySku(sku: string): Promise<ProductVariant | null> {
    return seedGetVariantBySku(sku) ?? null;
  }

  async getCategories(): Promise<string[]> {
    return seedGetCategories();
  }

  async getInventory(filter?: InventoryFilter): Promise<PaginatedResult<InventoryItem>> {
    let result = [...this.session.inventory];
    if (filter?.sku) result = result.filter(i => i.sku === filter.sku);
    if (filter?.locationId) result = result.filter(i => i.locationId === filter.locationId);
    return { items: result, total: result.length };
  }

  async getTotalAvailableBySku(sku: string): Promise<number> {
    return this.session.inventory
      .filter(i => i.sku === sku)
      .reduce((sum, i) => sum + i.available, 0);
  }

  async getCustomers(filter?: CustomerFilter): Promise<PaginatedResult<Customer>> {
    let result = [...seedCustomers];
    if (filter?.email) result = result.filter(c => c.email === filter.email);
    if (filter?.type) result = result.filter(c => c.type === filter.type);
    return { items: result, total: result.length };
  }

  async getOrders(filter?: OrderFilter): Promise<PaginatedResult<Order>> {
    let result = [...this.session.orders];
    if (filter?.status) result = result.filter(o => o.status === filter.status);
    if (filter?.customerId) result = result.filter(o => o.customer?.id === filter.customerId);
    const total = result.length;
    const offset = filter?.offset ?? 0;
    const limit = filter?.limit ?? 50;
    return { items: result.slice(offset, offset + limit), total };
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.session.orders.find(o => o.id === id) ?? null;
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const session = this.session;
    const seq = String(session.orders.length + 1).padStart(3, '0');
    const year = new Date().getFullYear();
    const id = `order_JNP_${seq}`;
    const orderName = `JNP-${year}-${seq}`;
    const now = new Date().toISOString();

    const lineItems: LineItem[] = input.lineItems.map((item, idx) => {
      const variant = seedGetVariantBySku(item.sku);
      const unitPrice = variant?.price ?? 0;
      return {
        id: `li_${id}_${idx + 1}`,
        sku: item.sku,
        name: variant?.title ?? item.sku,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      };
    });

    const subTotalPrice = lineItems.reduce((s, li) => s + (li.totalPrice ?? 0), 0);
    const orderTax = Math.round(subTotalPrice * 0.0875 * 100) / 100;
    const shippingPrice = subTotalPrice >= 150 ? 0 : 9.99;
    const totalPrice = subTotalPrice + orderTax + shippingPrice;

    const order: Order = {
      id,
      externalId: orderName,
      createdAt: now,
      updatedAt: now,
      tenantId: 'juniper_001',
      name: orderName,
      status: 'confirmed',
      paymentStatus: 'paid',
      orderSource: 'website',
      customer: {
        id: `cust_${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        tenantId: 'juniper_001',
        firstName: input.customer.firstName,
        lastName: input.customer.lastName,
        email: input.customer.email,
        phone: input.customer.phone,
      },
      lineItems,
      shippingAddress: {
        ...input.shippingAddress,
        firstName: input.customer.firstName,
        lastName: input.customer.lastName,
        email: input.customer.email,
      },
      billingAddress: {
        ...input.shippingAddress,
        firstName: input.customer.firstName,
        lastName: input.customer.lastName,
        email: input.customer.email,
      },
      currency: input.currency ?? 'USD',
      subTotalPrice,
      orderTax,
      shippingPrice,
      totalPrice,
      orderNote: input.orderNote,
      customFields: [{ name: 'source', value: 'website' }],
    };

    session.orders.push(order);
    return order;
  }

  async updateOrder(input: UpdateOrderInput): Promise<Order> {
    const session = this.session;
    const idx = session.orders.findIndex(o => o.id === input.orderId);
    if (idx === -1) throw new Error(`Order ${input.orderId} not found`);
    const order = session.orders[idx];
    session.orders[idx] = {
      ...order,
      ...(input.status && { status: input.status }),
      ...(input.orderNote !== undefined && { orderNote: input.orderNote }),
      ...(input.shippingAddress && { shippingAddress: { ...order.shippingAddress, ...input.shippingAddress } }),
      ...(input.customFields && { customFields: [...(order.customFields ?? []), ...input.customFields] }),
      updatedAt: new Date().toISOString(),
    };
    return session.orders[idx];
  }

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const session = this.session;
    const idx = session.orders.findIndex(o => o.id === orderId);
    if (idx === -1) throw new Error(`Order ${orderId} not found`);
    const order = session.orders[idx];
    session.orders[idx] = {
      ...order,
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
      customFields: [
        ...(order.customFields ?? []),
        { name: 'cancel_reason', value: reason ?? 'customer_request' },
      ],
    };
    return session.orders[idx];
  }

  async getFulfillments(filter?: FulfillmentFilter): Promise<PaginatedResult<Fulfillment>> {
    let result = [...this.session.fulfillments];
    if (filter?.orderId) result = result.filter(f => f.orderId === filter.orderId);
    return { items: result, total: result.length };
  }

  async createFulfillment(input: CreateFulfillmentInput): Promise<Fulfillment> {
    const session = this.session;
    const order = session.orders.find(o => o.id === input.orderId);
    if (!order) throw new Error(`Order ${input.orderId} not found`);

    const id = `ful_${Date.now()}`;
    const now = new Date().toISOString();
    const expectedDelivery = new Date(Date.now() + 5 * 86400000).toISOString();

    const fulfillment: Fulfillment = {
      id,
      createdAt: now,
      updatedAt: now,
      tenantId: 'juniper_001',
      orderId: input.orderId,
      status: 'shipped',
      trackingNumbers: input.trackingNumbers,
      shippingCarrier: input.carrier,
      shippingClass: input.shippingClass ?? 'Ground',
      expectedDeliveryDate: expectedDelivery,
      lineItems: (input.lineItems ?? order.lineItems).map(li => ({
        sku: li.sku,
        quantity: li.quantity,
      })),
      shippingAddress: order.shippingAddress,
      locationId: 'WH001',
    };

    session.fulfillments.push(fulfillment);

    const orderIdx = session.orders.findIndex(o => o.id === input.orderId);
    if (orderIdx !== -1) {
      session.orders[orderIdx] = { ...session.orders[orderIdx], status: 'shipped', updatedAt: now };
    }

    return fulfillment;
  }

  async getReturns(filter?: ReturnFilter): Promise<PaginatedResult<Return>> {
    let result = [...this.session.returns];
    if (filter?.orderId) result = result.filter(r => r.orderId === filter.orderId);
    return { items: result, total: result.length };
  }

  async createReturn(input: CreateReturnInput): Promise<Return> {
    const session = this.session;
    const now = new Date().toISOString();

    const ret: Return = {
      id: `ret_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      tenantId: 'juniper_001',
      orderId: input.orderId,
      status: 'requested',
      outcome: input.outcome ?? 'refund',
      returnLineItems: input.returnLineItems ?? [],
    };

    session.returns.push(ret);
    return ret;
  }
}
