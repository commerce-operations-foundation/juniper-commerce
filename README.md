# Juniper Commerce — onX Reference Implementation

Juniper Commerce is a full outdoor-gear storefront that implements all 12 onX operations. It serves as a reference implementation for vendors building onX-compliant systems.

## What's Inside

| Component | Description |
|-----------|-------------|
| **Storefront** | Product catalog, cart, checkout, order tracking |
| **Admin** | Dashboard, order management, inventory overview |
| **AI Playground** | Natural-language commerce powered by onX tools |
| **REST API** | All 12 onX operations at `/api/onx/*` |
| **Conformance** | Test any onX endpoint for spec compliance |
| **API Docs** | Swagger UI at `/api/docs` |

## Quick Start (Docker)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git
- The [mcp-reference-server](https://github.com/commerce-operations-foundation/mcp-reference-server) repo cloned **alongside** this repo (only needed if you want the MCP server)

Your folder structure should look like:

```bash
# Clone the MCP server (optional — only needed for --profile mcp)
git clone https://github.com/commerce-operations-foundation/mcp-reference-server.git
```

```
some-parent/
├── juniper-commerce/         ← this repo
└── mcp-reference-server/     ← MCP server repo (optional)
    └── server/
```

### Option A: Interactive Setup (recommended)

```bash
cd juniper-app
npm install        # first time only, installs the prompts package
npm run setup
```

The setup wizard will ask:
1. **Quick Demo** or **Full Install**
2. Data store: **PostgreSQL** or **SQLite**
3. AI provider: **Anthropic** / **OpenAI** / **Gemini** / **Ollama** / **Skip**
4. Include **MCP reference server**?
5. **Seed** sample data?

It generates a `.env` and prints the exact `docker compose` command to run.

### Option B: Manual Setup

#### Demo mode (simplest — no database, no keys)

```bash
cd juniper-app
docker compose up --build
```

Visit `http://localhost:3000`. You get the full storefront with 24 products, 9 orders, and 6 customers loaded in memory.

#### Full mode with PostgreSQL

```bash
cd juniper-app

# Create .env
cat > .env <<'EOF'
APP_MODE=full
DATA_MODE=postgres
DATABASE_URL=postgres://juniper:juniper@db:5432/juniper
SEED_DATA=true
PORT=3000
NODE_ENV=production
EOF

docker compose --profile postgres up --build
```

Postgres starts first (healthcheck), schema + seed SQL run automatically, then Juniper starts.

#### Full mode with PostgreSQL + MCP Server

```bash
cd juniper-app

cat > .env <<'EOF'
APP_MODE=full
DATA_MODE=postgres
DATABASE_URL=postgres://juniper:juniper@db:5432/juniper
ONX_MCP_SERVER_URL=http://mcp-server:8080
SEED_DATA=true
PORT=3000
NODE_ENV=production
EOF

docker compose --profile postgres --profile mcp up --build
```

This starts all three containers:
- **Juniper** on `http://localhost:3000`
- **PostgreSQL** on `localhost:5432`
- **MCP Server** on `http://localhost:8080`

### Tear Down

```bash
# Stop everything and remove volumes
docker compose --profile postgres --profile mcp down -v
```

## What to Test

### 1. Storefront
- `http://localhost:3000` — Homepage
- `http://localhost:3000/products` — Browse 24 products, search, filter by category
- Click any product → variant selector, inventory status, add to cart
- `http://localhost:3000/cart` → `http://localhost:3000/checkout` — Full checkout flow

### 2. Admin
- `http://localhost:3000/admin` — Dashboard with order counts, inventory stats
- `http://localhost:3000/admin/orders` — Order list with status management
- `http://localhost:3000/admin/inventory` — Stock levels by warehouse

### 3. API
- `http://localhost:3000/api/health` — Health check
- `http://localhost:3000/api/onx/products` — List products (JSON)
- `http://localhost:3000/api/onx/orders` — List orders
- `http://localhost:3000/api/onx/customers` — List customers
- `http://localhost:3000/api/onx/inventory` — Inventory levels
- `http://localhost:3000/api/onx/fulfillments` — Fulfillments
- `http://localhost:3000/api/onx/returns` — Returns
- `http://localhost:3000/api/onx/product-variants` — Product variants
- `POST http://localhost:3000/api/onx/orders/update` — Update order
- `POST http://localhost:3000/api/onx/orders/cancel` — Cancel order

### 4. AI Playground
- `http://localhost:3000/playground` — Chat with onX tools
- Requires an AI API key (set via setup wizard, `.env`, or Settings page)
- Try: "Show me all hiking boots", "Check inventory for Trail Runner Pro"
- The right panel shows actual tool calls with input/output

### 5. API Documentation
- `http://localhost:3000/api/docs` — Swagger UI
- `http://localhost:3000/openapi.yaml` — Raw OpenAPI spec

### 6. Conformance
- `http://localhost:3000/conformance` — Run 17 tests against any onX endpoint

### 7. Settings (Full Mode only)
- `http://localhost:3000/settings` — Configure AI provider, data store, MCP URL
- In demo mode this page redirects to home (by design)

### 8. MCP Server (if started with `--profile mcp`)
- `http://localhost:8080/health` — Server health
- `http://localhost:8080/api/tools` — Lists all 12 onX tools
- Test a tool: `curl -X POST http://localhost:8080/api/tools/get-products -H "Content-Type: application/json" -d "{}"`

## Two Modes

| | Demo Mode | Full (Install) Mode |
|---|---|---|
| **Data** | In-memory (TypeScript arrays) | PostgreSQL or SQLite |
| **Persistence** | Session-scoped, resets on restart | Persistent across restarts |
| **AI** | Rate-limited (20 msgs/min) | Your own key, no limits |
| **Settings** | Hidden | Full config screen |
| **MCP Server** | Not included | Optional via `--profile mcp` |

## Architecture

```
┌────────────────────────────────────────────────────┐
│  Juniper Commerce (Next.js 15)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Storefront   │  │ Admin        │  │ Playground│ │
│  │ /products    │  │ /admin       │  │ /playground│ │
│  │ /cart        │  │ /admin/orders│  │           │ │
│  │ /checkout    │  │ /admin/inv   │  │           │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                 │                │       │
│  ┌──────▼─────────────────▼────────────────▼─────┐ │
│  │  onX Client (src/lib/onx-client.ts)           │ │
│  │  → DataProvider interface                     │ │
│  └──────┬──────────────┬───────────────┬─────────┘ │
│         │              │               │           │
│  ┌──────▼─────┐ ┌──────▼─────┐ ┌──────▼─────┐     │
│  │ InMemory   │ │ Postgres   │ │ SQLite     │     │
│  │ Provider   │ │ Provider   │ │ Provider   │     │
│  └────────────┘ └────────────┘ └────────────┘     │
│                                                    │
│  ┌─────────────────────────────────────────────┐   │
│  │  LLM Provider (src/lib/ai/llm-provider.ts) │   │
│  │  Anthropic │ OpenAI │ Gemini │ Ollama       │   │
│  └─────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
         │
         ▼ (optional)
┌────────────────────────────┐
│  MCP Reference Server      │
│  12 onX tools over HTTP    │
│  Mock adapter (built-in)   │
│  http://mcp-server:8080    │
└────────────────────────────┘
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_MODE` | `demo` | `demo` or `full` |
| `DATA_MODE` | `memory` | `memory`, `postgres`, or `sqlite` |
| `DATABASE_URL` | — | Postgres or SQLite connection string |
| `ANTHROPIC_API_KEY` | — | Anthropic API key |
| `OPENAI_API_KEY` | — | OpenAI API key |
| `GOOGLE_AI_API_KEY` | — | Google Gemini API key |
| `OLLAMA_URL` | — | Ollama server URL |
| `OLLAMA_MODEL` | — | Ollama model name |
| `ONX_MCP_SERVER_URL` | — | MCP HTTP server URL |
| `SEED_DATA` | `false` | Load sample data on first run |
| `SESSION_TTL_MINUTES` | `30` | Demo session timeout |
| `MAX_MESSAGES_PER_SESSION` | `20` | Rate limit for playground in demo mode |

## Local Development (without Docker)

```bash
cd juniper-app
npm install
cp .env.example .env.local   # edit with your keys
npm run dev
```

Visit `http://localhost:3000`.
