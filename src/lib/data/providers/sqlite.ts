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

let db: any;

function getDb() {
  if (!db) {
    const Database = require('better-sqlite3');
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') ?? './db/juniper.db';
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function parseJson(val: string | null): any {
  if (!val) return undefined;
  try { return JSON.parse(val); } catch { return undefined; }
}

function rowToProduct(r: any): Product {
  return {
    id: r.id, externalId: r.external_id,
    createdAt: r.created_at, updatedAt: r.updated_at,
    tenantId: r.tenant_id, name: r.name,
    description: r.description, handle: r.handle,
    status: r.status, vendor: r.vendor,
    tags: parseJson(r.tags), categories: parseJson(r.categories),
    options: parseJson(r.options) ?? [],
    imageURLs: parseJson(r.image_urls),
    customFields: parseJson(r.custom_fields),
  };
}

function rowToVariant(r: any): ProductVariant {
  return {
    id: r.id, productId: r.product_id, externalId: r.external_id,
    createdAt: r.created_at, updatedAt: r.updated_at,
    tenantId: r.tenant_id, sku: r.sku, barcode: r.barcode,
    title: r.title, selectedOptions: parseJson(r.selected_options),
    price: r.price, currency: r.currency,
    compareAtPrice: r.compare_at_price, cost: r.cost,
    weight: r.weight_value ? { value: r.weight_value, unit: r.weight_unit } : undefined,
    imageURLs: parseJson(r.image_urls),
    taxable: !!r.taxable, inventoryNotTracked: !!r.inventory_not_tracked,
    customFields: parseJson(r.custom_fields),
  };
}

function rowToCustomer(r: any): Customer {
  return {
    id: r.id, createdAt: r.created_at, updatedAt: r.updated_at,
    tenantId: r.tenant_id, firstName: r.first_name, lastName: r.last_name,
    email: r.email, phone: r.phone, type: r.type, status: r.status,
    notes: r.notes, addresses: parseJson(r.addresses),
    customFields: parseJson(r.custom_fields), tags: parseJson(r.tags),
  };
}

function rowToOrder(r: any): Order {
  return {
    id: r.id, externalId: r.external_id,
    createdAt: r.created_at, updatedAt: r.updated_at,
    tenantId: r.tenant_id, name: r.name, status: r.status,
    customer: parseJson(r.customer_data),
    lineItems: parseJson(r.line_items) ?? [],
    billingAddress: parseJson(r.billing_address),
    shippingAddress: parseJson(r.shipping_address),
    currency: r.currency, subTotalPrice: r.sub_total_price,
    orderTax: r.order_tax, shippingPrice: r.shipping_price,
    totalPrice: r.total_price, orderNote: r.order_note,
    orderSource: r.order_source, shippingCarrier: r.shipping_carrier,
    shippingClass: r.shipping_class,
    tags: parseJson(r.tags), customFields: parseJson(r.custom_fields),
    paymentStatus: r.payment_status,
  };
}

function rowToFulfillment(r: any): Fulfillment {
  return {
    id: r.id, createdAt: r.created_at, updatedAt: r.updated_at,
    tenantId: r.tenant_id, orderId: r.order_id,
    trackingNumbers: parseJson(r.tracking_numbers) ?? [],
    lineItems: parseJson(r.line_items) ?? [],
    status: r.status, shippingCarrier: r.shipping_carrier,
    shippingClass: r.shipping_class,
    shippingAddress: parseJson(r.shipping_address),
    expectedDeliveryDate: r.expected_delivery_date,
    locationId: r.location_id, customFields: parseJson(r.custom_fields),
  };
}

function rowToReturn(r: any): Return {
  return {
    id: r.id, returnNumber: r.return_number, orderId: r.order_id,
    status: r.status, outcome: r.outcome,
    createdAt: r.created_at, updatedAt: r.updated_at,
    tenantId: r.tenant_id,
    returnLineItems: parseJson(r.return_line_items),
    totalQuantity: r.total_quantity, returnTotal: r.return_total,
    refundAmount: r.refund_amount, restockingFee: r.restocking_fee,
    refundStatus: r.refund_status, refundMethod: r.refund_method,
    completedAt: r.completed_at,
  };
}

export class SQLiteProvider implements DataProvider {
  private db: any;
  private seeded = false;

  constructor() {
    this.db = getDb();
    this.ensureSchema();
  }

  private ensureSchema(): void {
    try {
      const fs = require('fs');
      const path = require('path');
      const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        this.db.exec(schema);
      }
    } catch {
      // Schema may already exist
    }
  }

  private ensureSeeded(): void {
    if (this.seeded) return;
    this.seeded = true;

    if (process.env.SEED_DATA !== 'true') return;

    try {
      const count = this.db.prepare('SELECT COUNT(*) as c FROM products').get().c;
      if (count > 0) return;

      const { getSeedRows } = require('../seed/seed-db');
      const rows = getSeedRows();
      const txn = this.db.transaction(() => {
        for (const row of rows) {
          const placeholders = row.values.map(() => '?').join(',');
          this.db.prepare(
            `INSERT OR IGNORE INTO ${row.table} (${row.columns.join(',')}) VALUES (${placeholders})`
          ).run(...row.values);
        }
      });
      txn();
      console.log('[seed] Inserted seed data into SQLite');
    } catch (e) {
      console.error('[seed] Failed to seed SQLite:', e);
    }
  }

  async getProducts(filter?: ProductFilter): Promise<PaginatedResult<Product>> {
    this.ensureSeeded();
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter?.status) { conditions.push('status = ?'); params.push(filter.status); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filter?.limit ?? 50;
    const offset = filter?.offset ?? 0;

    const total = this.db.prepare(`SELECT COUNT(*) as c FROM products ${where}`).get(...params).c;
    const rows = this.db.prepare(`SELECT * FROM products ${where} ORDER BY name LIMIT ? OFFSET ?`).all(...params, limit, offset);

    let items = rows.map(rowToProduct);
    if (filter?.tags?.length) {
      items = items.filter((p: Product) => filter.tags!.some(t => p.tags?.includes(t)));
    }

    return { items, total };
  }

  async getProductById(id: string): Promise<Product | null> {
    const row = this.db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return row ? rowToProduct(row) : null;
  }

  async getProductVariants(filter?: VariantFilter): Promise<PaginatedResult<ProductVariant>> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter?.productId) { conditions.push('product_id = ?'); params.push(filter.productId); }
    if (filter?.sku) { conditions.push('sku = ?'); params.push(filter.sku); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = this.db.prepare(`SELECT * FROM product_variants ${where} ORDER BY sku`).all(...params);

    const items = rows.map(rowToVariant);
    return { items, total: items.length };
  }

  async getVariantBySku(sku: string): Promise<ProductVariant | null> {
    const row = this.db.prepare('SELECT * FROM product_variants WHERE sku = ?').get(sku);
    return row ? rowToVariant(row) : null;
  }

  async getCategories(): Promise<string[]> {
    const rows = this.db.prepare('SELECT DISTINCT categories FROM products WHERE categories IS NOT NULL').all();
    const cats = new Set<string>();
    for (const row of rows) {
      const parsed = parseJson(row.categories);
      if (Array.isArray(parsed)) parsed.forEach((c: string) => cats.add(c));
    }
    return Array.from(cats).sort();
  }

  async getInventory(filter?: InventoryFilter): Promise<PaginatedResult<InventoryItem>> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter?.sku) { conditions.push('sku = ?'); params.push(filter.sku); }
    if (filter?.locationId) { conditions.push('location_id = ?'); params.push(filter.locationId); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = this.db.prepare(`SELECT * FROM inventory ${where} ORDER BY sku, location_id`).all(...params);

    const items: InventoryItem[] = rows.map((r: any) => ({
      tenantId: r.tenant_id, sku: r.sku, locationId: r.location_id,
      onHand: r.on_hand, unavailable: r.unavailable, available: r.available,
    }));
    return { items, total: items.length };
  }

  async getTotalAvailableBySku(sku: string): Promise<number> {
    const row = this.db.prepare('SELECT COALESCE(SUM(available), 0) as total FROM inventory WHERE sku = ?').get(sku);
    return row.total;
  }

  async getCustomers(filter?: CustomerFilter): Promise<PaginatedResult<Customer>> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter?.email) { conditions.push('email = ?'); params.push(filter.email); }
    if (filter?.type) { conditions.push('type = ?'); params.push(filter.type); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = this.db.prepare(`SELECT * FROM customers ${where} ORDER BY last_name, first_name`).all(...params);

    const items = rows.map(rowToCustomer);
    return { items, total: items.length };
  }

  async getOrders(filter?: OrderFilter): Promise<PaginatedResult<Order>> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter?.status) { conditions.push('status = ?'); params.push(filter.status); }
    if (filter?.customerId) { conditions.push('customer_id = ?'); params.push(filter.customerId); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filter?.limit ?? 50;
    const offset = filter?.offset ?? 0;

    const total = this.db.prepare(`SELECT COUNT(*) as c FROM orders ${where}`).get(...params).c;
    const rows = this.db.prepare(`SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);

    const items = rows.map(rowToOrder);
    return { items, total };
  }

  async getOrderById(id: string): Promise<Order | null> {
    const row = this.db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    return row ? rowToOrder(row) : null;
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const count = this.db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
    const seq = String(count + 1).padStart(3, '0');
    const year = new Date().getFullYear();
    const id = `order_JNP_${seq}`;
    const orderName = `JNP-${year}-${seq}`;
    const now = new Date().toISOString();

    const variantRow = this.db.prepare('SELECT * FROM product_variants WHERE sku = ?').get(input.lineItems[0]?.sku ?? '');
    const variant = variantRow ? rowToVariant(variantRow) : null;

    const lineItems: LineItem[] = input.lineItems.map((item, idx) => ({
      id: `li_${id}_${idx + 1}`, sku: item.sku, name: item.sku,
      quantity: item.quantity, unitPrice: variant?.price ?? 0,
      totalPrice: (variant?.price ?? 0) * item.quantity,
    }));

    const subTotalPrice = lineItems.reduce((s, li) => s + (li.totalPrice ?? 0), 0);
    const orderTax = Math.round(subTotalPrice * 0.0875 * 100) / 100;
    const shippingPrice = subTotalPrice >= 150 ? 0 : 9.99;
    const totalPrice = subTotalPrice + orderTax + shippingPrice;

    const customerData = { id: `cust_${Date.now()}`, createdAt: now, updatedAt: now, tenantId: 'juniper_001', ...input.customer };
    const addr = { ...input.shippingAddress, firstName: input.customer.firstName, lastName: input.customer.lastName };

    this.db.prepare(
      `INSERT INTO orders (id, external_id, created_at, updated_at, tenant_id, name, status, customer_id, customer_data, line_items, billing_address, shipping_address, currency, sub_total_price, order_tax, shipping_price, total_price, order_note, order_source, custom_fields, payment_status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(id, orderName, now, now, 'juniper_001', orderName, 'confirmed', customerData.id,
      JSON.stringify(customerData), JSON.stringify(lineItems), JSON.stringify(addr), JSON.stringify(addr),
      input.currency ?? 'USD', subTotalPrice, orderTax, shippingPrice, totalPrice,
      input.orderNote, 'website', JSON.stringify([{ name: 'source', value: 'website' }]), 'paid');

    return (await this.getOrderById(id))!;
  }

  async updateOrder(input: UpdateOrderInput): Promise<Order> {
    const existing = await this.getOrderById(input.orderId);
    if (!existing) throw new Error(`Order ${input.orderId} not found`);

    const now = new Date().toISOString();
    const sets: string[] = ['updated_at = ?'];
    const params: any[] = [now];

    if (input.status) { sets.push('status = ?'); params.push(input.status); }
    if (input.orderNote !== undefined) { sets.push('order_note = ?'); params.push(input.orderNote); }
    if (input.shippingAddress) {
      const addr = { ...existing.shippingAddress, ...input.shippingAddress };
      sets.push('shipping_address = ?'); params.push(JSON.stringify(addr));
    }
    if (input.customFields) {
      const merged = [...(existing.customFields ?? []), ...input.customFields];
      sets.push('custom_fields = ?'); params.push(JSON.stringify(merged));
    }

    params.push(input.orderId);
    this.db.prepare(`UPDATE orders SET ${sets.join(', ')} WHERE id = ?`).run(...params);
    return (await this.getOrderById(input.orderId))!;
  }

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const existing = await this.getOrderById(orderId);
    if (!existing) throw new Error(`Order ${orderId} not found`);

    const now = new Date().toISOString();
    const customFields = [...(existing.customFields ?? []), { name: 'cancel_reason', value: reason ?? 'customer_request' }];
    this.db.prepare('UPDATE orders SET status = ?, updated_at = ?, custom_fields = ? WHERE id = ?')
      .run('cancelled', now, JSON.stringify(customFields), orderId);
    return (await this.getOrderById(orderId))!;
  }

  async getFulfillments(filter?: FulfillmentFilter): Promise<PaginatedResult<Fulfillment>> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter?.orderId) { conditions.push('order_id = ?'); params.push(filter.orderId); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = this.db.prepare(`SELECT * FROM fulfillments ${where} ORDER BY created_at DESC`).all(...params);

    const items = rows.map(rowToFulfillment);
    return { items, total: items.length };
  }

  async createFulfillment(input: CreateFulfillmentInput): Promise<Fulfillment> {
    const order = await this.getOrderById(input.orderId);
    if (!order) throw new Error(`Order ${input.orderId} not found`);

    const id = `ful_${Date.now()}`;
    const now = new Date().toISOString();
    const expectedDelivery = new Date(Date.now() + 5 * 86400000).toISOString();
    const lineItems = (input.lineItems ?? order.lineItems).map(li => ({ sku: li.sku, quantity: li.quantity }));

    this.db.prepare(
      `INSERT INTO fulfillments (id, created_at, updated_at, tenant_id, order_id, tracking_numbers, line_items, status, shipping_carrier, shipping_class, shipping_address, expected_delivery_date, location_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(id, now, now, 'juniper_001', input.orderId, JSON.stringify(input.trackingNumbers),
      JSON.stringify(lineItems), 'shipped', input.carrier, input.shippingClass ?? 'Ground',
      JSON.stringify(order.shippingAddress), expectedDelivery, 'WH001');

    this.db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?').run('shipped', now, input.orderId);

    const row = this.db.prepare('SELECT * FROM fulfillments WHERE id = ?').get(id);
    return rowToFulfillment(row);
  }

  async getReturns(filter?: ReturnFilter): Promise<PaginatedResult<Return>> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter?.orderId) { conditions.push('order_id = ?'); params.push(filter.orderId); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = this.db.prepare(`SELECT * FROM returns ${where} ORDER BY created_at DESC`).all(...params);

    const items = rows.map(rowToReturn);
    return { items, total: items.length };
  }

  async createReturn(input: CreateReturnInput): Promise<Return> {
    const id = `ret_${Date.now()}`;
    const now = new Date().toISOString();

    this.db.prepare(
      `INSERT INTO returns (id, created_at, updated_at, tenant_id, order_id, status, outcome, return_line_items)
       VALUES (?,?,?,?,?,?,?,?)`
    ).run(id, now, now, 'juniper_001', input.orderId, 'requested', input.outcome ?? 'refund',
      JSON.stringify(input.returnLineItems ?? []));

    const row = this.db.prepare('SELECT * FROM returns WHERE id = ?').get(id);
    return rowToReturn(row);
  }
}
