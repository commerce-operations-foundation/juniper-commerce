import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const proto = req.headers.get('x-forwarded-proto') ?? 'http';
  const host = req.headers.get('host') ?? 'localhost:3000';
  const baseUrl = `${proto}://${host}`;

  return NextResponse.json({
    version: '1.0',
    name: 'Juniper Commerce',
    description: 'Juniper outdoor gear commerce platform — onX reference implementation with full UCP integration',
    baseUrl,
    capabilities: [
      {
        id: 'dev.ucp.shopping.catalog',
        type: 'catalog',
        description: 'Browse and search Juniper outdoor gear catalog with variants and inventory status',
        endpoint: '/api/ucp/catalog',
        methods: ['GET', 'POST'],
        schema: {
          request: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Full-text search query' },
              category: { type: 'string', description: 'Product category filter' },
              limit: { type: 'integer', default: 20, maximum: 100 },
              offset: { type: 'integer', default: 0 },
            },
          },
        },
      },
      {
        id: 'dev.ucp.shopping.checkout',
        type: 'checkout',
        description: 'Submit a checkout request to create a sales order via onX create-sales-order',
        endpoint: '/api/ucp/checkout',
        methods: ['POST'],
        schema: {
          request: {
            type: 'object',
            required: ['items', 'customer', 'shippingAddress'],
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['sku', 'quantity'],
                  properties: {
                    sku: { type: 'string' },
                    quantity: { type: 'integer', minimum: 1 },
                  },
                },
              },
              customer: {
                type: 'object',
                required: ['email', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  phone: { type: 'string' },
                },
              },
              shippingAddress: {
                type: 'object',
                required: ['address1', 'city', 'stateOrProvince', 'zipCodeOrPostalCode', 'country'],
                properties: {
                  address1: { type: 'string' },
                  address2: { type: 'string' },
                  city: { type: 'string' },
                  stateOrProvince: { type: 'string' },
                  zipCodeOrPostalCode: { type: 'string' },
                  country: { type: 'string' },
                },
              },
            },
          },
        },
      },
      {
        id: 'dev.ucp.shopping.fulfillment',
        type: 'fulfillment',
        description: 'Query fulfillment status and tracking for orders via onX get-fulfillments',
        endpoint: '/api/ucp/fulfillment',
        methods: ['GET', 'POST'],
        schema: {
          request: {
            type: 'object',
            required: ['orderId'],
            properties: {
              orderId: { type: 'string', description: 'onX order ID or external order ID' },
            },
          },
        },
      },
    ],
    auth: {
      type: 'apiKey',
      description: 'Pass API key in Authorization header as Bearer token. For production, implement OAuth 2.0 client credentials flow.',
      apiKeyHeader: 'Authorization',
      scopes: ['onx:inventory:read', 'onx:orders:write', 'onx:fulfillment:read'],
    },
    onxVersion: '1.0',
    mcpTools: [
      'get-products', 'get-product-variants', 'get-inventory',
      'create-sales-order', 'get-orders', 'get-fulfillments',
      'fulfill-order', 'cancel-order', 'get-customers',
      'get-returns', 'create-return', 'update-order',
    ],
  });
}
