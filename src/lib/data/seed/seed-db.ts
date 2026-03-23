import { products, productVariants } from '../products';
import { customers } from '../customers';
import { getOrders, getFulfillments, getReturns } from '../orders';
import { getInventory } from '../inventory';

function jsonStr(v: any): string | null {
  if (v === undefined || v === null) return null;
  return JSON.stringify(v);
}

export interface SeedRow {
  table: string;
  columns: string[];
  values: (string | number | null)[];
}

export function getSeedRows(): SeedRow[] {
  const rows: SeedRow[] = [];

  for (const p of products) {
    rows.push({
      table: 'products',
      columns: ['id','external_id','created_at','updated_at','tenant_id','name','description','handle','status','vendor','tags','categories','options','image_urls','custom_fields'],
      values: [p.id, p.externalId ?? null, p.createdAt, p.updatedAt, p.tenantId, p.name, p.description ?? null, p.handle ?? null, p.status ?? 'active', p.vendor ?? null, jsonStr(p.tags), jsonStr(p.categories), jsonStr(p.options), jsonStr(p.imageURLs), jsonStr(p.customFields)],
    });
  }

  for (const v of productVariants) {
    rows.push({
      table: 'product_variants',
      columns: ['id','product_id','external_id','created_at','updated_at','tenant_id','sku','title','selected_options','price','currency','compare_at_price','cost','weight_value','weight_unit','image_urls','taxable','inventory_not_tracked'],
      values: [v.id, v.productId, v.externalId ?? null, v.createdAt, v.updatedAt, v.tenantId, v.sku, v.title ?? null, jsonStr(v.selectedOptions), v.price ?? 0, v.currency ?? 'USD', v.compareAtPrice ?? null, v.cost ?? null, v.weight?.value ?? null, v.weight?.unit ?? null, jsonStr(v.imageURLs), v.taxable ? 1 : 0, v.inventoryNotTracked ? 1 : 0],
    });
  }

  for (const c of customers) {
    rows.push({
      table: 'customers',
      columns: ['id','created_at','updated_at','tenant_id','first_name','last_name','email','phone','type','status','addresses','custom_fields','tags'],
      values: [c.id, c.createdAt, c.updatedAt, c.tenantId, c.firstName ?? null, c.lastName ?? null, c.email ?? null, c.phone ?? null, c.type ?? 'individual', c.status ?? 'active', jsonStr(c.addresses), jsonStr(c.customFields), jsonStr(c.tags)],
    });
  }

  for (const o of getOrders()) {
    rows.push({
      table: 'orders',
      columns: ['id','external_id','created_at','updated_at','tenant_id','name','status','customer_id','customer_data','line_items','billing_address','shipping_address','currency','sub_total_price','order_tax','shipping_price','total_price','order_source','shipping_carrier','shipping_class','tags','custom_fields','payment_status'],
      values: [o.id, o.externalId ?? null, o.createdAt, o.updatedAt, o.tenantId, o.name ?? null, o.status ?? 'confirmed', o.customer?.id ?? null, jsonStr(o.customer), jsonStr(o.lineItems), jsonStr(o.billingAddress), jsonStr(o.shippingAddress), o.currency ?? 'USD', o.subTotalPrice ?? 0, o.orderTax ?? 0, o.shippingPrice ?? 0, o.totalPrice ?? 0, o.orderSource ?? null, o.shippingCarrier ?? null, o.shippingClass ?? null, jsonStr(o.tags), jsonStr(o.customFields), o.paymentStatus ?? null],
    });
  }

  for (const f of getFulfillments()) {
    rows.push({
      table: 'fulfillments',
      columns: ['id','created_at','updated_at','tenant_id','order_id','tracking_numbers','line_items','status','shipping_carrier','shipping_class','shipping_address','expected_delivery_date','location_id'],
      values: [f.id, f.createdAt, f.updatedAt, f.tenantId, f.orderId, jsonStr(f.trackingNumbers), jsonStr(f.lineItems), f.status ?? 'shipped', f.shippingCarrier ?? null, f.shippingClass ?? null, jsonStr(f.shippingAddress), f.expectedDeliveryDate ?? null, f.locationId ?? null],
    });
  }

  for (const r of getReturns()) {
    rows.push({
      table: 'returns',
      columns: ['id','return_number','order_id','created_at','updated_at','tenant_id','status','outcome','return_line_items','total_quantity','return_total','refund_amount','restocking_fee','refund_status','refund_method','completed_at'],
      values: [r.id, r.returnNumber ?? null, r.orderId, r.createdAt, r.updatedAt, r.tenantId, r.status ?? 'requested', r.outcome ?? null, jsonStr(r.returnLineItems), r.totalQuantity ?? null, r.returnTotal ?? null, r.refundAmount ?? null, r.restockingFee ?? null, r.refundStatus ?? null, r.refundMethod ?? null, r.completedAt ?? null],
    });
  }

  for (const inv of getInventory()) {
    rows.push({
      table: 'inventory',
      columns: ['tenant_id','sku','location_id','on_hand','unavailable','available'],
      values: [inv.tenantId, inv.sku, inv.locationId, inv.onHand ?? 0, inv.unavailable ?? 0, inv.available ?? 0],
    });
  }

  return rows;
}
