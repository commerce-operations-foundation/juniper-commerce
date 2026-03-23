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

let pg: any;

function getPool() {
  if (!pg) {
    const { Pool } = require('pg');
    pg = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pg;
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
    dimensions: r.dim_length ? { length: r.dim_length, width: r.dim_width, height: r.dim_height, unit: r.dim_unit } : undefined,
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
    expectedShipDate: r.expected_ship_date,
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

export class PostgresProvider implements DataProvider {
  private pool: any;
  private seeded = false;

  constructor() {
    this.pool = getPool();
  }

  private async ensureSeeded(): Promise<void> {
    if (this.seeded) return;
    this.seeded = true;

    if (process.env.SEED_DATA !== 'true') return;

    try {
      const check = await this.pool.query('SELECT COUNT(*) FROM products');
      if (parseInt(check.rows[0].count) > 0) return;

      const { getSeedRows } = require('../seed/seed-db');
      const rows = getSeedRows();
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        for (const row of rows) {
          const placeholders = row.values.map((_: any, i: number) => `$${i + 1}`).join(',');
          await client.query(
            `INSERT INTO ${row.table} (${row.columns.join(',')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
            row.values
          );
        }
        await client.query('COMMIT');
        console.log('[seed] Inserted seed data into PostgreSQL');
      } catch (e) {
        await client.query('ROLLBACK');
        console.error('[seed] Failed to seed PostgreSQL:', e);
      } finally {
        client.release();
      }
    } catch {
      // Tables may not exist yet
    }
  }

  async getProducts(filter?: ProductFilter): Promise<PaginatedResult<Product>> {
    await this.ensureSeeded();
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (filter?.status) { conditions.push(`status = $${idx++}`); params.push(filter.status); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filter?.limit ?? 50;
    const offset = filter?.offset ?? 0;

    const countRes = await this.pool.query(`SELECT COUNT(*) FROM products ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    const dataRes = await this.pool.query(
      `SELECT * FROM products ${where} ORDER BY name LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );

    let items = dataRes.rows.map(rowToProduct);
    if (filter?.tags?.length) {
      items = items.filter((p: Product) => filter.tags!.some(t => p.tags?.includes(t)));
    }

    return { items, total };
  }

  async getProductById(id: string): Promise<Product | null> {
    const res = await this.pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return res.rows[0] ? rowToProduct(res.rows[0]) : null;
  }

  async getProductVariants(filter?: VariantFilter): Promise<PaginatedResult<ProductVariant>> {
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (filter?.productId) { conditions.push(`product_id = $${idx++}`); params.push(filter.productId); }
    if (filter?.sku) { conditions.push(`sku = $${idx++}`); params.push(filter.sku); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const res = await this.pool.query(`SELECT * FROM product_variants ${where} ORDER BY sku`, params);

    const items = res.rows.map(rowToVariant);
    return { items, total: items.length };
  }

  async getVariantBySku(sku: string): Promise<ProductVariant | null> {
    const res = await this.pool.query('SELECT * FROM product_variants WHERE sku = $1', [sku]);
    return res.rows[0] ? rowToVariant(res.rows[0]) : null;
  }

  async getCategories(): Promise<string[]> {
    const res = await this.pool.query('SELECT DISTINCT categories FROM products WHERE categories IS NOT NULL');
    const cats = new Set<string>();
    for (const row of res.rows) {
      const parsed = parseJson(row.categories);
      if (Array.isArray(parsed)) parsed.forEach((c: string) => cats.add(c));
    }
    return Array.from(cats).sort();
  }

  async getInventory(filter?: InventoryFilter): Promise<PaginatedResult<InventoryItem>> {
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (filter?.sku) { conditions.push(`sku = $${idx++}`); params.push(filter.sku); }
    if (filter?.locationId) { conditions.push(`location_id = $${idx++}`); params.push(filter.locationId); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const res = await this.pool.query(`SELECT * FROM inventory ${where} ORDER BY sku, location_id`, params);

    const items: InventoryItem[] = res.rows.map((r: any) => ({
      tenantId: r.tenant_id, sku: r.sku, locationId: r.location_id,
      onHand: r.on_hand, unavailable: r.unavailable, available: r.available,
    }));
    return { items, total: items.length };
  }

  async getTotalAvailableBySku(sku: string): Promise<number> {
    const res = await this.pool.query('SELECT COALESCE(SUM(available), 0) as total FROM inventory WHERE sku = $1', [sku]);
    return parseInt(res.rows[0].total);
  }

  async getCustomers(filter?: CustomerFilter): Promise<PaginatedResult<Customer>> {
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (filter?.email) { conditions.push(`email = $${idx++}`); params.push(filter.email); }
    if (filter?.type) { conditions.push(`type = $${idx++}`); params.push(filter.type); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const res = await this.pool.query(`SELECT * FROM customers ${where} ORDER BY last_name, first_name`, params);

    const items = res.rows.map(rowToCustomer);
    return { items, total: items.length };
  }

  async getOrders(filter?: OrderFilter): Promise<PaginatedResult<Order>> {
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (filter?.status) { conditions.push(`status = $${idx++}`); params.push(filter.status); }
    if (filter?.customerId) { conditions.push(`customer_id = $${idx++}`); params.push(filter.customerId); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filter?.limit ?? 50;
    const offset = filter?.offset ?? 0;

    const countRes = await this.pool.query(`SELECT COUNT(*) FROM orders ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    const dataRes = await this.pool.query(
      `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );

    const items = dataRes.rows.map(rowToOrder);
    return { items, total };
  }

  async getOrderById(id: string): Promise<Order | null> {
    const res = await this.pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    return res.rows[0] ? rowToOrder(res.rows[0]) : null;
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const countRes = await this.pool.query('SELECT COUNT(*) FROM orders');
    const seq = String(parseInt(countRes.rows[0].count) + 1).padStart(3, '0');
    const year = new Date().getFullYear();
    const id = `order_JNP_${seq}`;
    const orderName = `JNP-${year}-${seq}`;
    const now = new Date().toISOString();

    const variant = await this.getVariantBySku(input.lineItems[0]?.sku ?? '');
    const lineItems: LineItem[] = input.lineItems.map((item, idx) => ({
      id: `li_${id}_${idx + 1}`,
      sku: item.sku,
      name: item.sku,
      quantity: item.quantity,
      unitPrice: variant?.price ?? 0,
      totalPrice: (variant?.price ?? 0) * item.quantity,
    }));

    const subTotalPrice = lineItems.reduce((s, li) => s + (li.totalPrice ?? 0), 0);
    const orderTax = Math.round(subTotalPrice * 0.0875 * 100) / 100;
    const shippingPrice = subTotalPrice >= 150 ? 0 : 9.99;
    const totalPrice = subTotalPrice + orderTax + shippingPrice;

    const customerData = {
      id: `cust_${Date.now()}`, createdAt: now, updatedAt: now,
      tenantId: 'juniper_001', ...input.customer,
    };

    await this.pool.query(
      `INSERT INTO orders (id, external_id, created_at, updated_at, tenant_id, name, status, customer_id, customer_data, line_items, billing_address, shipping_address, currency, sub_total_price, order_tax, shipping_price, total_price, order_note, order_source, custom_fields, payment_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
      [id, orderName, now, now, 'juniper_001', orderName, 'confirmed', customerData.id,
       JSON.stringify(customerData), JSON.stringify(lineItems),
       JSON.stringify({ ...input.shippingAddress, firstName: input.customer.firstName, lastName: input.customer.lastName }),
       JSON.stringify({ ...input.shippingAddress, firstName: input.customer.firstName, lastName: input.customer.lastName }),
       input.currency ?? 'USD', subTotalPrice, orderTax, shippingPrice, totalPrice,
       input.orderNote, 'website', JSON.stringify([{ name: 'source', value: 'website' }]), 'paid']
    );

    return (await this.getOrderById(id))!;
  }

  async updateOrder(input: UpdateOrderInput): Promise<Order> {
    const existing = await this.getOrderById(input.orderId);
    if (!existing) throw new Error(`Order ${input.orderId} not found`);

    const now = new Date().toISOString();
    const sets: string[] = ['updated_at = $1'];
    const params: any[] = [now];
    let idx = 2;

    if (input.status) { sets.push(`status = $${idx}`); params.push(input.status); idx++; }
    if (input.orderNote !== undefined) { sets.push(`order_note = $${idx}`); params.push(input.orderNote); idx++; }
    if (input.shippingAddress) {
      const addr = { ...existing.shippingAddress, ...input.shippingAddress };
      sets.push(`shipping_address = $${idx}`); params.push(JSON.stringify(addr)); idx++;
    }
    if (input.customFields) {
      const merged = [...(existing.customFields ?? []), ...input.customFields];
      sets.push(`custom_fields = $${idx}`); params.push(JSON.stringify(merged)); idx++;
    }

    params.push(input.orderId);
    await this.pool.query(`UPDATE orders SET ${sets.join(', ')} WHERE id = $${idx}`, params);
    return (await this.getOrderById(input.orderId))!;
  }

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const now = new Date().toISOString();
    const existing = await this.getOrderById(orderId);
    if (!existing) throw new Error(`Order ${orderId} not found`);

    const customFields = [...(existing.customFields ?? []), { name: 'cancel_reason', value: reason ?? 'customer_request' }];
    await this.pool.query(
      'UPDATE orders SET status = $1, updated_at = $2, custom_fields = $3 WHERE id = $4',
      ['cancelled', now, JSON.stringify(customFields), orderId]
    );
    return (await this.getOrderById(orderId))!;
  }

  async getFulfillments(filter?: FulfillmentFilter): Promise<PaginatedResult<Fulfillment>> {
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (filter?.orderId) { conditions.push(`order_id = $${idx++}`); params.push(filter.orderId); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const res = await this.pool.query(`SELECT * FROM fulfillments ${where} ORDER BY created_at DESC`, params);

    const items = res.rows.map(rowToFulfillment);
    return { items, total: items.length };
  }

  async createFulfillment(input: CreateFulfillmentInput): Promise<Fulfillment> {
    const order = await this.getOrderById(input.orderId);
    if (!order) throw new Error(`Order ${input.orderId} not found`);

    const id = `ful_${Date.now()}`;
    const now = new Date().toISOString();
    const expectedDelivery = new Date(Date.now() + 5 * 86400000).toISOString();

    const lineItems = (input.lineItems ?? order.lineItems).map(li => ({ sku: li.sku, quantity: li.quantity }));

    await this.pool.query(
      `INSERT INTO fulfillments (id, created_at, updated_at, tenant_id, order_id, tracking_numbers, line_items, status, shipping_carrier, shipping_class, shipping_address, expected_delivery_date, location_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [id, now, now, 'juniper_001', input.orderId, JSON.stringify(input.trackingNumbers),
       JSON.stringify(lineItems), 'shipped', input.carrier, input.shippingClass ?? 'Ground',
       JSON.stringify(order.shippingAddress), expectedDelivery, 'WH001']
    );

    await this.pool.query('UPDATE orders SET status = $1, updated_at = $2 WHERE id = $3', ['shipped', now, input.orderId]);

    const res = await this.pool.query('SELECT * FROM fulfillments WHERE id = $1', [id]);
    return rowToFulfillment(res.rows[0]);
  }

  async getReturns(filter?: ReturnFilter): Promise<PaginatedResult<Return>> {
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (filter?.orderId) { conditions.push(`order_id = $${idx++}`); params.push(filter.orderId); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const res = await this.pool.query(`SELECT * FROM returns ${where} ORDER BY created_at DESC`, params);

    const items = res.rows.map(rowToReturn);
    return { items, total: items.length };
  }

  async createReturn(input: CreateReturnInput): Promise<Return> {
    const id = `ret_${Date.now()}`;
    const now = new Date().toISOString();

    await this.pool.query(
      `INSERT INTO returns (id, created_at, updated_at, tenant_id, order_id, status, outcome, return_line_items)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, now, now, 'juniper_001', input.orderId, 'requested', input.outcome ?? 'refund',
       JSON.stringify(input.returnLineItems ?? [])]
    );

    const res = await this.pool.query('SELECT * FROM returns WHERE id = $1', [id]);
    return rowToReturn(res.rows[0]);
  }
}
