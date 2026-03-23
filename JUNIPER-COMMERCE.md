# Juniper Commerce — onX Reference Application

> A complete, working reference implementation of the Order Network eXchange (onX) standard,
> with Google Universal Commerce Protocol (UCP) integration, conformance testing, and
> vendor onboarding documentation.
>
> Built by the Commerce Operations Foundation Technical Steering Committee.

---

## Table of Contents

1. [Why This Exists](#why-this-exists)
2. [The Problem](#the-problem)
3. [What is onX?](#what-is-onx)
4. [History of This Repo](#history-of-this-repo)
5. [Juniper Commerce — The Reference Store](#juniper-commerce--the-reference-store)
6. [Core Capability 1: The onX MCP Server & HTTP Bridge](#core-capability-1-the-onx-mcp-server--http-bridge)
7. [Core Capability 2: Universal Commerce Protocol (UCP) Integration](#core-capability-2-universal-commerce-protocol-ucp-integration)
8. [Core Capability 3: Conformance Testing](#core-capability-3-conformance-testing)
9. [Architecture](#architecture)
10. [The 12 onX Operations](#the-12-onx-operations)
11. [The 7 Entity Schemas](#the-7-entity-schemas)
12. [Getting Started](#getting-started)
13. [API Reference](#api-reference)
14. [For Vendors: Building Your Adapter](#for-vendors-building-your-adapter)
15. [Design Decisions](#design-decisions)
16. [Links & Resources](#links--resources)

---

## Why This Exists

Every year, the commerce industry spends billions on point-to-point integrations between selling channels and fulfillment systems. A Shopify store connects to a 3PL one way. A marketplace connects to a WMS another way. An AI shopping assistant connects to an OMS yet another way. Every connection is custom. Every integration takes 3-6 months. Every vendor switch costs six figures.

There is no standard protocol for how an order flows from the point of sale to the point of fulfillment.

Until now.

The **Commerce Operations Foundation (COF)** was established as a vendor-neutral 501(c)(6) nonprofit to create and maintain **onX — the Order Network eXchange** — an open standard that defines how commerce systems talk to fulfillment systems. Think of it as what SWIFT did for banking transactions, applied to commerce operations.

This application — **Juniper Commerce** — is the reference implementation. It exists so that:

1. **Vendors** can see exactly what a compliant implementation looks like, clone it, and build their own adapter in hours instead of months.
2. **Merchants** can understand what onX means for their operations without reading a spec document.
3. **The TSC** has a living, testable artifact to validate the standard against.
4. **Google's UCP** has a proven bridge to back-office fulfillment — connecting the front-end commerce protocol to the back-end operations protocol.

---

## The Problem

### The Current State of Commerce Integration

```
                    SELLING SIDE                          FULFILLMENT SIDE
              ┌─────────────────────┐              ┌─────────────────────┐
              │  Shopify            │──── custom ──▶│  ShipBob            │
              │  Amazon             │──── custom ──▶│  Radial             │
              │  TikTok Shop        │──── custom ──▶│  GEODIS             │
              │  AI Agent (ChatGPT) │──── ?????? ──▶│  Manhattan          │
              │  AI Agent (Gemini)  │──── ?????? ──▶│  Logiwa             │
              │  Instagram Shop     │──── custom ──▶│  Ryder              │
              │  Brand.com          │──── custom ──▶│  Barrett            │
              └─────────────────────┘              └─────────────────────┘
                                    N × N integrations
                                    Every one is bespoke
                                    Every one breaks differently
```

The front-end of commerce has standards. Payment processors use standard APIs. Shipping carriers publish standard tracking formats. But the actual flow of an order from "customer clicked buy" to "package left the warehouse" has no standard at all.

This creates three problems:

1. **For vendors:** Every new selling channel means custom integration work. Manhattan Associates, with 50+ years in the business, maintains hundreds of proprietary connectors. Smaller vendors can't compete.

2. **For merchants:** Switching fulfillment providers takes 6-12 months and costs $200K-$1M in integration work. Vendor lock-in is the norm.

3. **For AI:** The rise of AI shopping assistants (ChatGPT, Gemini, Claude) means orders will increasingly originate from conversational interfaces that don't have pre-built connectors to any fulfillment system. Without a standard, AI commerce stalls at product discovery — it can find what you want but can't buy it or track it.

### The Opportunity

```
                    SELLING SIDE                          FULFILLMENT SIDE
              ┌─────────────────────┐              ┌─────────────────────┐
              │  Shopify            │              │  ShipBob            │
              │  Amazon             │              │  Radial             │
              │  TikTok Shop        │──── onX ────▶│  GEODIS             │
              │  AI Agent (ChatGPT) │   standard   │  Manhattan          │
              │  AI Agent (Gemini)  │              │  Logiwa             │
              │  Instagram Shop     │              │  Ryder              │
              │  Brand.com          │              │  Barrett            │
              └─────────────────────┘              └─────────────────────┘
                                    1 × N integrations
                                    Implement once, connect everywhere
                                    "onX compliant" has testable meaning
```

---

## What is onX?

**onX (Order Network eXchange)** is an open protocol that standardizes 12 core operations covering the complete order lifecycle:

- **Order capture:** Creating, updating, and cancelling orders from any channel
- **Fulfillment:** Picking, packing, shipping, and tracking
- **Inventory:** Real-time stock levels across locations
- **Returns:** Processing returns, exchanges, and refunds
- **Products & Customers:** Catalog and customer data synchronization

onX is built on top of the **Model Context Protocol (MCP)** — an open standard developed by Anthropic for how AI systems interact with external tools. This means any MCP-compatible AI assistant (Claude, and increasingly others) can natively interact with any onX-compliant fulfillment system.

The standard is:
- **Vendor-neutral:** No single company controls it. The Commerce Operations Foundation is a 501(c)(6) nonprofit.
- **Transport-neutral:** Works over MCP (stdio), HTTP REST, and future A2A protocols.
- **Extensible:** Core operations are fixed; vendors add custom fields without breaking interoperability.
- **Testable:** The conformance suite validates compliance programmatically.

### Who's Behind It

The Commerce Operations Foundation board and Technical Steering Committee includes representatives from:

- **Fulfillment vendors:** Manhattan Associates, Logiwa, Deck Commerce, ShipHero, Nextuple, Radial, GEODIS, Ryder, Barrett Distribution
- **Commerce platforms:** Elastic Path, Shopware, Cin7, Kibo Commerce
- **Brands:** Jockey, Vitamin Shoppe, Follett Books, Signet Jewelers
- **Technology:** IBM, Spreetail, Pipe17, Tidal Commerce
- **Consultancies:** FulfillmentIQ, Bahr Company, Perficient

---

## History of This Repo

### Timeline

**October 2025** — Kelly Goetsch (COO, Pipe17; co-founder of the MACH Alliance) proposes the Order Network eXchange concept. The idea: what the MACH Alliance did for composable commerce architecture, do for order operations.

**November 2025** — Technical Steering Committee forms. Weekly Monday calls begin. 45+ members from across the industry.

**December 2025** — The group agrees on the v1 scope: 12 core operations, JSON Schema definitions, and an MCP server reference implementation. Key decisions:
- MCP as the foundation protocol (AI-native from day one)
- Adapter pattern for vendor integration (implement one interface, connect to any system)
- v1 launch target: January 2026

**January 2026** — v1.0.0 ships. The `mcp-reference-server` repository goes public with:
- 12 tool implementations (5 actions + 7 queries)
- Mock adapter with realistic test data
- JSON Schema definitions for 7 entity types
- Adapter template for vendor implementations
- Comprehensive test suite (unit, integration, e2e)

**January-February 2026** — Adoption begins:
- Manhattan Associates announces onX support (live ~April 2026)
- Virtro goes live
- Keepo goes live
- Deck Commerce goes live
- Google launches Universal Commerce Protocol (UCP) — a front-end standard for AI commerce discovery and checkout

**March 2026** — Two things become clear:
1. The MCP server works, but vendors need more than a spec — they need a working example they can see, test against, and learn from.
2. Google's UCP and onX need to talk to each other. UCP handles the front (discovery → checkout). onX handles the back (order → fulfillment). Nobody has built the bridge.

**March 15, 2026** — Juniper Commerce ships as its own application repository (`juniper-commerce`), demonstrating:
- A complete storefront running on onX
- The UCP ↔ onX bridge (front-end protocol meets back-end protocol)
- A conformance testing tool vendors can use to validate their implementations
- Onboarding documentation to get a vendor from zero to running

### Repository Structure

Juniper Commerce and the onX reference MCP server are **separate repositories**. The storefront is not nested inside the MCP server tree.

```
juniper-commerce/               # Separate repo
├── src/                        # Next.js 15 application
├── db/                         # Schema + seed SQL
├── Dockerfile                  # Multi-stage production build
├── docker-compose.yml          # Juniper + Postgres + MCP server
├── setup.js                    # Interactive CLI setup wizard
├── .env.example                # Environment template
└── README.md                   # Quick start guide

mcp-reference-server/           # Separate COF repo
├── server/                     # MCP server (TypeScript)
├── schemas/                    # JSON Schemas (the standard)
└── docs/                       # Specification
```

The MCP server repo may also include `adapter-template/`, `conformance-cli/`, and related tooling; Juniper consumes onX over HTTP (and optionally runs alongside the MCP server via Docker Compose) while the canonical schemas and spec live in `mcp-reference-server`.

---

## Juniper Commerce — The Reference Store

Juniper Commerce is a fictional outdoor gear retailer. We chose this setting because:

1. It's relatable — everyone understands buying hiking boots and backpacks
2. It demonstrates real complexity — multiple product variants (sizes, colors), inventory across locations, fulfillment workflows
3. It's neutral — not associated with any real merchant or vendor on the TSC

### What the Store Includes

**Catalog:** 24 products across 6 categories (Footwear, Packs & Bags, Shelter, Apparel, Accessories, Sleep):
- **Footwear:** Trail Runner Pro, Approach Shoe, Waterproof Boot
- **Packs & Bags:** Summit Pack 45L, Day Pack 22L, Duffel 60L, Waist Pack
- **Shelter:** Alpine Shelter 2P, Basecamp Tent 4P
- **Apparel:** Ridgeline Jacket, Merino Base Layer, Softshell Vest, Rain Shell
- **Accessories:** Hydration Flask 32oz, Trekking Poles, Headlamp, Camp Stove, First Aid Kit
- **Sleep:** Down Sleeping Bag 20°F, Insulated Sleeping Pad, Ultralight Quilt, Camp Pillow, Silk Liner, Compression Stuff Sack

Each product has multiple variants (sizes, colors) with realistic pricing, descriptions, and inventory levels across 3 warehouse locations.

**Customers:** 6 customer profiles representing different buying patterns (returning customers, B2B wholesale, first-time buyers).

**Orders:** 9 seed orders in various states (confirmed, processing, shipped, delivered, cancelled) demonstrating the full order lifecycle.

**Admin Panel:** Order management, fulfillment processing, and inventory views — showing what the operations side looks like.

### Pages

| Page | Path | Purpose |
|------|------|---------|
| Home | `/` | Landing page with featured products |
| Products | `/products` | Full catalog browse |
| Product Detail | `/products/[id]` | Individual product with variants |
| Cart | `/cart` | Shopping cart |
| Checkout | `/checkout` | Customer info, shipping, payment |
| My Orders | `/orders` | Order history |
| Order Detail | `/orders/[id]` | Order status timeline |
| Settings | `/settings` | Install mode settings (demo vs full stack) |
| Admin Dashboard | `/admin` | Operations overview |
| Admin Orders | `/admin/orders` | Order management with fulfillment |
| Admin Inventory | `/admin/inventory` | Stock levels across locations |
| Conformance | `/conformance` | Run conformance tests (web UI) |
| Documentation | `/docs` | Onboarding guide |
| OpenAPI Docs | `/api/docs` | Swagger UI for the OpenAPI specification |

---

## Core Capability 1: The onX MCP Server & HTTP Bridge

### The MCP Server

The original `mcp-reference-server` uses the MCP protocol (stdio transport) — designed for AI assistants like Claude Desktop. An AI agent connects to the server and can invoke any of the 12 onX operations through natural language.

Example: A user tells Claude "Check inventory for the Trail Runner Pro in size 10" → Claude calls `get-inventory` with `sku: "TRP-010"` → Gets back real-time stock levels.

### The HTTP Bridge

Most vendors don't use Claude Desktop. They have REST APIs. Juniper Commerce bridges this gap by exposing all 12 onX operations as standard HTTP REST endpoints:

```
GET    /api/onx/products              → get-products
GET    /api/onx/products?sku=TRP-010  → get-product-variants
GET    /api/onx/orders                → get-orders
GET    /api/onx/orders/[id]           → get-orders (by ID)
POST   /api/onx/orders               → create-sales-order
PUT    /api/onx/orders/[id]           → update-order
DELETE /api/onx/orders/[id]           → cancel-order
GET    /api/onx/inventory             → get-inventory
GET    /api/onx/fulfillments          → get-fulfillments
POST   /api/onx/fulfillments          → fulfill-order
GET    /api/onx/returns               → get-returns
POST   /api/onx/returns               → create-return
```

This demonstrates that the onX standard works over HTTP, not just MCP stdio. The adapter pattern is identical — the same `IFulfillmentAdapter` interface handles requests regardless of transport.

### Why the Adapter Pattern Matters

The MCP server doesn't know or care what fulfillment system is behind it. It talks to an adapter interface:

```typescript
interface IFulfillmentAdapter {
  createSalesOrder(input): Promise<OrderResult>;
  cancelOrder(input): Promise<OrderResult>;
  updateOrder(input): Promise<OrderResult>;
  fulfillOrder(input): Promise<FulfillmentResult>;
  createReturn(input): Promise<ReturnResult>;
  getOrders(input): Promise<{ orders: Order[] }>;
  getCustomers(input): Promise<{ customers: Customer[] }>;
  getProducts(input): Promise<{ products: Product[] }>;
  getProductVariants(input): Promise<{ productVariants: ProductVariant[] }>;
  getInventory(input): Promise<{ inventory: InventoryItem[] }>;
  getFulfillments(input): Promise<{ fulfillments: Fulfillment[] }>;
  getReturns(input): Promise<{ returns: Return[] }>;
}
```

Juniper Commerce routes persistence through a **DataProvider** abstraction (see [Architecture](#architecture)). In **Demo** mode it uses session-scoped in-memory data (seed data); in **Full** mode it can use PostgreSQL or SQLite. A real vendor would implement the adapter interface against their own database or API. The adapter template in `mcp-reference-server` provides the boilerplate.

---

## Core Capability 2: Universal Commerce Protocol (UCP) Integration

### What is UCP?

Google's **Universal Commerce Protocol (UCP)** is an open standard for agentic commerce on the selling side. It was launched in January 2026 with Shopify, and has since expanded to 20+ partners including Target, Walmart, Lowe's, and Etsy.

UCP defines how AI agents (Gemini, ChatGPT, Claude) discover products, manage carts, process checkout, and track fulfillment — using a standardized JSON manifest and REST endpoints.

### How UCP and onX Relate

```
┌─────────────────────┐        ┌──────────────────────┐        ┌──────────────────┐
│   AI Agent          │        │   UCP ↔ onX Bridge    │        │   Fulfillment     │
│   (Gemini, Claude,  │──UCP──▶│   (Juniper Commerce)  │──onX──▶│   System          │
│    ChatGPT)         │        │                       │        │   (Your Backend)  │
└─────────────────────┘        └──────────────────────┘        └──────────────────┘
                                        │
                               Translates UCP checkout
                               requests into onX operations
```

- **UCP** handles the customer-facing side: product discovery, cart management, checkout
- **onX** handles the operations side: order management, inventory, fulfillment, returns
- **Juniper Commerce** demonstrates the bridge: a single application that speaks both protocols

### The UCP Discovery Manifest

Every UCP-compatible server publishes a JSON manifest at `/.well-known/ucp`:

```json
{
  "version": "1.0",
  "name": "Juniper Commerce",
  "description": "Outdoor gear powered by the onX standard",
  "baseUrl": "http://localhost:3000",
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
    },
    {
      "id": "dev.ucp.shopping.fulfillment",
      "type": "fulfillment",
      "endpoint": "/api/ucp/fulfillment",
      "methods": ["GET"]
    }
  ],
  "auth": {
    "type": "apiKey",
    "header": "Authorization",
    "prefix": "Bearer"
  }
}
```

An AI agent reads this manifest to discover what the server can do, then calls the appropriate endpoints.

### UCP Endpoints

| Endpoint | Method | Description | Translates To |
|----------|--------|-------------|---------------|
| `/api/ucp/catalog` | GET | Browse products with search | `get-products` + `get-product-variants` |
| `/api/ucp/checkout` | POST | Place an order | `create-sales-order` |
| `/api/ucp/fulfillment` | GET | Track order fulfillment | `get-orders` + `get-fulfillments` |

### Example: End-to-End UCP Flow

```bash
# 1. Agent discovers capabilities
GET /.well-known/ucp
→ Returns manifest with catalog, checkout, fulfillment endpoints

# 2. Agent searches for products
GET /api/ucp/catalog?query=jacket
→ Returns Ridgeline Jacket with variants, pricing, availability

# 3. Customer decides to buy
POST /api/ucp/checkout
{
  "items": [{"sku": "RJ-L", "quantity": 1}],
  "customer": {"email": "alex@example.com", "firstName": "Alex", "lastName": "Chen"},
  "shippingAddress": {"address1": "742 Evergreen Terrace", "city": "Springfield", ...}
}
→ Returns orderId, status: "confirmed", estimatedDelivery

# 4. Agent checks fulfillment status
GET /api/ucp/fulfillment?orderId=order_JNP_123
→ Returns fulfillment status, tracking number, carrier, estimated delivery
```

---

## Core Capability 3: Conformance Testing

### The Problem It Solves

"onX compliant" needs to mean something testable. Without a conformance suite, vendors can claim compliance without actually implementing the standard correctly. The TSC identified this as the #1 adoption blocker in January 2026.

### What the Conformance Tester Validates

The test suite runs **17 tests across 5 suites:**

#### Suite 1: UCP Discovery (3 tests)
- `/.well-known/ucp` exists and returns 200
- Manifest has required fields (version, capabilities, auth)
- Capabilities is a non-empty array

#### Suite 2: Catalog API (4 tests)
- `GET /api/ucp/catalog` returns 200
- Response has correct shape (items, total, offset, limit)
- Each item has required fields (id, name, price, currency)
- Search query parameter works

#### Suite 3: Checkout API (3 tests)
- `POST /api/ucp/checkout` creates order (returns 201)
- Response has required fields (orderId, status, total)
- Rejects invalid payloads with 400

#### Suite 4: Fulfillment API (4 tests)
- `GET /api/ucp/fulfillment?orderId=X` returns status
- Response has correct shape (orderId, status, fulfillments)
- Missing orderId returns 400
- Non-existent orderId returns 404

#### Suite 5: onX Bridge (3 tests)
- `GET /products` returns product catalog
- `GET /orders` returns order list
- `GET /inventory` returns inventory levels

### Web UI

The `/conformance` page provides a browser-based test runner. Enter an endpoint URL, click "Run Tests," and see results with green/red pass/fail badges for each test.

### CLI Tool

For CI/CD integration and command-line usage (from the `mcp-reference-server` repo, `conformance-cli/`):

```bash
# From the conformance-cli directory
node bin/cli.js --endpoint http://your-server.com/api/onx

# Options
--endpoint <url>    Target endpoint (required)
--suite <name>      Run specific suite (ucp|catalog|checkout|fulfillment|onx)
--json              Output raw JSON report
--help              Show usage

# Exit codes
# 0 = all tests passed (CONFORMANT)
# 1 = one or more tests failed (NON-CONFORMANT)
```

Example output:
```
  onx-conform v1.0.0 · Testing: http://localhost:3000/api/onx

  onx-conform — onX Conformance Report
  http://localhost:3000/api/onx · 3/15/2026

  ● UCP Discovery (3/3 passed)
    ✓ /.well-known/ucp exists                          (54ms)
    ✓ Manifest has version, capabilities, auth          (17ms)
    ✓ capabilities is a non-empty array                 (16ms)

  ● Catalog API (4/4 passed)
    ✓ GET /api/ucp/catalog returns 200                  (40ms)
    ✓ Response has items, total, offset, limit           (38ms)
    ✓ Items have id, name, price, currency               (49ms)
    ✓ Search query param works                           (49ms)

  ● Checkout API (3/3 passed)
    ✓ POST /api/ucp/checkout creates order               (28ms)
    ✓ Response has orderId, status, total                 (26ms)
    ✓ Rejects empty body with 400                        (23ms)

  ● Fulfillment API (4/4 passed)
    ✓ GET /api/ucp/fulfillment?orderId                   (21ms)
    ✓ Response has orderId, status, fulfillments          (19ms)
    ✓ Missing orderId returns 400                        (20ms)
    ✓ Unknown orderId returns 404                        (19ms)

  ● onX Bridge (3/3 passed)
    ✓ GET /api/onx/products                              (19ms)
    ✓ GET /api/onx/orders                                (23ms)
    ✓ GET /api/onx/inventory                             (25ms)

  ✓ CONFORMANT  17/17 tests passed · Score: 100%
```

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│              Juniper Commerce (Next.js 15 · React 19)                       │
├────────────────┬──────────────┬────────────────────────────┬────────────────┤
│  Storefront    │  Admin Panel │  Conformance · Docs        │  /settings     │
│  (Browse, Cart,│  (Orders,    │  (Test runner, guides)     │  Demo vs Full  │
│   Checkout,    │   Fulfill,   │                            │  install mode  │
│   Track)       │   Inventory) │                            │                │
└───────┬────────┴──────┬───────┴─────────────┬──────────────┴────────┬───────┘
        │               │                     │                      │
        ▼               ▼                     ▼                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js Route Handlers)                        │
├────────────────┬──────────────────┬────────────────────────────────────────┤
│  UCP Bridge    │  onX HTTP Bridge │  Conformance · OpenAPI (/api/docs)      │
│  /.well-known/ │  /api/onx/*      │                                         │
│  /api/ucp/*    │                  │                                         │
└───────┬────────┴──────┬───────────┴─────────────────┬───────────────────────┘
        │               │                             │
        ▼               ▼                             ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  LLM Provider layer: Anthropic · OpenAI · Gemini · Ollama                  │
│  (configurable; powers agent / assistant features where enabled)             │
└────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  onX Client (implements IFulfillmentAdapter-style operations)               │
└────────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  DataProvider abstraction                                                    │
│  • InMemory  — Demo mode: session-scoped seed data, no external DB           │
│  • Postgres  — Full mode: persistent database (e.g. Docker Compose stack)      │
│  • SQLite    — Full mode: file-backed persistence for local installs         │
└────────────────────────────────────────────────────────────────────────────┘

  Demo mode  → InMemory DataProvider (quick try-out, data resets with session)
  Full mode  → Postgres or SQLite (persistent catalog, orders, inventory)
```

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 15 (App Router) | Current React framework, aligns with modern TypeScript tooling |
| UI | React 19 | Matches Next.js 15 defaults; concurrent-ready UI |
| Language | TypeScript | Type safety, consistent with the MCP server codebase |
| Styling | Tailwind CSS | Rapid UI development, professional appearance |
| Icons | Lucide React | Clean, consistent iconography |
| Validation | Ajv + ajv-formats | JSON Schema validation for conformance testing |
| Data | DataProvider: InMemory (demo), PostgreSQL, SQLite (full) | Zero-dependency demo path; real persistence when you need it |
| Runtime | Docker optional | `docker-compose.yml` runs Juniper, Postgres, and the MCP server together |
| Port | 3000 | Default development port |

---

## The 12 onX Operations

### Action Operations (Write)

| # | Operation | Description | Input | Output |
|---|-----------|-------------|-------|--------|
| 1 | `create-sales-order` | Create a new order from any channel | Customer, items, addresses, payment | Order with ID, status, totals |
| 2 | `update-order` | Modify an existing order | Order ID, fields to update | Updated order |
| 3 | `cancel-order` | Cancel an order | Order ID, reason, notify flag | Cancelled order |
| 4 | `fulfill-order` | Mark order as fulfilled | Order ID, tracking, carrier, items | Fulfillment record |
| 5 | `create-return` | Process a return | Order ID, items, reason, refund type | Return record |

### Query Operations (Read)

| # | Operation | Description | Filters | Output |
|---|-----------|-------------|---------|--------|
| 6 | `get-orders` | Retrieve orders | Status, date range, customer, external ID | Order list (paginated) |
| 7 | `get-customers` | Fetch customer records | Email, type | Customer list |
| 8 | `get-products` | Browse product catalog | Status, tags, SKU | Product list |
| 9 | `get-product-variants` | Get variant details | Product ID, SKU | Variant list with pricing/dimensions |
| 10 | `get-inventory` | Check stock levels | SKU, location ID | Inventory by location |
| 11 | `get-fulfillments` | Track shipments | Order ID | Fulfillment list with tracking |
| 12 | `get-returns` | Query returns | Order ID, status | Return list |

---

## The 7 Entity Schemas

All schemas are defined in JSON Schema (draft-07) and available in the `schemas/` directory of **`mcp-reference-server`**:

| Schema | Key Fields | Description |
|--------|-----------|-------------|
| `order.json` | id, status, lineItems, billingAddress, shippingAddress, financialSummary | Complete order with addresses, items, and financial totals |
| `product.json` | id, name, description, status, tags, categories, options, vendor | Product catalog entry with categorization and options |
| `product-variant.json` | id, productId, sku, barcode, price, weight, dimensions | SKU-level data with pricing, weight, and dimensions |
| `customer.json` | id, email, firstName, lastName, addresses, tags, orderCount | Customer profile with order history |
| `fulfillment.json` | id, orderId, status, carrier, trackingNumbers, lineItems | Shipment record with tracking and item-level detail |
| `inventory.json` | id, sku, locationId, available, committed, reserved | Stock levels by location with availability breakdown |
| `return.json` | id, orderId, status, returnItems, refundAmount | Return record with items, reasons, and refund tracking |

---

## Getting Started

### Docker (recommended)

```bash
git clone https://github.com/commerce-operations-foundation/juniper-commerce
cd juniper-commerce
npm run setup          # Interactive wizard
# Follow the prompts, then:
docker compose up --build
```

The setup wizard configures environment variables and install mode; Docker Compose brings up the app with Postgres (and the MCP server) as defined in the project’s `docker-compose.yml`.

### Run Conformance Tests

```bash
# Web UI (with the app running)
open http://localhost:3000/conformance

# CLI (from mcp-reference-server)
cd /path/to/mcp-reference-server/conformance-cli
npm install
node bin/cli.js --endpoint http://localhost:3000/api/onx
```

### Explore the API

```bash
# Products
curl http://localhost:3000/api/onx/products | jq

# OpenAPI / Swagger UI in the browser
open http://localhost:3000/api/docs

# Place an order via UCP
curl -X POST http://localhost:3000/api/ucp/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"sku": "TRP-010", "quantity": 1}],
    "customer": {"email": "test@example.com", "firstName": "Test", "lastName": "User"},
    "shippingAddress": {"address1": "123 Main St", "city": "Denver", "state": "CO", "zip": "80202", "country": "US"}
  }'

# Check UCP discovery manifest
curl http://localhost:3000/.well-known/ucp | jq
```

---

## API Reference

### UCP Endpoints

#### `GET /.well-known/ucp`
Returns the UCP discovery manifest declaring server capabilities.

#### `GET /api/ucp/catalog`
Query parameters: `query`, `category`, `limit`, `offset`
Returns: `{ items: Product[], total, offset, limit }`

#### `POST /api/ucp/checkout`
Body: `{ items: [{sku, quantity}], customer: {email, firstName, lastName}, shippingAddress: {...} }`
Returns: `{ orderId, orderNumber, status, total, currency, estimatedDelivery, lineItems, shippingAddress }`

#### `GET /api/ucp/fulfillment?orderId=X`
Returns: `{ orderId, orderNumber, status, fulfillments: [{id, status, carrier, trackingNumbers, items}] }`

### onX HTTP Bridge Endpoints

#### `GET /api/onx/products`
Query: `status`, `tags`, `limit`, `offset`, `includeVariants`

#### `GET /api/onx/orders`
Query: `status`, `customerId`, `limit`, `offset`

#### `GET /api/onx/orders/[id]`
Returns single order with full detail.

#### `GET /api/onx/inventory`
Query: `sku`, `locationId`

#### `GET /api/onx/fulfillments`
Query: `orderId`

#### `GET /api/onx/returns`
Query: `orderId`, `status`

### OpenAPI

#### `GET /api/docs`
Interactive Swagger UI for the published OpenAPI description.

### Conformance API

#### `POST /api/conformance/run`
Body: `{ "endpoint": "http://your-server/api/onx" }`
Returns: Full conformance report with pass/fail per test, scores, and timing.

---

## For Vendors: Building Your Adapter

### Step 1: Clone the adapter template
```bash
# From mcp-reference-server
cp -r adapter-template my-fulfillment-adapter
cd my-fulfillment-adapter
npm install
```

### Step 2: Implement the interface
Edit `src/adapter.ts` and wire each method to your API:

```typescript
async createSalesOrder(input: CreateSalesOrderInput): Promise<OrderResult> {
  const response = await this.client.post('/orders', mapToYourFormat(input));
  return { success: true, order: mapFromYourFormat(response.data) };
}
```

### Step 3: Test against the conformance suite
```bash
# Start your adapter with the MCP server
ADAPTER_TYPE=local ADAPTER_PATH=../my-adapter/dist/index.js node ../server/dist/index.js

# Or test via HTTP bridge
node conformance-cli/bin/cli.js --endpoint http://localhost:YOUR_PORT/api/onx
```

### Step 4: Publish
Submit your adapter as a PR to the COF repo, or publish as an npm package (`@your-org/onx-adapter-yourplatform`).

---

## Design Decisions

### Why Next.js?
onX is a **vendor-neutral** standard. Using Shopify would imply it only works with Shopify. A standalone Next.js application proves the standard works with any commerce platform.

### Why in-memory data (and when not)?
**Demo mode** uses a session-scoped **in-memory** DataProvider so you can clone, run, and explore with zero database setup — the focus stays on the protocol. **Full mode** uses **PostgreSQL** or **SQLite** for persistent catalog, orders, and inventory (including via Docker Compose). Vendors can still implement `IFulfillmentAdapter` against their own systems regardless of how Juniper stores data locally.

### Why MCP as the foundation?
MCP is the only protocol designed specifically for AI ↔ tool interaction. As AI shopping assistants become the primary order channel, having an AI-native foundation isn't optional — it's structural.

### Why both UCP and onX?
UCP and onX are complementary, not competing:
- **UCP** = how AI agents talk to merchants (discovery, cart, checkout)
- **onX** = how merchants talk to fulfillment systems (orders, inventory, shipping)
- **The bridge** = Juniper Commerce translates between them

### Why a conformance CLI?
Self-attestation ("we support onX") is meaningless. Automated testing ("we pass 17/17 onX conformance tests") is verifiable. The CLI enables CI/CD integration so vendors can validate compliance on every deploy.

---

## Links & Resources

- **Commerce Operations Foundation:** https://commerceopsfoundation.org
- **Juniper Commerce (storefront):** https://github.com/commerce-operations-foundation/juniper-commerce
- **onX MCP reference server:** https://github.com/commerce-operations-foundation/mcp-reference-server
- **onX Specification:** Available in `docs/standard/` in the `mcp-reference-server` repository
- **Model Context Protocol:** https://modelcontextprotocol.io
- **Google UCP:** Published at Google Merchant Center Help
- **TSC Slack:** Contact josh@commerceopsfoundation.org for access
- **Contributing:** See `CONTRIBUTING.md` in the repository you are working in (`juniper-commerce` or `mcp-reference-server`)

---

*This document is maintained by the Commerce Operations Foundation Technical Steering Committee.*
*For questions, contact the TSC via the COF Slack or open an issue on GitHub.*
