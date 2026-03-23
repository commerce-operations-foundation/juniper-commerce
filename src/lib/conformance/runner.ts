import { validateAgainstSchema, validateResponseShape } from './validators';
import type { ValidationResult } from './validators';

export type TestStatus = 'pass' | 'fail' | 'error' | 'skip';

export interface TestResult {
  id: string;
  name: string;
  description: string;
  status: TestStatus;
  duration: number;
  errors: Array<{ path: string; message: string; value?: unknown }>;
  request?: { method: string; url: string; body?: unknown };
  response?: { status: number; body?: unknown };
}

export interface SuiteResult {
  endpoint: string;
  suite: string;
  passed: number;
  failed: number;
  errors: number;
  skipped: number;
  total: number;
  duration: number;
  tests: TestResult[];
}

export interface ConformanceReport {
  endpoint: string;
  timestamp: string;
  version: string;
  overallStatus: 'pass' | 'fail';
  summary: {
    passed: number;
    failed: number;
    errors: number;
    total: number;
    score: number;
  };
  suites: SuiteResult[];
}

async function runTest(
  id: string,
  name: string,
  description: string,
  fn: () => Promise<{ status: TestStatus; errors?: ValidationResult['errors']; request?: TestResult['request']; response?: TestResult['response'] }>
): Promise<TestResult> {
  const start = Date.now();
  try {
    const result = await fn();
    return {
      id,
      name,
      description,
      status: result.status,
      duration: Date.now() - start,
      errors: result.errors ?? [],
      request: result.request,
      response: result.response,
    };
  } catch (err) {
    return {
      id,
      name,
      description,
      status: 'error',
      duration: Date.now() - start,
      errors: [{ path: '(error)', message: String(err) }],
    };
  }
}

async function fetchJSON(baseUrl: string, path: string, options?: RequestInit) {
  const url = `${baseUrl.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
  let body: unknown;
  try { body = await res.json(); } catch { body = null; }
  return { status: res.status, body, url };
}

export async function runConformanceTests(endpoint: string): Promise<ConformanceReport> {
  const start = Date.now();
  const suites: SuiteResult[] = [];

  // Derive the base host (scheme + host + port) for UCP manifest and other root-level tests
  const parsedUrl = new URL(endpoint);
  const baseHost = `${parsedUrl.protocol}//${parsedUrl.host}`;

  // ── Suite 1: UCP Discovery ──────────────────────────────────────────────────
  const ucpTests: TestResult[] = [];

  ucpTests.push(await runTest('ucp-1', '/.well-known/ucp exists', 'GET /.well-known/ucp returns 200', async () => {
    const { status, body, url } = await fetchJSON(baseHost, '/.well-known/ucp');
    return {
      status: status === 200 ? 'pass' : 'fail',
      errors: status !== 200 ? [{ path: 'http.status', message: `Expected 200, got ${status}` }] : [],
      request: { method: 'GET', url },
      response: { status, body },
    };
  }));

  ucpTests.push(await runTest('ucp-2', 'UCP manifest has required fields', 'Manifest contains version, capabilities, auth', async () => {
    const { status, body, url } = await fetchJSON(baseHost, '/.well-known/ucp');
    if (status !== 200) return { status: 'skip', errors: [{ path: '', message: 'Skipped: endpoint unavailable' }] };
    const validation = validateResponseShape(body, ['version', 'capabilities', 'auth']);
    return {
      status: validation.valid ? 'pass' : 'fail',
      errors: validation.errors,
      request: { method: 'GET', url },
      response: { status, body },
    };
  }));

  ucpTests.push(await runTest('ucp-3', 'UCP capabilities array', 'capabilities is a non-empty array', async () => {
    const { status, body, url } = await fetchJSON(baseHost, '/.well-known/ucp');
    if (status !== 200) return { status: 'skip', errors: [] };
    const manifest = body as Record<string, unknown>;
    const valid = Array.isArray(manifest.capabilities) && manifest.capabilities.length > 0;
    return {
      status: valid ? 'pass' : 'fail',
      errors: valid ? [] : [{ path: 'capabilities', message: 'Must be a non-empty array' }],
      request: { method: 'GET', url },
      response: { status, body },
    };
  }));

  suites.push(buildSuite('UCP Discovery', `${endpoint}/.well-known/ucp`, ucpTests));

  // ── Suite 2: Catalog API ────────────────────────────────────────────────────
  const catalogTests: TestResult[] = [];

  catalogTests.push(await runTest('cat-1', 'GET /api/ucp/catalog returns 200', 'Catalog endpoint is reachable', async () => {
    const { status, body, url } = await fetchJSON(baseHost, '/api/ucp/catalog');
    return {
      status: status === 200 ? 'pass' : 'fail',
      errors: status !== 200 ? [{ path: 'http.status', message: `Expected 200, got ${status}` }] : [],
      request: { method: 'GET', url },
      response: { status, body },
    };
  }));

  catalogTests.push(await runTest('cat-2', 'Catalog response shape', 'Response has items, total, offset, limit', async () => {
    const { status, body, url } = await fetchJSON(baseHost, '/api/ucp/catalog');
    if (status !== 200) return { status: 'skip', errors: [] };
    const validation = validateResponseShape(body, ['items', 'total', 'offset', 'limit']);
    return {
      status: validation.valid ? 'pass' : 'fail',
      errors: validation.errors,
      request: { method: 'GET', url },
      response: { status, body },
    };
  }));

  catalogTests.push(await runTest('cat-3', 'Catalog items are products', 'Each item has id, name, price, currency', async () => {
    const { status, body, url } = await fetchJSON(baseHost, '/api/ucp/catalog');
    if (status !== 200) return { status: 'skip', errors: [] };
    const resp = body as { items: unknown[] };
    if (!resp.items?.length) return { status: 'skip', errors: [{ path: 'items', message: 'No items to validate' }] };
    const firstItem = resp.items[0] as Record<string, unknown>;
    const validation = validateResponseShape(firstItem, ['id', 'name', 'price', 'currency']);
    return {
      status: validation.valid ? 'pass' : 'fail',
      errors: validation.errors,
      request: { method: 'GET', url },
      response: { status, body },
    };
  }));

  catalogTests.push(await runTest('cat-4', 'Catalog search works', 'Query param filters results', async () => {
    const { status, body, url } = await fetchJSON(baseHost, '/api/ucp/catalog?query=jacket');
    if (status !== 200) return { status: 'fail', errors: [{ path: 'http.status', message: `Expected 200, got ${status}` }] };
    const resp = body as { items: unknown[]; total: number };
    const valid = Array.isArray(resp.items);
    return {
      status: valid ? 'pass' : 'fail',
      errors: valid ? [] : [{ path: 'items', message: 'Expected array' }],
      request: { method: 'GET', url },
      response: { status, body },
    };
  }));

  suites.push(buildSuite('Catalog API', `${endpoint}/api/ucp/catalog`, catalogTests));

  // ── Suite 3: Checkout API ───────────────────────────────────────────────────
  const checkoutTests: TestResult[] = [];

  const checkoutPayload = {
    items: [{ sku: 'HF32-SB', quantity: 1 }],
    customer: { email: 'test@conformance.dev', firstName: 'Test', lastName: 'User' },
    shippingAddress: {
      address1: '123 Test St', city: 'Denver',
      stateOrProvince: 'CO', zipCodeOrPostalCode: '80202', country: 'US',
    },
  };

  checkoutTests.push(await runTest('chk-1', 'POST /api/ucp/checkout creates order', 'Checkout returns 201 with orderId', async () => {
    const url = `${baseHost}/api/ucp/checkout`;
    const { status, body } = await fetchJSON(baseHost, '/api/ucp/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutPayload),
    });
    return {
      status: status === 201 ? 'pass' : 'fail',
      errors: status !== 201 ? [{ path: 'http.status', message: `Expected 201, got ${status}` }] : [],
      request: { method: 'POST', url, body: checkoutPayload },
      response: { status, body },
    };
  }));

  checkoutTests.push(await runTest('chk-2', 'Checkout response has orderId', 'Response contains orderId, status, total', async () => {
    const { status, body } = await fetchJSON(baseHost, '/api/ucp/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutPayload),
    });
    if (status !== 201) return { status: 'skip', errors: [] };
    const validation = validateResponseShape(body, ['orderId', 'status', 'total']);
    return {
      status: validation.valid ? 'pass' : 'fail',
      errors: validation.errors,
      response: { status, body },
    };
  }));

  checkoutTests.push(await runTest('chk-3', 'Checkout rejects missing fields', 'Returns 400 for missing required fields', async () => {
    const { status } = await fetchJSON(baseHost, '/api/ucp/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [] }),
    });
    return {
      status: status === 400 ? 'pass' : 'fail',
      errors: status !== 400 ? [{ path: 'http.status', message: `Expected 400 for invalid payload, got ${status}` }] : [],
      response: { status },
    };
  }));

  suites.push(buildSuite('Checkout API', `${endpoint}/api/ucp/checkout`, checkoutTests));

  // ── Suite 4: Fulfillment API ────────────────────────────────────────────────
  const fulfillmentTests: TestResult[] = [];

  fulfillmentTests.push(await runTest('ful-1', 'GET /api/ucp/fulfillment?orderId', 'Fulfillment endpoint returns order status', async () => {
    const { status, body, url } = await fetchJSON(baseHost, '/api/ucp/fulfillment?orderId=order_JNP_001');
    return {
      status: status === 200 ? 'pass' : 'fail',
      errors: status !== 200 ? [{ path: 'http.status', message: `Expected 200, got ${status}` }] : [],
      request: { method: 'GET', url },
      response: { status, body },
    };
  }));

  fulfillmentTests.push(await runTest('ful-2', 'Fulfillment response shape', 'Response has orderId, status, fulfillments', async () => {
    const { status, body } = await fetchJSON(baseHost, '/api/ucp/fulfillment?orderId=order_JNP_001');
    if (status !== 200) return { status: 'skip', errors: [] };
    const validation = validateResponseShape(body, ['orderId', 'status', 'fulfillments']);
    return {
      status: validation.valid ? 'pass' : 'fail',
      errors: validation.errors,
      response: { status, body },
    };
  }));

  fulfillmentTests.push(await runTest('ful-3', 'Missing orderId returns 400', 'Returns 400 when orderId is not provided', async () => {
    const { status } = await fetchJSON(baseHost, '/api/ucp/fulfillment');
    return {
      status: status === 400 ? 'pass' : 'fail',
      errors: status !== 400 ? [{ path: 'http.status', message: `Expected 400, got ${status}` }] : [],
      response: { status },
    };
  }));

  fulfillmentTests.push(await runTest('ful-4', 'Non-existent order returns 404', 'Returns 404 for unknown orderId', async () => {
    const { status } = await fetchJSON(baseHost, '/api/ucp/fulfillment?orderId=order_DOESNT_EXIST');
    return {
      status: status === 404 ? 'pass' : 'fail',
      errors: status !== 404 ? [{ path: 'http.status', message: `Expected 404, got ${status}` }] : [],
      response: { status },
    };
  }));

  suites.push(buildSuite('Fulfillment API', `${endpoint}/api/ucp/fulfillment`, fulfillmentTests));

  // ── Suite 5: onX Bridge ─────────────────────────────────────────────────────
  const onxTests: TestResult[] = [];
  const onxBase = `${baseHost}/api/onx`;

  onxTests.push(await runTest('onx-1', 'GET /api/onx/products', 'onX products endpoint works', async () => {
    const { status, body, url } = await fetchJSON(onxBase, '/products');
    return {
      status: status === 200 ? 'pass' : 'fail',
      errors: status !== 200 ? [{ path: 'http.status', message: `Expected 200, got ${status}` }] : [],
      request: { method: 'GET', url },
      response: { status, body },
    };
  }));

  onxTests.push(await runTest('onx-2', 'GET /api/onx/orders', 'onX orders endpoint works', async () => {
    const { status, body, url } = await fetchJSON(onxBase, '/orders');
    return {
      status: status === 200 ? 'pass' : 'fail',
      errors: status !== 200 ? [{ path: 'http.status', message: `Expected 200, got ${status}` }] : [],
      request: { method: 'GET', url },
      response: { status, body },
    };
  }));

  onxTests.push(await runTest('onx-3', 'GET /api/onx/inventory', 'onX inventory endpoint works', async () => {
    const { status, body, url } = await fetchJSON(onxBase, '/inventory');
    return {
      status: status === 200 ? 'pass' : 'fail',
      errors: status !== 200 ? [{ path: 'http.status', message: `Expected 200, got ${status}` }] : [],
      request: { method: 'GET', url },
      response: { status, body },
    };
  }));

  suites.push(buildSuite('onX Bridge', onxBase, onxTests));

  // ── Build final report ──────────────────────────────────────────────────────
  const totalPassed = suites.reduce((s, x) => s + x.passed, 0);
  const totalFailed = suites.reduce((s, x) => s + x.failed, 0);
  const totalErrors = suites.reduce((s, x) => s + x.errors, 0);
  const totalTests = suites.reduce((s, x) => s + x.total, 0);

  return {
    endpoint,
    timestamp: new Date().toISOString(),
    version: '1.0',
    overallStatus: totalFailed + totalErrors === 0 ? 'pass' : 'fail',
    summary: {
      passed: totalPassed,
      failed: totalFailed,
      errors: totalErrors,
      total: totalTests,
      score: Math.round((totalPassed / Math.max(totalTests, 1)) * 100),
    },
    suites,
  };
}

function buildSuite(name: string, endpoint: string, tests: TestResult[]): SuiteResult {
  return {
    endpoint,
    suite: name,
    passed: tests.filter(t => t.status === 'pass').length,
    failed: tests.filter(t => t.status === 'fail').length,
    errors: tests.filter(t => t.status === 'error').length,
    skipped: tests.filter(t => t.status === 'skip').length,
    total: tests.length,
    duration: tests.reduce((s, t) => s + t.duration, 0),
    tests,
  };
}
