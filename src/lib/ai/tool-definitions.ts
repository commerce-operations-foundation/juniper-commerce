import type { ToolDefinition } from './llm-provider';

export const ONX_TOOLS: ToolDefinition[] = [
  {
    name: 'get_products',
    description: 'Search and browse the Juniper Commerce product catalog. Returns products with name, description, price, categories, tags, and image URLs.',
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by product status (active/inactive)' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags (e.g., footwear, waterproof, new-arrival, sale)' },
        limit: { type: 'number', description: 'Max results to return (default 50)' },
      },
    },
  },
  {
    name: 'get_product_variants',
    description: 'Get SKU-level variants for a product, including size, color, price, and SKU codes. ALWAYS call this after get_products when you need to check inventory or find specific SKUs.',
    parameters: {
      type: 'object',
      properties: {
        productId: { type: 'string', description: 'Product ID to get variants for (e.g., prod_trail_runner)' },
        sku: { type: 'string', description: 'Specific SKU to look up' },
      },
    },
  },
  {
    name: 'get_inventory',
    description: 'Check real-time stock levels by SKU and warehouse. Requires a SKU code from get_product_variants.',
    parameters: {
      type: 'object',
      properties: {
        sku: { type: 'string', description: 'Product variant SKU to check stock for' },
        locationId: { type: 'string', description: 'Warehouse location ID (WH001, WH002, WH003)' },
      },
    },
  },
  {
    name: 'get_orders',
    description: 'Retrieve sales orders. Can filter by status or customer ID.',
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Order status filter (confirmed, processing, shipped, delivered, cancelled)' },
        customerId: { type: 'string', description: 'Filter by customer ID' },
        limit: { type: 'number', description: 'Max results (default 50)' },
      },
    },
  },
  {
    name: 'get_customers',
    description: 'Look up customer records by email or type (individual, wholesale).',
    parameters: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Customer email to search for' },
        type: { type: 'string', description: 'Customer type (individual, wholesale)' },
      },
    },
  },
  {
    name: 'get_fulfillments',
    description: 'Track fulfillment status, shipping carrier, and tracking numbers for an order.',
    parameters: {
      type: 'object',
      properties: {
        orderId: { type: 'string', description: 'Order ID to get fulfillments for' },
      },
    },
  },
  {
    name: 'get_returns',
    description: 'Query return/RMA records, optionally filtered by order ID.',
    parameters: {
      type: 'object',
      properties: {
        orderId: { type: 'string', description: 'Filter returns by order ID' },
      },
    },
  },
  {
    name: 'create_sales_order',
    description: 'Create a new sales order with customer details, line items (SKUs + quantities), and shipping address.',
    parameters: {
      type: 'object',
      properties: {
        customer: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
          required: ['email', 'firstName', 'lastName'],
        },
        lineItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: { sku: { type: 'string' }, quantity: { type: 'number' } },
            required: ['sku', 'quantity'],
          },
        },
        shippingAddress: {
          type: 'object',
          properties: {
            address1: { type: 'string' },
            city: { type: 'string' },
            stateOrProvince: { type: 'string' },
            zipCodeOrPostalCode: { type: 'string' },
            country: { type: 'string' },
          },
          required: ['address1', 'city', 'stateOrProvince', 'zipCodeOrPostalCode', 'country'],
        },
      },
      required: ['customer', 'lineItems', 'shippingAddress'],
    },
  },
  {
    name: 'fulfill_order',
    description: 'Ship an order by creating a fulfillment with carrier and tracking number.',
    parameters: {
      type: 'object',
      properties: {
        orderId: { type: 'string', description: 'Order ID to fulfill' },
        trackingNumbers: { type: 'array', items: { type: 'string' }, description: 'Tracking number(s)' },
        carrier: { type: 'string', description: 'Shipping carrier (UPS, FedEx, USPS, etc.)' },
      },
      required: ['orderId', 'trackingNumbers', 'carrier'],
    },
  },
  {
    name: 'update_order',
    description: 'Update an existing order — change status, add a note, update shipping address, or add custom fields.',
    parameters: {
      type: 'object',
      properties: {
        orderId: { type: 'string', description: 'Order ID to update' },
        status: { type: 'string', description: 'New order status (e.g. processing, shipped, delivered)' },
        orderNote: { type: 'string', description: 'Note to attach to the order' },
        shippingAddress: {
          type: 'object',
          description: 'Updated shipping address fields',
          properties: {
            address1: { type: 'string' },
            city: { type: 'string' },
            stateOrProvince: { type: 'string' },
            zipCodeOrPostalCode: { type: 'string' },
            country: { type: 'string' },
          },
          required: ['address1', 'city', 'stateOrProvince', 'zipCodeOrPostalCode', 'country'],
        },
        customFields: {
          type: 'array',
          items: {
            type: 'object',
            properties: { name: { type: 'string' }, value: { type: 'string' } },
            required: ['name', 'value'],
          },
          description: 'Custom key-value fields to append',
        },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'cancel_order',
    description: 'Cancel an existing order with an optional reason.',
    parameters: {
      type: 'object',
      properties: {
        orderId: { type: 'string', description: 'Order ID to cancel' },
        reason: { type: 'string', description: 'Cancellation reason' },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'create_return',
    description: 'Initiate a return/RMA for an order with line items and reason.',
    parameters: {
      type: 'object',
      properties: {
        orderId: { type: 'string', description: 'Order ID to return items from' },
        outcome: { type: 'string', enum: ['refund', 'exchange', 'store_credit'], description: 'Desired outcome' },
        returnLineItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              sku: { type: 'string' },
              quantity: { type: 'number' },
              reason: { type: 'string' },
            },
            required: ['sku', 'quantity'],
          },
        },
      },
      required: ['orderId', 'outcome', 'returnLineItems'],
    },
  },
];

export const TOOL_TO_ENDPOINT: Record<string, { path: string; method: string }> = {
  get_products:         { path: '/api/onx/products', method: 'GET' },
  get_product_variants: { path: '/api/onx/product-variants', method: 'GET' },
  get_inventory:        { path: '/api/onx/inventory', method: 'GET' },
  get_orders:           { path: '/api/onx/orders', method: 'GET' },
  get_customers:        { path: '/api/onx/customers', method: 'GET' },
  get_fulfillments:     { path: '/api/onx/fulfillments', method: 'GET' },
  get_returns:          { path: '/api/onx/returns', method: 'GET' },
  create_sales_order:   { path: '/api/onx/orders', method: 'POST' },
  update_order:         { path: '/api/onx/orders/update', method: 'POST' },
  fulfill_order:        { path: '/api/onx/fulfillments', method: 'POST' },
  cancel_order:         { path: '/api/onx/orders/cancel', method: 'POST' },
  create_return:        { path: '/api/onx/returns', method: 'POST' },
};

export const SYSTEM_PROMPT = `You are the Juniper Commerce AI assistant. You help with commerce operations using the onX standard tools.

CRITICAL — MULTI-STEP TOOL CHAINING:
You have access to 12 onX tools. Many queries require calling MULTIPLE tools in sequence. Do NOT ask the user for information you can look up yourself. Examples:

1. "Check inventory for hiking boots" →
   Step 1: get_products (find hiking boots, get product IDs)
   Step 2: get_product_variants (get SKUs for those products)
   Step 3: get_inventory (check stock for each SKU)

2. "What waterproof products are in stock?" →
   Step 1: get_products with tags=["waterproof"]
   Step 2: get_product_variants for each product
   Step 3: get_inventory for each SKU

3. "Show me order details and shipping status" →
   Step 1: get_orders
   Step 2: get_fulfillments for each order

RULES:
- ALWAYS chain tools automatically. Never ask the user for SKUs, product IDs, or order IDs when you can look them up.
- When you need inventory, ALWAYS call get_product_variants first to get SKUs, then get_inventory.
- Be concise. Use short paragraphs and clean formatting.
- When listing products, show: name, price, and one key feature.
- When reporting inventory, show stock per warehouse clearly.
- ONLY answer commerce-related questions. For anything else, redirect: "I'm the Juniper Commerce assistant. I can help you browse outdoor gear, check inventory, or look up orders."
- Never fabricate product names, prices, or stock levels — always use tool results.

AVAILABLE TOOLS (11 of 12 onX standard operations):
Queries: get_products, get_product_variants, get_inventory, get_orders, get_customers, get_fulfillments, get_returns
Actions: create_sales_order, fulfill_order, cancel_order, create_return

Product categories: Footwear, Packs & Bags, Shelter, Apparel, Accessories, Sleep
Warehouses: WH001 (Portland), WH002 (Denver), WH003 (Asheville)

This store runs on the onX (Order Network eXchange) standard. Every tool call hits a real onX API endpoint.`;
