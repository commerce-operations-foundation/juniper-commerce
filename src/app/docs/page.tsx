import Link from 'next/link';
import { BookOpen, Zap, Code2, Globe, CheckSquare, ArrowRight, Mountain, Terminal, ExternalLink } from 'lucide-react';

function Section({ id, title, icon: Icon, children }: { id: string; title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-20">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-teal-600" />
        </div>
        <h2 className="text-2xl font-bold text-[#1a1a2e]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function CodeBlock({ language, children }: { language: string; children: string }) {
  return (
    <div className="rounded-xl overflow-hidden my-4">
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-mono">{language}</span>
        <Terminal className="w-4 h-4 text-gray-500" />
      </div>
      <pre className="bg-gray-900 text-gray-200 p-4 text-sm font-mono overflow-x-auto leading-relaxed">{children}</pre>
    </div>
  );
}

function Callout({ type, children }: { type: 'info' | 'tip' | 'warning'; children: React.ReactNode }) {
  const styles = {
    info: 'bg-blue-50 border-blue-300 text-blue-900',
    tip: 'bg-teal-50 border-teal-300 text-teal-900',
    warning: 'bg-amber-50 border-amber-300 text-amber-900',
  };
  const labels = { info: 'ℹ️ Info', tip: '💡 Tip', warning: '⚠️ Warning' };
  return (
    <div className={`border-l-4 rounded-r-xl px-4 py-3 my-4 text-sm ${styles[type]}`}>
      <strong className="block mb-1">{labels[type]}</strong>
      {children}
    </div>
  );
}

export default function DocsPage() {
  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: Zap },
    { id: 'architecture', label: 'Architecture', icon: Code2 },
    { id: 'build-adapter', label: 'Build an Adapter', icon: Mountain },
    { id: 'ucp-integration', label: 'UCP Integration', icon: Globe },
    { id: 'conformance', label: 'Conformance Testing', icon: CheckSquare },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Documentation</p>
            <nav className="space-y-1">
              {sections.map(({ id, label, icon: Icon }) => (
                <a key={id} href={`#${id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                  <Icon className="w-4 h-4" />{label}
                </a>
              ))}
            </nav>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <Link href="/.well-known/ucp" target="_blank" className="text-xs text-teal-600 hover:underline block mb-1">UCP Manifest →</Link>
              <Link href="/conformance" className="text-xs text-teal-600 hover:underline block mb-1">Run Conformance →</Link>
              <Link href="/admin" className="text-xs text-teal-600 hover:underline block mb-1">Admin Panel →</Link>
              <Link href="/api/docs" className="text-xs text-teal-600 hover:underline block mb-1">API Docs →</Link>
              <a href="https://commerceopsfoundation.org" target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:underline flex items-center gap-1 mb-1">COF Website <ExternalLink className="w-2.5 h-2.5" /></a>
              <a href="https://github.com/commerce-operations-foundation/mcp-reference-server" target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:underline flex items-center gap-1">GitHub Repo <ExternalLink className="w-2.5 h-2.5" /></a>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 max-w-3xl">
          {/* Hero */}
          <div className="mb-12">
            <div className="flex items-center gap-2 text-teal-600 text-sm mb-3">
              <BookOpen className="w-4 h-4" /> onX Documentation
            </div>
            <h1 className="text-4xl font-bold text-[#1a1a2e] mb-4">Juniper Commerce Docs</h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              Everything you need to understand the onX standard, build your adapter, integrate with UCP, and validate conformance.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://commerceopsfoundation.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-teal-600 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                Commerce Operations Foundation <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com/commerce-operations-foundation/mcp-reference-server"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                GitHub: mcp-reference-server <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Getting Started */}
          <Section id="getting-started" title="Getting Started" icon={Zap}>
            <p className="text-gray-600 mb-4 leading-relaxed">
              The onX (Order Network eXchange) standard defines a common MCP (Model Context Protocol) interface for commerce fulfillment operations.
              Any AI platform can connect to any onX-compliant adapter using a single, consistent protocol.
            </p>

            <p className="text-sm text-gray-500 mb-4">
              Juniper Commerce is the reference app maintained by the{' '}
              <a href="https://commerceopsfoundation.org" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline inline-flex items-center gap-1">
                Commerce Operations Foundation <ExternalLink className="w-3 h-3" />
              </a>
              . Source:{' '}
              <a href="https://github.com/commerce-operations-foundation/juniper-commerce" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline inline-flex items-center gap-1">
                juniper-commerce on GitHub <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>

            <h3 className="text-lg font-semibold text-[#1a1a2e] mb-3">Path A — Docker (recommended)</h3>
            <p className="text-gray-600 mb-3 text-sm leading-relaxed">
              From the repository root, run the interactive setup wizard. It writes a <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">.env</code> file,
              chooses Demo vs Full Install, data store (PostgreSQL or SQLite when not in Demo), optional AI keys, and optional MCP server profile.
              When it finishes, use the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">docker compose</code> command it prints
              (it may add <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">--profile</code> flags for Postgres and/or the MCP server).
            </p>
            <CodeBlock language="bash">{`npm run setup
docker compose up --build
# → http://localhost:3000 (adjust if PORT in .env differs)`}</CodeBlock>

            <h3 className="text-lg font-semibold text-[#1a1a2e] mt-6 mb-3">Path B — Local development</h3>
            <p className="text-gray-600 mb-3 text-sm leading-relaxed">
              Run the Next.js app directly for fast iteration. Copy the example env file, adjust <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">APP_MODE</code>,{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">DATA_MODE</code>, and keys as needed (defaults favor Demo + in-memory).
            </p>
            <CodeBlock language="bash">{`npm install
cp .env.example .env.local
npm run dev
# → http://localhost:3000`}</CodeBlock>

            <h3 className="text-lg font-semibold text-[#1a1a2e] mt-6 mb-3">Conformance</h3>
            <p className="text-gray-600 mb-3 text-sm leading-relaxed">
              With the app running, open the built-in runner to execute the full suite against your instance.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/conformance" className="inline-flex items-center gap-1.5 text-sm text-teal-600 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors font-medium">
                Open Conformance UI <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Callout type="tip">
              <strong>Demo mode</strong> uses an in-memory <code className="bg-teal-100 px-1 rounded">DataProvider</code> with per-session isolation and TTL so visitors don&apos;t share data.
              <strong> Install (Full) mode</strong> turns on persistent storage: configure <code className="bg-teal-100 px-1 rounded">DATA_MODE=postgres</code> or{' '}
              <code className="bg-teal-100 px-1 rounded">sqlite</code> and the matching <code className="bg-teal-100 px-1 rounded">DATABASE_URL</code>.
              In Install mode, when you include the MCP reference server in setup, it runs alongside Juniper via Docker Compose; Juniper calls it using{' '}
              <code className="bg-teal-100 px-1 rounded">ONX_MCP_SERVER_URL</code>.
            </Callout>
          </Section>

          {/* Architecture */}
          <Section id="architecture" title="Architecture" icon={Code2}>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Juniper v2 is a Next.js application that exposes REST and UCP endpoints, maps them to the same twelve onX operations, and powers the Playground with pluggable AI and data backends.
              The onX contract itself is implemented by adapters behind the MCP reference server; Juniper can call that server over HTTP in full install setups or fulfill operations through its own{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">DataProvider</code> abstraction.
            </p>

            <ul className="list-disc pl-5 text-gray-600 text-sm space-y-2 mb-6 leading-relaxed">
              <li>
                <strong className="text-[#1a1a2e]">DataProvider</strong> — Swappable persistence: <code className="bg-gray-100 px-1 rounded text-xs font-mono">memory</code> (session-scoped stores),{' '}
                <code className="bg-gray-100 px-1 rounded text-xs font-mono">postgres</code>, or <code className="bg-gray-100 px-1 rounded text-xs font-mono">sqlite</code>, selected via{' '}
                <code className="bg-gray-100 px-1 rounded text-xs font-mono">DATA_MODE</code> and environment.
              </li>
              <li>
                <strong className="text-[#1a1a2e]">LLM provider</strong> — Unified interface with concrete drivers for{' '}
                <strong>Anthropic</strong>, <strong>OpenAI</strong>, <strong>Google Gemini</strong>, and <strong>Ollama</strong>. The app picks a provider from which API keys or Ollama URL are set.
              </li>
              <li>
                <strong className="text-[#1a1a2e]">Two-mode architecture</strong> — <strong>Demo</strong> (<code className="bg-gray-100 px-1 rounded text-xs font-mono">APP_MODE=demo</code>): in-memory data, rate limits, no admin settings UI.
                <strong> Install / Full</strong> (<code className="bg-gray-100 px-1 rounded text-xs font-mono">APP_MODE=full</code>): persistent data, full Playground, settings, and optional MCP server integration.
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-[#1a1a2e] mb-3">The 12 Operations</h3>
            <p className="text-gray-600 mb-3 text-sm leading-relaxed">
              Adapters implement <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">IFulfillmentAdapter</code> and expose these MCP tools.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[
                ['get-products', 'List product catalog'],
                ['get-product-variants', 'List SKUs & options'],
                ['get-inventory', 'Stock levels by SKU/location'],
                ['get-customers', 'Customer lookup'],
                ['get-orders', 'Order history & filtering'],
                ['create-sales-order', 'Place a new order'],
                ['update-order', 'Modify an existing order'],
                ['cancel-order', 'Cancel with reason'],
                ['fulfill-order', 'Ship with tracking'],
                ['get-fulfillments', 'Fulfillment status'],
                ['create-return', 'Initiate return/RMA'],
                ['get-returns', 'Return history'],
              ].map(([op, desc]) => (
                <div key={op} className="flex gap-2 text-sm">
                  <code className="text-teal-700 font-mono text-xs bg-teal-50 px-1.5 py-0.5 rounded self-start flex-shrink-0">{op}</code>
                  <span className="text-gray-600">{desc}</span>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-[#1a1a2e] mb-3">Stack overview</h3>
            <CodeBlock language="text">{`┌──────────────────────────────────────────────────────────────────────┐
│  Juniper Commerce (Next.js)                                          │
│  • Routes: storefront, REST APIs, UCP bridge, Playground, conformance│
│  • Demo mode: in-memory DataProvider, isolated per browser session   │
│  • Full / Install: Postgres or SQLite + settings + optional MCP URL  │
├──────────────────────────────────────────────────────────────────────┤
│  LLM layer (one active provider from env)                            │
│    Anthropic (Claude) │ OpenAI │ Google Gemini │ Ollama (local)      │
├──────────────────────────────────────────────────────────────────────┤
│  Commerce logic → 12 onX operations (tools / API handlers)           │
│  DataProvider: Memory │ PostgreSQL │ SQLite                          │
└──────────────────────────────────────────────────────────────────────┘
        │  ONX_MCP_SERVER_URL (optional, typical in Docker Compose)
        ▼
┌──────────────────────────────────────────────────────────────────────┐
│  MCP reference server (HTTP) — mock or custom IFulfillmentAdapter    │
│  Protocol: MCP tools map to the same 12 operations                   │
└──────────────────────────────────────────────────────────────────────┘`}</CodeBlock>

            <Callout type="info">
              Application entry points for onX-shaped data and tools live under <code className="bg-blue-100 px-1 rounded">src/lib</code> (data providers, LLM factory,{' '}
              <code className="bg-blue-100 px-1 rounded">onx-client.ts</code>). In Demo mode, requests stay inside the app process; in Full Install with MCP enabled, Juniper delegates to the reference server
              defined by <code className="bg-blue-100 px-1 rounded">ONX_MCP_SERVER_URL</code>.
            </Callout>
          </Section>

          {/* Build Adapter */}
          <Section id="build-adapter" title="Build Your Adapter" icon={Mountain}>
            <p className="text-gray-600 mb-4 leading-relaxed">
              An adapter wraps your fulfillment system (Shopify, NetSuite, custom WMS, etc.) and implements the onX interface.
              Use the template from <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">adapter-template/</code> in the Commerce Operations Foundation repositories as your starting point.
            </p>

            <h3 className="text-lg font-semibold text-[#1a1a2e] mb-3">Step 1: Scaffold</h3>
            <CodeBlock language="bash">{`cp -r adapter-template my-adapter
cd my-adapter
npm install
# Edit src/adapter.ts`}</CodeBlock>

            <h3 className="text-lg font-semibold text-[#1a1a2e] mt-6 mb-3">Step 2: Implement the interface</h3>
            <CodeBlock language="typescript">{`import type { IFulfillmentAdapter } from '@cof-org/mcp';

export class MyAdapter implements IFulfillmentAdapter {
  async getOrders(params) {
    // Fetch from your system
    const orders = await myAPI.listOrders(params);
    // Return in onX format
    return { items: orders.map(toOnXOrder), total: orders.length };
  }

  async createSalesOrder(input) {
    const order = await myAPI.createOrder(input);
    return toOnXOrder(order);
  }

  // ... implement all 12 operations
}`}</CodeBlock>

            <h3 className="text-lg font-semibold text-[#1a1a2e] mt-6 mb-3">Step 3: Configure and test</h3>
            <CodeBlock language="bash">{`# Point the MCP server at your built adapter (see server docs for env vars)
ADAPTER_TYPE=local ADAPTER_PATH=./dist/adapter.js node server/dist/index.js

# With Juniper running, validate the HTTP surface from the web UI:
# http://localhost:3000/conformance`}</CodeBlock>

            <h3 className="text-lg font-semibold text-[#1a1a2e] mt-6 mb-3">Step 4: Publish to npm</h3>
            <CodeBlock language="bash">{`npm publish --access public
# Consumers can then use:
# ADAPTER_TYPE=npm ADAPTER_PACKAGE=@myco/onx-adapter`}</CodeBlock>

            <Callout type="tip">
              All 12 operations have JSON Schema definitions in <code className="bg-teal-100 px-1 rounded">schemas/</code>.
              The conformance runner in Juniper validates your deployment against these expectations from the UI.
            </Callout>
          </Section>

          {/* UCP Integration */}
          <Section id="ucp-integration" title="UCP Integration" icon={Globe}>
            <p className="text-gray-600 mb-4 leading-relaxed">
              The Universal Commerce Protocol (UCP) lets AI platforms discover and consume your commerce capabilities via a standardized manifest.
              This app implements the full UCP bridge.
            </p>

            <h3 className="text-lg font-semibold text-[#1a1a2e] mb-3">Discovery Manifest</h3>
            <p className="text-gray-600 mb-3 text-sm">
              Expose your capabilities at <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">/.well-known/ucp</code>:
            </p>
            <CodeBlock language="json">{`{
  "version": "1.0",
  "name": "My Store",
  "baseUrl": "https://store.example.com",
  "capabilities": [
    {
      "id": "dev.ucp.shopping.catalog",
      "type": "catalog",
      "endpoint": "/api/ucp/catalog",
      "methods": ["GET", "POST"]
    },
    {
      "id": "dev.ucp.shopping.checkout",
      "type": "checkout",
      "endpoint": "/api/ucp/checkout",
      "methods": ["POST"]
    }
  ],
  "auth": {
    "type": "apiKey",
    "apiKeyHeader": "Authorization"
  }
}`}</CodeBlock>

            <h3 className="text-lg font-semibold text-[#1a1a2e] mt-6 mb-3">Request/Response Flow</h3>
            <CodeBlock language="text">{`AI Platform → POST /.well-known/ucp discovery
AI Platform → GET /api/ucp/catalog?query=jacket
AI Platform → POST /api/ucp/checkout { items, customer, address }
              → translates to onX create-sales-order
              → returns { orderId, status, total }
AI Platform → GET /api/ucp/fulfillment?orderId=X
              → translates to onX get-fulfillments
              → returns { orderId, status, trackingNumbers }`}</CodeBlock>

            <Callout type="info">
              This app uses API key auth for the demo. For production, implement OAuth 2.0 client credentials flow.
              The manifest documents the token URL and scopes.
            </Callout>
          </Section>

          {/* Conformance */}
          <Section id="conformance" title="Conformance Testing" icon={CheckSquare}>
            <p className="text-gray-600 mb-4 leading-relaxed">
              The conformance runner validates that your Juniper (or proxied onX) HTTP surface meets the reference expectations.
              Run it from the web UI—no separate CLI package required.
            </p>

            <h3 className="text-lg font-semibold text-[#1a1a2e] mb-3">Web UI</h3>
            <p className="text-gray-600 mb-3 text-sm leading-relaxed">
              Open <Link href="/conformance" className="text-teal-600 hover:underline font-medium">/conformance</Link> while the app is running.
              Start a run to execute all suites against the configured base URL (typically this app on localhost).
            </p>

            <h3 className="text-lg font-semibold text-[#1a1a2e] mt-6 mb-3">What&apos;s Tested</h3>
            <div className="space-y-2 mb-6">
              {[
                ['UCP Discovery (3 tests)', 'Manifest exists, has required fields, capabilities array'],
                ['Catalog API (4 tests)', 'Endpoint reachable, response shape, items structure, search works'],
                ['Checkout API (3 tests)', 'Creates order, response has orderId, rejects invalid input'],
                ['Fulfillment API (4 tests)', 'Status lookup, response shape, 400 on missing, 404 on unknown'],
                ['onX Bridge (3 tests)', 'Products, orders, inventory endpoints all return 200'],
              ].map(([suite, desc]) => (
                <div key={suite} className="flex gap-3 text-sm">
                  <span className="font-semibold text-[#1a1a2e] min-w-48 flex-shrink-0">{suite}</span>
                  <span className="text-gray-600">{desc}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Link href="/conformance" className="btn-primary text-sm py-2 px-4">
                Open Web Runner <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}
