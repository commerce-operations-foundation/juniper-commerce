import { Customer } from '@/types/onx';

const tenantId = 'juniper_001';
const now = new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export const customers: Customer[] = [
  {
    id: 'cust_alex_chen',
    createdAt: daysAgo(400),
    updatedAt: daysAgo(5),
    tenantId,
    firstName: 'Alex',
    lastName: 'Chen',
    email: 'alex.chen@example.com',
    phone: '+1-415-555-0101',
    type: 'individual',
    status: 'active',
    addresses: [
      {
        name: 'home',
        address: {
          firstName: 'Alex',
          lastName: 'Chen',
          address1: '847 Pine Street',
          address2: 'Unit 3C',
          city: 'San Francisco',
          stateOrProvince: 'CA',
          zipCodeOrPostalCode: '94108',
          country: 'US',
          email: 'alex.chen@example.com',
          phone: '+1-415-555-0101',
        },
      },
    ],
    customFields: [
      { name: 'loyalty_tier', value: 'gold' },
      { name: 'total_orders', value: '14' },
    ],
    tags: ['returning', 'vip', 'trail-runner'],
  },
  {
    id: 'cust_jordan_rivera',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(1),
    tenantId,
    firstName: 'Jordan',
    lastName: 'Rivera',
    email: 'jordan.rivera@example.com',
    phone: '+1-303-555-0202',
    type: 'individual',
    status: 'active',
    addresses: [
      {
        name: 'home',
        address: {
          firstName: 'Jordan',
          lastName: 'Rivera',
          address1: '2204 Larimer Street',
          city: 'Denver',
          stateOrProvince: 'CO',
          zipCodeOrPostalCode: '80205',
          country: 'US',
          email: 'jordan.rivera@example.com',
          phone: '+1-303-555-0202',
        },
      },
    ],
    customFields: [
      { name: 'loyalty_tier', value: 'bronze' },
      { name: 'total_orders', value: '1' },
    ],
    tags: ['new-customer'],
  },
  {
    id: 'cust_sam_patel',
    createdAt: daysAgo(600),
    updatedAt: daysAgo(2),
    tenantId,
    firstName: 'Sam',
    lastName: 'Patel',
    email: 'sam.patel@trailheadgear.com',
    phone: '+1-720-555-0303',
    type: 'company',
    status: 'active',
    addresses: [
      {
        name: 'business',
        address: {
          firstName: 'Sam',
          lastName: 'Patel',
          company: 'Trailhead Gear Co.',
          address1: '1510 Blake Street',
          address2: 'Suite 200',
          city: 'Denver',
          stateOrProvince: 'CO',
          zipCodeOrPostalCode: '80202',
          country: 'US',
          email: 'sam.patel@trailheadgear.com',
          phone: '+1-720-555-0303',
        },
      },
    ],
    customFields: [
      { name: 'loyalty_tier', value: 'platinum' },
      { name: 'total_orders', value: '47' },
      { name: 'account_type', value: 'wholesale' },
    ],
    tags: ['wholesale', 'b2b', 'priority'],
  },
  {
    id: 'cust_maya_okafor',
    createdAt: daysAgo(220),
    updatedAt: daysAgo(12),
    tenantId,
    firstName: 'Maya',
    lastName: 'Okafor',
    email: 'maya.okafor@example.com',
    phone: '+1-206-555-0404',
    type: 'individual',
    status: 'active',
    addresses: [
      {
        name: 'home',
        address: {
          firstName: 'Maya',
          lastName: 'Okafor',
          address1: '3412 Fremont Ave N',
          city: 'Seattle',
          stateOrProvince: 'WA',
          zipCodeOrPostalCode: '98103',
          country: 'US',
          email: 'maya.okafor@example.com',
          phone: '+1-206-555-0404',
        },
      },
    ],
    customFields: [
      { name: 'loyalty_tier', value: 'silver' },
      { name: 'total_orders', value: '6' },
    ],
    tags: ['returning', 'climber'],
  },
  {
    id: 'cust_tom_nakamura',
    createdAt: daysAgo(90),
    updatedAt: daysAgo(7),
    tenantId,
    firstName: 'Tom',
    lastName: 'Nakamura',
    email: 'tom.nakamura@example.com',
    phone: '+1-801-555-0505',
    type: 'individual',
    status: 'active',
    addresses: [
      {
        name: 'home',
        address: {
          firstName: 'Tom',
          lastName: 'Nakamura',
          address1: '789 Wasatch Blvd',
          city: 'Salt Lake City',
          stateOrProvince: 'UT',
          zipCodeOrPostalCode: '84108',
          country: 'US',
          email: 'tom.nakamura@example.com',
          phone: '+1-801-555-0505',
        },
      },
    ],
    customFields: [
      { name: 'loyalty_tier', value: 'bronze' },
      { name: 'total_orders', value: '3' },
    ],
    tags: ['ski-tourer', 'returning'],
  },
  {
    id: 'cust_high_country_outfitters',
    createdAt: daysAgo(730),
    updatedAt: daysAgo(15),
    tenantId,
    firstName: 'Chris',
    lastName: 'Vandenberg',
    email: 'orders@highcountryoutfitters.com',
    phone: '+1-970-555-0606',
    type: 'company',
    status: 'active',
    addresses: [
      {
        name: 'warehouse',
        address: {
          firstName: 'Chris',
          lastName: 'Vandenberg',
          company: 'High Country Outfitters',
          address1: '401 Mountain Ave',
          address2: 'Dock B',
          city: 'Fort Collins',
          stateOrProvince: 'CO',
          zipCodeOrPostalCode: '80524',
          country: 'US',
          email: 'orders@highcountryoutfitters.com',
          phone: '+1-970-555-0606',
        },
      },
    ],
    customFields: [
      { name: 'loyalty_tier', value: 'platinum' },
      { name: 'total_orders', value: '83' },
      { name: 'account_type', value: 'wholesale' },
      { name: 'net_terms', value: 'Net-30' },
    ],
    tags: ['wholesale', 'b2b', 'priority', 'net-terms'],
  },
];

export function getCustomerById(id: string): Customer | undefined {
  return customers.find(c => c.id === id);
}

export function getCustomerByEmail(email: string): Customer | undefined {
  return customers.find(c => c.email === email);
}
