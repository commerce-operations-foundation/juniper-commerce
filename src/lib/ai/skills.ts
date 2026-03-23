export interface Skill {
  id: string;
  name: string;
  description: string;
  preview: true;
  steps: SkillStep[];
}

export interface SkillStep {
  tool: string;
  description: string;
  inputTemplate: Record<string, unknown>;
}

export const SKILLS: Skill[] = [
  {
    id: 'order-lifecycle',
    name: 'Order Lifecycle',
    description: 'Complete order lifecycle: create order, fulfill, and track shipment. Demonstrates the full commerce flow from purchase to delivery.',
    preview: true,
    steps: [
      {
        tool: 'get_products',
        description: 'Find a product to order',
        inputTemplate: { limit: 3 },
      },
      {
        tool: 'get_product_variants',
        description: 'Get available SKUs',
        inputTemplate: { productId: '{{productId}}' },
      },
      {
        tool: 'get_inventory',
        description: 'Verify stock availability',
        inputTemplate: { sku: '{{sku}}' },
      },
      {
        tool: 'create_sales_order',
        description: 'Place the order',
        inputTemplate: {
          customer: { email: 'skill-demo@juniper.com', firstName: 'Skill', lastName: 'Demo' },
          lineItems: [{ sku: '{{sku}}', quantity: 1 }],
          shippingAddress: {
            address1: '100 Skill Lane', city: 'Portland',
            stateOrProvince: 'OR', zipCodeOrPostalCode: '97201', country: 'US',
          },
        },
      },
      {
        tool: 'fulfill_order',
        description: 'Ship the order',
        inputTemplate: {
          orderId: '{{orderId}}',
          trackingNumbers: ['SKILL123456789'],
          carrier: 'UPS',
        },
      },
      {
        tool: 'get_fulfillments',
        description: 'Verify fulfillment',
        inputTemplate: { orderId: '{{orderId}}' },
      },
    ],
  },
  {
    id: 'return-processing',
    name: 'Return Processing',
    description: 'Find an order, initiate a return with reason, and verify the return was created. Covers the full return/RMA flow.',
    preview: true,
    steps: [
      {
        tool: 'get_orders',
        description: 'Find a delivered order',
        inputTemplate: { status: 'delivered', limit: 3 },
      },
      {
        tool: 'create_return',
        description: 'Initiate return',
        inputTemplate: {
          orderId: '{{orderId}}',
          outcome: 'refund',
          returnLineItems: [{ sku: '{{sku}}', quantity: 1, reason: 'wrong_size' }],
        },
      },
      {
        tool: 'get_returns',
        description: 'Verify return created',
        inputTemplate: { orderId: '{{orderId}}' },
      },
    ],
  },
  {
    id: 'inventory-check',
    name: 'Inventory Audit',
    description: 'Check inventory across all warehouses for a product category and identify low-stock items.',
    preview: true,
    steps: [
      {
        tool: 'get_products',
        description: 'List products in category',
        inputTemplate: { limit: 5 },
      },
      {
        tool: 'get_product_variants',
        description: 'Get all SKUs',
        inputTemplate: { productId: '{{productId}}' },
      },
      {
        tool: 'get_inventory',
        description: 'Check stock per SKU',
        inputTemplate: { sku: '{{sku}}' },
      },
    ],
  },
];
