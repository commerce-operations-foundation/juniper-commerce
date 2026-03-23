'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { CheckSquare, Loader2, ChevronDown, ChevronRight, Check, X, AlertCircle, Terminal, ExternalLink } from 'lucide-react';
import type { ConformanceReport, SuiteResult, TestResult } from '@/lib/conformance/runner';

function TestRow({ test }: { test: TestResult }) {
  const [open, setOpen] = useState(false);
  const icon = {
    pass: <Check className="w-4 h-4 text-green-600" />,
    fail: <X className="w-4 h-4 text-red-600" />,
    error: <AlertCircle className="w-4 h-4 text-orange-600" />,
    skip: <span className="w-4 h-4 text-gray-400 text-xs font-bold">–</span>,
  }[test.status];

  const rowBg = {
    pass: 'hover:bg-green-50/50',
    fail: 'hover:bg-red-50/50',
    error: 'hover:bg-orange-50/50',
    skip: 'hover:bg-gray-50/50',
  }[test.status];

  return (
    <>
      <tr className={`cursor-pointer transition-colors ${rowBg}`} onClick={() => setOpen(o => !o)}>
        <td className="px-4 py-3 w-8">{icon}</td>
        <td className="px-4 py-3 text-sm font-medium text-gray-800">{test.name}</td>
        <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{test.description}</td>
        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{test.duration}ms</td>
        <td className="px-4 py-3 w-6">{open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}</td>
      </tr>
      {open && (
        <tr>
          <td colSpan={5} className="px-4 pb-4">
            <div className="bg-gray-900 text-gray-200 rounded-lg p-4 text-xs font-mono overflow-x-auto">
              {test.request && (
                <div className="mb-3">
                  <span className="text-teal-400">REQUEST:</span> {test.request.method} {test.request.url}
                  {test.request.body != null && <pre className="mt-1 text-gray-400">{JSON.stringify(test.request.body as object, null, 2)}</pre>}
                </div>
              )}
              {test.response && (
                <div className="mb-3">
                  <span className="text-blue-400">RESPONSE:</span> {test.response.status}
                  {test.response.body != null && <pre className="mt-1 text-gray-400 max-h-48 overflow-y-auto">{JSON.stringify(test.response.body as object, null, 2)}</pre>}
                </div>
              )}
              {test.errors.length > 0 && (
                <div>
                  <span className="text-red-400">ERRORS:</span>
                  {test.errors.map((e, i) => (
                    <div key={i} className="mt-1 text-red-300">{e.path}: {e.message}</div>
                  ))}
                </div>
              )}
              {test.status === 'pass' && test.errors.length === 0 && !test.request && !test.response && (
                <span className="text-green-400">✓ All checks passed</span>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function SuiteCard({ suite }: { suite: SuiteResult }) {
  const [open, setOpen] = useState(true);
  const allPass = suite.failed === 0 && suite.errors === 0;
  const pct = Math.round((suite.passed / suite.total) * 100);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
      >
        <div className={`w-3 h-3 rounded-full ${allPass ? 'bg-green-500' : 'bg-red-500'}`} />
        <h3 className="font-semibold text-[#1a1a2e] text-left flex-1">{suite.suite}</h3>
        <div className="flex items-center gap-3 text-sm">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${allPass ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {suite.passed} pass
          </span>
          {suite.failed > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
              {suite.failed} fail
            </span>
          )}
          {suite.errors > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
              {suite.errors} error
            </span>
          )}
          <span className="text-gray-400">{suite.duration}ms</span>
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${allPass ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <table className="w-full border-t border-gray-100">
          <tbody>
            {suite.tests.map(test => <TestRow key={test.id} test={test} />)}
          </tbody>
        </table>
      )}
    </div>
  );
}

const ENTITY_SCHEMAS = [
  { name: 'order', desc: 'Sales order with line items, addresses, and payment status' },
  { name: 'product', desc: 'Product catalog entry with categories, tags, and options' },
  { name: 'product-variant', desc: 'SKU-level variant with price, cost, and weight' },
  { name: 'customer', desc: 'Individual or company with addresses and custom fields' },
  { name: 'fulfillment', desc: 'Shipment with tracking numbers and carrier details' },
  { name: 'inventory', desc: 'Stock levels per SKU per warehouse location' },
  { name: 'return', desc: 'RMA with line items, reason codes, and refund details' },
];

const TOOL_INPUT_SCHEMAS = [
  { name: 'get-products', type: 'json' },
  { name: 'get-product-variants', type: 'json' },
  { name: 'get-inventory', type: 'json' },
  { name: 'get-customers', type: 'json' },
  { name: 'get-orders', type: 'json' },
  { name: 'create-sales-order', type: 'json' },
  { name: 'fulfill-order', type: 'json' },
  { name: 'get-fulfillments', type: 'json' },
  { name: 'get-returns', type: 'json' },
  { name: 'update-order', type: 'json' },
  { name: 'cancel-order', type: 'json' },
  { name: 'create-return', type: 'json' },
];

const ONX_OPERATIONS = [
  { name: 'get-products', desc: 'List product catalog with filters and pagination' },
  { name: 'get-product-variants', desc: 'List SKUs and option combinations' },
  { name: 'get-inventory', desc: 'Stock levels by SKU and warehouse location' },
  { name: 'get-customers', desc: 'Customer lookup by email, type, and status' },
  { name: 'get-orders', desc: 'Order history with filtering and pagination' },
  { name: 'create-sales-order', desc: 'Place a new order with line items and addresses' },
  { name: 'update-order', desc: 'Modify an existing order (status, shipping, etc.)' },
  { name: 'cancel-order', desc: 'Cancel an order with a reason code' },
  { name: 'fulfill-order', desc: 'Mark order as shipped with carrier and tracking' },
  { name: 'get-fulfillments', desc: 'Fulfillment status and tracking by order' },
  { name: 'create-return', desc: 'Initiate a return or RMA with line items' },
  { name: 'get-returns', desc: 'Return history and refund status by order' },
];

export default function ConformancePage() {
  const [endpoint, setEndpoint] = useState('');

  useEffect(() => {
    if (!endpoint) setEndpoint(window.location.origin);
  }, []);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ConformanceReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch('/api/conformance/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Test run failed');
      setReport(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-teal-600 text-sm font-medium mb-2">
          <CheckSquare className="w-4 h-4" /> Conformance Testing
        </div>
        <h1 className="text-3xl font-bold text-[#1a1a2e]">onX Conformance Test Suite</h1>
        <p className="text-gray-500 mt-1">
          Validate any onX endpoint against the standard. Tests all 7 entity schemas, 12 tool-input schemas,
          and all 12 onX operations.
        </p>
        <div className="flex flex-wrap gap-3 mt-3">
          <a
            href="https://commerceopsfoundation.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-teal-600 hover:underline"
          >
            Commerce Operations Foundation <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-gray-300">·</span>
          <a
            href="https://github.com/commerce-operations-foundation/mcp-reference-server"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-teal-600 hover:underline"
          >
            GitHub Repo <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Schema reference panels */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {/* Entity schemas */}
        <div className="card p-5">
          <h2 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center">7</span>
            Entity Schemas
          </h2>
          <div className="space-y-1.5">
            {ENTITY_SCHEMAS.map(s => (
              <div key={s.name} className="flex items-start gap-2">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono bg-green-100 text-green-800 mt-0.5 flex-shrink-0">
                  <Check className="w-3 h-3" /> {s.name}
                </span>
                <span className="text-xs text-gray-500">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tool-input schemas */}
        <div className="card p-5">
          <h2 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">12</span>
            Tool-Input Schemas
          </h2>
          <div className="space-y-1.5">
            {TOOL_INPUT_SCHEMAS.map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono bg-blue-100 text-blue-800 flex-shrink-0">
                  <Check className="w-3 h-3" /> {s.name}
                </span>
                <span className="text-xs text-gray-400">{s.type === 'zod' ? 'Zod schema' : 'JSON schema'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operations list */}
      <div className="card p-5 mb-8">
        <h2 className="font-semibold text-[#1a1a2e] mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">12</span>
          onX Operations
        </h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {ONX_OPERATIONS.map(op => (
            <div key={op.name} className="flex gap-2 text-sm items-start">
              <code className="text-teal-700 font-mono text-xs bg-teal-50 px-1.5 py-0.5 rounded self-start flex-shrink-0 mt-0.5">{op.name}</code>
              <span className="text-gray-600 text-xs">{op.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Run panel */}
      <div className="card p-6 mb-8">
        <h2 className="font-semibold text-[#1a1a2e] mb-4">Run Tests Against an Endpoint</h2>
        <div className="flex gap-3">
          <input
            value={endpoint}
            onChange={e => setEndpoint(e.target.value)}
            placeholder="https://your-onx-server.example.com"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm font-mono"
          />
          <button
            onClick={runTests}
            disabled={loading || !endpoint}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              loading || !endpoint ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600 text-white'
            }`}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Running...</> : <><CheckSquare className="w-4 h-4" /> Run Tests</>}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'].map(url => (
            <button key={url} onClick={() => setEndpoint(url)}
              className="text-xs text-teal-600 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg font-mono transition-colors">
              {url}
            </button>
          ))}
        </div>
        <div className="mt-4 border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-gray-400" /> CLI Usage
          </h3>
          <code className="text-xs bg-gray-900 text-green-400 px-4 py-2 rounded-lg block font-mono">
            npx onx-conform --endpoint {endpoint}
          </code>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {/* Report */}
      {report && (
        <div>
          {/* Summary banner */}
          <div className={`rounded-xl p-6 mb-6 ${report.overallStatus === 'pass' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold ${
                  report.overallStatus === 'pass' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {report.summary.score}%
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {report.overallStatus === 'pass' ? '✓ Conformant' : '✗ Non-conformant'}
                  </h2>
                  <p className="text-sm text-gray-600">{report.endpoint} · {new Date(report.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
              <div className="flex gap-5 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-700">{report.summary.passed}</p>
                  <p className="text-gray-500">Passed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-700">{report.summary.failed}</p>
                  <p className="text-gray-500">Failed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-700">{report.summary.total}</p>
                  <p className="text-gray-500">Total</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {report.suites.map(suite => <SuiteCard key={suite.suite} suite={suite} />)}
          </div>
        </div>
      )}
    </div>
  );
}

