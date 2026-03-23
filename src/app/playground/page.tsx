'use client';
export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Bot, User, Wrench, Loader2, ChevronRight, ChevronDown,
  Clock, MessageSquare, Workflow, Play, CheckCircle2,
  ArrowRight, XCircle, Package, Truck, ShoppingCart,
  RotateCcw, PanelLeftClose, PanelLeft,
  Zap, Globe, Search, ClipboardList, Users, MapPin,
  CornerDownRight, Eye, Box,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ToolCall {
  tool: string;
  input: unknown;
  result: unknown;
  timestamp: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
}

interface ServerLog {
  time: string;
  type: 'request' | 'tool_call' | 'tool_result' | 'response';
  detail: string;
}

type Tab = 'chat' | 'lifecycle' | 'ucp' | 'skills';

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_MESSAGES = 100;

const QUESTION_LIBRARY = [
  {
    category: 'Product Discovery',
    icon: <Search className="w-3.5 h-3.5 text-teal-500" />,
    questions: [
      'Show me all hiking boots',
      'What footwear do you have under $200?',
      'List products tagged as new arrivals',
    ],
  },
  {
    category: 'Inventory (Multi-Step)',
    icon: <Box className="w-3.5 h-3.5 text-amber-500" />,
    questions: [
      'Check inventory for the Trail Runner Pro in all warehouses',
      'Is the Ridgeline Jacket available in size M?',
      'What waterproof products are currently in stock?',
    ],
  },
  {
    category: 'Order Management',
    icon: <ClipboardList className="w-3.5 h-3.5 text-blue-500" />,
    questions: [
      'Show me all confirmed orders',
      'What orders have been shipped?',
      'Show all delivered orders and their tracking info',
    ],
  },
  {
    category: 'Customer Lookup',
    icon: <Users className="w-3.5 h-3.5 text-purple-500" />,
    questions: [
      'Look up customer alex.chen@example.com',
      'Show me all wholesale customers',
    ],
  },
  {
    category: 'Fulfillment & Returns',
    icon: <Truck className="w-3.5 h-3.5 text-indigo-500" />,
    questions: [
      'Track shipments for order order_JNP_001',
      'Are there any returns in the system?',
    ],
  },
  {
    category: 'Multi-Tool Queries',
    icon: <Zap className="w-3.5 h-3.5 text-rose-500" />,
    questions: [
      'Find hiking boots under $200 and check if they are in stock',
      'Show me the Summit Pack, its variants, and inventory across all warehouses',
      'How many confirmed orders do we have and what is the total revenue?',
    ],
  },
];

// ─── Lifecycle Demo Steps ────────────────────────────────────────────────────

interface LifecycleStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  endpoint: string;
  method: string;
  getBody: (ctx: Record<string, unknown>) => Record<string, unknown> | null;
}

const LIFECYCLE_STEPS: LifecycleStep[] = [
  {
    id: 'browse', label: 'Browse Products',
    icon: <Search className="w-4 h-4" />,
    description: 'GET /api/onx/products',
    endpoint: '/api/onx/products?limit=5', method: 'GET', getBody: () => null,
  },
  {
    id: 'variants', label: 'Get Variants & SKUs',
    icon: <Package className="w-4 h-4" />,
    description: 'GET /api/onx/product-variants',
    endpoint: '/api/onx/product-variants', method: 'GET', getBody: () => null,
  },
  {
    id: 'inventory', label: 'Check Inventory',
    icon: <Box className="w-4 h-4" />,
    description: 'GET /api/onx/inventory',
    endpoint: '/api/onx/inventory', method: 'GET', getBody: () => null,
  },
  {
    id: 'order', label: 'Place Order',
    icon: <ShoppingCart className="w-4 h-4" />,
    description: 'POST /api/onx/orders',
    endpoint: '/api/onx/orders', method: 'POST',
    getBody: (ctx) => ({
      customer: { email: 'demo@juniper.com', firstName: 'Demo', lastName: 'User' },
      lineItems: [{ sku: ctx.sku as string || 'TR-PRO-10', quantity: 1 }],
      shippingAddress: {
        address1: '100 Trail Ridge Rd', city: 'Estes Park',
        stateOrProvince: 'CO', zipCodeOrPostalCode: '80517', country: 'US',
      },
    }),
  },
  {
    id: 'fulfill', label: 'Ship Order',
    icon: <Truck className="w-4 h-4" />,
    description: 'POST /api/onx/fulfillments',
    endpoint: '/api/onx/fulfillments', method: 'POST',
    getBody: (ctx) => ({
      orderId: ctx.orderId as string,
      trackingNumbers: ['1Z999AA10123456784'],
      carrier: 'UPS',
    }),
  },
  {
    id: 'track', label: 'Track Fulfillment',
    icon: <MapPin className="w-4 h-4" />,
    description: 'GET /api/onx/fulfillments',
    endpoint: '/api/onx/fulfillments', method: 'GET', getBody: () => null,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) parts.push(line.slice(lastIndex, match.index));
      parts.push(<strong key={`b${i}-${match.index}`}>{match[1]}</strong>);
      lastIndex = regex.lastIndex;
    }
    const processed = parts.length > 0
      ? <>{lastIndex < line.length ? [...parts, line.slice(lastIndex)] : parts}</>
      : line;

    if (line.startsWith('- ')) {
      const content = typeof processed === 'string' ? processed.slice(2) : processed;
      return <li key={i} className="ml-4 list-disc">{content}</li>;
    }
    if (line.startsWith('### ')) return <h4 key={i} className="font-semibold mt-2">{typeof processed === 'string' ? processed.slice(4) : processed}</h4>;
    if (line.startsWith('## ')) return <h3 key={i} className="font-bold mt-2">{typeof processed === 'string' ? processed.slice(3) : processed}</h3>;
    return <p key={i} className={i > 0 && line ? 'mt-1' : line ? '' : 'h-2'}>{processed || '\u00A0'}</p>;
  });
}

function timeNow() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ─── Tool Call Accordion ─────────────────────────────────────────────────────

function ToolCallAccordion({ toolCalls }: { toolCalls: ToolCall[] }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="mt-2 space-y-1">
      {toolCalls.map((tc, i) => (
        <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
          >
            <CornerDownRight className="w-3 h-3 text-teal-500 shrink-0" />
            <span className="text-xs font-mono text-teal-700 flex-1">{tc.tool}</span>
            <span className="text-[10px] text-gray-400">{tc.timestamp ? new Date(tc.timestamp).toLocaleTimeString() : ''}</span>
            {expandedIdx === i ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
          </button>
          {expandedIdx === i && (
            <div className="border-t border-gray-100 bg-gray-950 text-xs font-mono p-3 space-y-3 max-h-64 overflow-y-auto">
              <div>
                <span className="text-teal-400 text-[10px] uppercase tracking-wider">Request</span>
                <pre className="text-gray-300 mt-1 whitespace-pre-wrap break-all">{JSON.stringify(tc.input, null, 2)}</pre>
              </div>
              <div>
                <span className="text-blue-400 text-[10px] uppercase tracking-wider">Response</span>
                <pre className="text-gray-300 mt-1 whitespace-pre-wrap break-all">{JSON.stringify(tc.result, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── UCP Flow Visualization ──────────────────────────────────────────────────

function UCPFlowTab() {
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<Record<number, { loading: boolean; data: unknown; error?: string }>>({});

  const steps = [
    {
      title: 'Discover UCP Manifest',
      description: 'An AI agent discovers commerce capabilities by fetching the UCP manifest at a well-known URL.',
      ucpRequest: 'GET /.well-known/ucp',
      onxMapping: 'UCP discovery endpoint — Lists all supported commerce capabilities (catalog, checkout, fulfillment)',
      endpoint: '/.well-known/ucp',
    },
    {
      title: 'Browse Product Catalog',
      description: 'Using the catalog capability from the manifest, browse products with search and filters.',
      ucpRequest: 'POST /api/ucp/catalog\n{ "query": "hiking", "limit": 5 }',
      onxMapping: 'UCP catalog → onX get_products + get_product_variants',
      endpoint: '/api/ucp/catalog',
      body: { query: 'hiking', limit: 5 },
    },
    {
      title: 'Place an Order',
      description: 'Complete the purchase flow using the checkout capability, which maps to onX create-sales-order.',
      ucpRequest: 'POST /api/ucp/checkout\n{ items, customer, shippingAddress }',
      onxMapping: 'UCP checkout → onX create_sales_order → Order created with fulfillment tracking',
      endpoint: '/api/ucp/checkout',
      body: {
        items: [{ sku: 'TR-PRO-10', quantity: 1 }],
        customer: { email: 'ucp-demo@juniper.com', firstName: 'UCP', lastName: 'Demo' },
        shippingAddress: {
          address1: '200 Commerce Ave', city: 'Portland',
          stateOrProvince: 'OR', zipCodeOrPostalCode: '97201', country: 'US',
        },
      },
    },
  ];

  const runStep = async (idx: number) => {
    const s = steps[idx];
    setResults(prev => ({ ...prev, [idx]: { loading: true, data: null } }));
    try {
      const opts: RequestInit = s.body
        ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s.body) }
        : {};
      const res = await fetch(s.endpoint, opts);
      const data = await res.json();
      setResults(prev => ({ ...prev, [idx]: { loading: false, data } }));
    } catch (err) {
      setResults(prev => ({ ...prev, [idx]: { loading: false, data: null, error: String(err) } }));
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-5">
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-gray-900">UCP → onX Bridge</h3>
        </div>
        <p className="text-sm text-gray-600">
          The Universal Commerce Protocol (UCP) provides a standard frontend for AI agents to discover and interact with commerce systems.
          Each UCP capability maps to underlying onX operations. Walk through the 3-step flow.
        </p>
      </div>

      <div className="flex gap-2">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              step === i
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-700'
            }`}
          >
            Step {i + 1}: {s.title.split(' ').slice(0, 2).join(' ')}
          </button>
        ))}
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900 text-lg">{steps[step].title}</h4>
          <p className="text-sm text-gray-500 mt-0.5">{steps[step].description}</p>
        </div>

        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div className="p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
              <ArrowRight className="w-3 h-3" /> UCP Request
            </span>
            <pre className="mt-3 text-sm font-mono text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{steps[step].ucpRequest}</pre>
          </div>
          <div className="p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <CornerDownRight className="w-3 h-3" /> onX Mapping
            </span>
            <p className="mt-3 text-sm text-gray-700">{steps[step].onxMapping}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 px-5 py-3 flex items-center justify-between bg-gray-50">
          <button
            onClick={() => runStep(step)}
            disabled={results[step]?.loading}
            className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {results[step]?.loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Execute
          </button>
          {step < steps.length - 1 && (
            <button onClick={() => setStep(step + 1)} className="text-sm text-teal-600 hover:text-teal-800 flex items-center gap-1 font-medium">
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {results[step] && !results[step].loading && (
          <div className="border-t border-gray-200 bg-gray-950 p-5 max-h-80 overflow-y-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" /> Live Response
            </span>
            <pre className="mt-2 text-xs font-mono text-gray-300 whitespace-pre-wrap break-all">
              {results[step].error
                ? `Error: ${results[step].error}`
                : JSON.stringify(results[step].data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Order Lifecycle Demo ────────────────────────────────────────────────────

function LifecycleTab() {
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [stepResults, setStepResults] = useState<Record<string, { status: 'pending' | 'running' | 'done' | 'error'; data?: unknown; duration?: number }>>({});
  const [context, setContext] = useState<Record<string, unknown>>({});
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const runLifecycle = useCallback(async () => {
    setRunning(true);
    setStepResults({});
    setExpandedStep(null);
    const ctx: Record<string, unknown> = {};

    for (let i = 0; i < LIFECYCLE_STEPS.length; i++) {
      const step = LIFECYCLE_STEPS[i];
      setCurrentStep(i);
      setStepResults(prev => ({ ...prev, [step.id]: { status: 'running' } }));

      const start = performance.now();
      try {
        let url = step.endpoint;
        const body = step.getBody(ctx);
        let opts: RequestInit = {};

        if (step.id === 'variants' && ctx.productId) {
          url = `/api/onx/product-variants?productId=${ctx.productId}`;
        } else if (step.id === 'inventory' && ctx.sku) {
          url = `/api/onx/inventory?sku=${ctx.sku}`;
        } else if (step.id === 'track' && ctx.orderId) {
          url = `/api/onx/fulfillments?orderId=${ctx.orderId}`;
        }

        if (step.method === 'POST' && body) {
          opts = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          };
        }

        const res = await fetch(url, opts);
        const data = await res.json();
        const duration = Math.round(performance.now() - start);

        if (step.id === 'browse' && data.items?.[0]) {
          ctx.productId = data.items[0].id;
          ctx.productName = data.items[0].name;
        }
        if (step.id === 'variants' && data.items?.[0]) {
          ctx.sku = data.items[0].sku;
          ctx.variantTitle = data.items[0].title;
          ctx.price = data.items[0].price;
        }
        if (step.id === 'order' && data.id) {
          ctx.orderId = data.id;
          ctx.orderName = data.name;
        }

        setStepResults(prev => ({ ...prev, [step.id]: { status: 'done', data, duration } }));
      } catch (err) {
        const duration = Math.round(performance.now() - start);
        setStepResults(prev => ({ ...prev, [step.id]: { status: 'error', data: String(err), duration } }));
      }

      setContext({ ...ctx });
      await new Promise(r => setTimeout(r, 500));
    }

    setRunning(false);
  }, []);

  const allDone = LIFECYCLE_STEPS.every(s => stepResults[s.id]?.status === 'done');

  return (
    <div className="h-full overflow-y-auto p-6 space-y-5">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Workflow className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Order Lifecycle Demo</h3>
        </div>
        <p className="text-sm text-gray-600">
          Watch the full onX order lifecycle: browse → variants → inventory → order → fulfill → track.
          Each step calls a real API endpoint. The entire protocol in 60 seconds.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={runLifecycle}
          disabled={running}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {running ? 'Running...' : 'Run Full Lifecycle'}
        </button>
        {allDone && (
          <button
            onClick={() => { setStepResults({}); setCurrentStep(-1); setContext({}); }}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      {Object.keys(context).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Context (passed between steps)</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(context).map(([k, v]) => (
              <span key={k} className="text-xs font-mono bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
                <span className="text-gray-400">{k}:</span> <span className="text-gray-900">{String(v)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {LIFECYCLE_STEPS.map((step, i) => {
          const result = stepResults[step.id];
          const isExpanded = expandedStep === step.id;

          return (
            <div key={step.id} className={`border rounded-xl overflow-hidden bg-white transition-all ${
              result?.status === 'running' ? 'border-blue-300 ring-2 ring-blue-100' :
              result?.status === 'done' ? 'border-green-200' :
              result?.status === 'error' ? 'border-red-200' : 'border-gray-200'
            }`}>
              <button
                onClick={() => result?.data && setExpandedStep(isExpanded ? null : step.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  result?.status === 'running' ? 'bg-blue-100 text-blue-600' :
                  result?.status === 'done' ? 'bg-green-100 text-green-600' :
                  result?.status === 'error' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {result?.status === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                   result?.status === 'done' ? <CheckCircle2 className="w-4 h-4" /> :
                   result?.status === 'error' ? <XCircle className="w-4 h-4" /> :
                   step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">Step {i + 1}: {step.label}</div>
                  <div className="text-xs text-gray-500 font-mono">{step.description}</div>
                </div>
                {result?.duration !== undefined && (
                  <span className="text-xs font-mono text-gray-400 shrink-0 bg-gray-50 px-2 py-0.5 rounded">{result.duration}ms</span>
                )}
                {result?.data != null && (
                  isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {isExpanded && result?.data != null && (
                <div className="border-t border-gray-200 bg-gray-950 p-4 max-h-64 overflow-y-auto">
                  <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-all">
                    {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverLogs, setServerLogs] = useState<ServerLog[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(QUESTION_LIBRARY.map(c => [c.category, true]))
  );
  const [providerInfo, setProviderInfo] = useState<{ name: string; model: string } | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const logsScrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    fetch('/api/playground/chat')
      .then(r => r.json())
      .then(data => { if (data.provider) setProviderInfo(data.provider); })
      .catch(() => {});
    return () => { document.body.style.overflow = ''; };
  }, []);
  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);
  useEffect(() => {
    const el = logsScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [serverLogs]);

  const addLog = (type: ServerLog['type'], detail: string) => {
    setServerLogs(prev => [...prev, { time: timeNow(), type, detail }]);
  };

  const sendMessage = async (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim() || loading || messages.length >= MAX_MESSAGES) return;

    const userMessage: Message = { role: 'user', content: msg };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput('');
    setLoading(true);
    addLog('request', `User: "${msg}"`);

    try {
      const res = await fetch('/api/playground/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (data.toolCalls) {
        for (const tc of data.toolCalls) {
          addLog('tool_call', `${tc.tool}(${JSON.stringify(tc.input)})`);
          addLog('tool_result', JSON.stringify(tc.result, null, 2));
        }
      }

      if (data.provider) setProviderInfo(data.provider);

      if (data.error) {
        addLog('response', `Error: ${data.error}`);
        setMessages([...updated, { role: 'assistant', content: `Error: ${data.error}` }]);
      } else {
        addLog('response', data.reply);
        setMessages([...updated, {
          role: 'assistant',
          content: data.reply,
          toolCalls: data.toolCalls,
        }]);
      }
    } catch {
      addLog('response', 'Connection failed');
      setMessages([...updated, { role: 'assistant', content: 'Failed to connect to the AI service.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div style={{ height: 'calc(100vh - 64px)' }} className="flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const questionsRemaining = Math.floor((MAX_MESSAGES - messages.length) / 2);

  const TABS: { id: Tab; label: string; sublabel: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'AI Chat', sublabel: '12 onX tools', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'lifecycle', label: 'Order Lifecycle', sublabel: '6-step demo', icon: <Workflow className="w-5 h-5" /> },
    { id: 'ucp', label: 'UCP Flow', sublabel: '3-step bridge', icon: <Globe className="w-5 h-5" /> },
    { id: 'skills', label: 'Skills', sublabel: 'PREVIEW', icon: <Zap className="w-5 h-5" /> },
  ];

  return (
    <div style={{ height: 'calc(100vh - 64px)' }} className="flex flex-col overflow-hidden">
      {/* ── Tab Bar ────────────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-6 h-14">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <span className="font-semibold text-gray-900 text-sm hidden sm:inline">Playground</span>
            </div>

            <div className="flex-1 flex items-center gap-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span className={`text-[10px] font-normal ${activeTab === tab.id ? 'text-gray-400' : 'text-gray-400'}`}>
                    {tab.sublabel}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Content ───────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="h-full flex">
            {/* Left sidebar */}
            <div className={`shrink-0 border-r border-gray-200 bg-white transition-all duration-200 ${sidebarOpen ? 'w-[260px]' : 'w-0'} overflow-hidden`}>
              <div className="w-[260px] h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Example Queries</h3>
                  <button onClick={() => setSidebarOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  {QUESTION_LIBRARY.map(cat => {
                    const isOpen = expandedCats[cat.category] ?? true;
                    return (
                      <div key={cat.category}>
                        <button
                          onClick={() => setExpandedCats(prev => ({ ...prev, [cat.category]: !isOpen }))}
                          className="w-full flex items-center gap-1.5 px-2 py-2 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          {isOpen ? <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" /> : <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />}
                          {cat.icon}
                          <span className="text-xs font-medium text-gray-700 flex-1 text-left">{cat.category}</span>
                          <span className="text-[10px] text-gray-400">{cat.questions.length}</span>
                        </button>
                        {isOpen && (
                          <div className="ml-3 pl-2 border-l border-gray-100 space-y-0.5 mb-2">
                            {cat.questions.map(q => (
                              <button
                                key={q}
                                onClick={() => sendMessage(q)}
                                disabled={loading || messages.length >= MAX_MESSAGES}
                                className="w-full text-left text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-50 px-2 py-1.5 rounded-md transition-colors disabled:opacity-40"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Collapse toggle when sidebar is closed */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="absolute left-2 top-[calc(64px+56px+8px)] z-10 p-1.5 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-400 hover:text-gray-600"
                >
                  <PanelLeft className="w-4 h-4" />
                </button>
              )}

              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                      <Bot className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Ask about products, inventory, or orders</p>
                    <p className="text-xs text-gray-400 mb-5">Try multi-step queries — the AI chains tools automatically</p>
                    <div className="flex flex-wrap gap-2 justify-center max-w-md">
                      {[
                        'Check inventory for hiking boots',
                        'Show me all shipped orders',
                        'What waterproof products are in stock?',
                      ].map(s => (
                        <button
                          key={s}
                          onClick={() => sendMessage(s)}
                          className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-teal-400" />
                      </div>
                    )}
                    <div className="max-w-[80%]">
                      <div className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gray-900 text-white'
                          : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                      }`}>
                        {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                      </div>
                      {msg.toolCalls && msg.toolCalls.length > 0 && (
                        <ToolCallAccordion toolCalls={msg.toolCalls} />
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-teal-700" />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-teal-400" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-sm text-gray-400 shadow-sm">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Querying onX tools...
                    </div>
                  </div>
                )}
              </div>

              {/* Input bar — pinned to bottom */}
              <div className="shrink-0 border-t border-gray-200 bg-white p-3">
                <div className="flex gap-2 max-w-3xl mx-auto">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about products, inventory, orders..."
                    disabled={loading || messages.length >= MAX_MESSAGES}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-50 bg-gray-50"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim() || messages.length >= MAX_MESSAGES}
                    className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-1.5 px-1 max-w-3xl mx-auto">
                  <p className="text-[10px] text-gray-400">{providerInfo ? `${providerInfo.name} (${providerInfo.model})` : 'AI'} + 12 onX tools</p>
                  <p className="text-[10px] text-gray-400">
                    {messages.length >= MAX_MESSAGES ? 'Limit reached — refresh page' : `${questionsRemaining} exchanges left`}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Server Activity Log */}
            <div className="hidden xl:flex w-[300px] shrink-0 border-l border-gray-200 flex-col bg-gray-950">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 shrink-0">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Server Activity</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] text-green-400 font-medium">Live</span>
                </div>
              </div>
              <div ref={logsScrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
                {serverLogs.length === 0 && (
                  <div className="text-center pt-12">
                    <Clock className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Waiting for activity...</p>
                    <p className="text-[10px] text-gray-600 mt-1">Send a message to see tool calls</p>
                  </div>
                )}
                {serverLogs.map((log, i) => {
                  const colorClass =
                    log.type === 'request' ? 'text-blue-400 border-blue-800' :
                    log.type === 'tool_call' ? 'text-teal-400 border-teal-800' :
                    log.type === 'tool_result' ? 'text-gray-400 border-gray-700' :
                    'text-green-400 border-green-800';
                  const label =
                    log.type === 'request' ? 'REQ' :
                    log.type === 'tool_call' ? 'CALL' :
                    log.type === 'tool_result' ? 'RESULT' :
                    'REPLY';
                  return (
                    <div key={i} className={`border-l-2 ${colorClass} pl-2.5`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
                        <span className="text-[9px] text-gray-600">{log.time}</span>
                      </div>
                      <pre className={`text-[10px] font-mono whitespace-pre-wrap break-all leading-relaxed max-h-40 overflow-y-auto ${
                        log.type === 'tool_result' ? 'text-gray-500' : ''
                      }`}>{log.detail}</pre>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lifecycle' && <LifecycleTab />}
        {activeTab === 'ucp' && <UCPFlowTab />}
        {activeTab === 'skills' && <SkillsTab />}
      </div>
    </div>
  );
}

// ─── Skills Tab ──────────────────────────────────────────────────────────────

function SkillsTab() {
  const [selectedSkill, setSelectedSkill] = useState(0);
  const [running, setRunning] = useState(false);
  const [stepResults, setStepResults] = useState<Record<number, { status: 'pending' | 'running' | 'done' | 'error'; data?: unknown; duration?: number }>>({});
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const skills = [
    {
      id: 'order-lifecycle', name: 'Order Lifecycle', badge: 'PREVIEW',
      description: 'Full commerce flow: browse products, check inventory, create order, ship it, and track delivery.',
      steps: [
        { label: 'Browse Products', endpoint: '/api/onx/products?limit=3', method: 'GET' },
        { label: 'Get Variants', endpoint: '/api/onx/product-variants', method: 'GET', dynamic: true },
        { label: 'Check Inventory', endpoint: '/api/onx/inventory', method: 'GET', dynamic: true },
        { label: 'Place Order', endpoint: '/api/onx/orders', method: 'POST', dynamic: true },
        { label: 'Ship Order', endpoint: '/api/onx/fulfillments', method: 'POST', dynamic: true },
        { label: 'Track Shipment', endpoint: '/api/onx/fulfillments', method: 'GET', dynamic: true },
      ],
    },
    {
      id: 'return-processing', name: 'Return Processing', badge: 'PREVIEW',
      description: 'Find a delivered order, initiate a return with reason, and verify the return was created.',
      steps: [
        { label: 'Find Delivered Orders', endpoint: '/api/onx/orders?status=delivered&limit=3', method: 'GET' },
        { label: 'Initiate Return', endpoint: '/api/onx/returns', method: 'POST', dynamic: true },
        { label: 'Verify Return', endpoint: '/api/onx/returns', method: 'GET', dynamic: true },
      ],
    },
    {
      id: 'inventory-audit', name: 'Inventory Audit', badge: 'PREVIEW',
      description: 'Check inventory across all warehouses for a product and identify stock levels.',
      steps: [
        { label: 'List Products', endpoint: '/api/onx/products?limit=5', method: 'GET' },
        { label: 'Get All SKUs', endpoint: '/api/onx/product-variants', method: 'GET', dynamic: true },
        { label: 'Check Stock', endpoint: '/api/onx/inventory', method: 'GET', dynamic: true },
      ],
    },
  ];

  const skill = skills[selectedSkill];

  const runSkill = async () => {
    setRunning(true);
    setStepResults({});
    setExpandedStep(null);
    const ctx: Record<string, unknown> = {};

    for (let i = 0; i < skill.steps.length; i++) {
      const step = skill.steps[i];
      setStepResults(prev => ({ ...prev, [i]: { status: 'running' } }));
      const start = performance.now();

      try {
        let url = step.endpoint;
        let opts: RequestInit = {};

        if (step.dynamic && skill.id === 'order-lifecycle') {
          if (i === 1 && ctx.productId) url = `/api/onx/product-variants?productId=${ctx.productId}`;
          if (i === 2 && ctx.sku) url = `/api/onx/inventory?sku=${ctx.sku}`;
          if (i === 3) {
            opts = { method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customer: { email: 'skill@juniper.com', firstName: 'Skill', lastName: 'Demo' },
                lineItems: [{ sku: ctx.sku || 'TRP-10', quantity: 1 }],
                shippingAddress: { address1: '100 Skill Ln', city: 'Portland', stateOrProvince: 'OR', zipCodeOrPostalCode: '97201', country: 'US' },
              }),
            };
          }
          if (i === 4) {
            opts = { method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: ctx.orderId, trackingNumbers: ['SKILL' + Date.now()], carrier: 'UPS' }),
            };
          }
          if (i === 5 && ctx.orderId) url = `/api/onx/fulfillments?orderId=${ctx.orderId}`;
        }

        if (step.dynamic && skill.id === 'return-processing') {
          if (i === 1) {
            opts = { method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: ctx.orderId, outcome: 'refund',
                returnLineItems: [{ sku: ctx.sku || 'unknown', quantity: 1, reason: 'wrong_size' }],
              }),
            };
          }
          if (i === 2 && ctx.orderId) url = `/api/onx/returns?orderId=${ctx.orderId}`;
        }

        if (step.dynamic && skill.id === 'inventory-audit') {
          if (i === 1 && ctx.productId) url = `/api/onx/product-variants?productId=${ctx.productId}`;
          if (i === 2 && ctx.sku) url = `/api/onx/inventory?sku=${ctx.sku}`;
        }

        const res = await fetch(url, opts);
        const data = await res.json();
        const duration = Math.round(performance.now() - start);

        if (i === 0 && data.items?.[0]) {
          ctx.productId = data.items[0].id;
          if (data.items[0].lineItems?.[0]) ctx.sku = data.items[0].lineItems[0].sku;
          if (skill.id === 'return-processing') ctx.orderId = data.items[0].id;
        }
        if (i === 1 && data.items?.[0]) {
          ctx.sku = data.items[0].sku;
          ctx.variantTitle = data.items[0].title;
        }
        if (data.id) {
          ctx.orderId = ctx.orderId ?? data.id;
          if (data.id.startsWith('order_')) ctx.orderId = data.id;
        }

        setStepResults(prev => ({ ...prev, [i]: { status: 'done', data, duration } }));
      } catch (err) {
        const duration = Math.round(performance.now() - start);
        setStepResults(prev => ({ ...prev, [i]: { status: 'error', data: String(err), duration } }));
      }

      await new Promise(r => setTimeout(r, 400));
    }

    setRunning(false);
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-5">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-gray-900">Skills</h3>
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 rounded-full">Preview</span>
        </div>
        <p className="text-sm text-gray-600">
          Skills are composed workflows over onX tools. They chain multiple API operations into a single automated flow.
          This feature is a preview — not part of the current onX standard.
        </p>
      </div>

      <div className="flex gap-2">
        {skills.map((s, i) => (
          <button
            key={s.id}
            onClick={() => { setSelectedSkill(i); setStepResults({}); setExpandedStep(null); }}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              selectedSkill === i
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">{skill.name}</h4>
            <p className="text-sm text-gray-500 mt-0.5">{skill.description}</p>
          </div>
          <button
            onClick={runSkill}
            disabled={running}
            className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? 'Running...' : 'Run Skill'}
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {skill.steps.map((step, i) => {
            const result = stepResults[i];
            return (
              <div key={i} className={`px-5 py-3.5 flex items-center gap-3 ${
                result?.status === 'running' ? 'bg-blue-50' :
                result?.status === 'done' ? 'bg-green-50/50' :
                result?.status === 'error' ? 'bg-red-50/50' : ''
              }`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  result?.status === 'running' ? 'bg-blue-100 text-blue-600' :
                  result?.status === 'done' ? 'bg-green-100 text-green-600' :
                  result?.status === 'error' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {result?.status === 'running' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                   result?.status === 'done' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                   result?.status === 'error' ? <XCircle className="w-3.5 h-3.5" /> :
                   i + 1}
                </div>
                <span className="text-sm text-gray-700 flex-1">{step.label}</span>
                <span className="text-xs font-mono text-gray-400">{step.method} {step.endpoint.split('?')[0]}</span>
                {result?.duration !== undefined && (
                  <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{result.duration}ms</span>
                )}
                {result?.data != null && (
                  <button onClick={() => setExpandedStep(expandedStep === i ? null : i)} className="text-gray-400 hover:text-gray-600">
                    {expandedStep === i ? <ChevronDown className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {expandedStep !== null && stepResults[expandedStep]?.data != null && (
          <div className="border-t border-gray-200 bg-gray-950 p-4 max-h-80 overflow-y-auto">
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-all">
              {typeof stepResults[expandedStep].data === 'string'
                ? stepResults[expandedStep].data as string
                : JSON.stringify(stepResults[expandedStep].data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
