# Deploying Juniper Commerce

Juniper Commerce ships as a Docker image. Any platform that runs containers can host it.

## Prerequisites

- Docker image built from the included `Dockerfile`
- An AI API key (Anthropic, OpenAI, or Gemini) for the AI Playground

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `APP_MODE` | No | `demo` | `demo` (session-scoped, rate-limited) or `full` (persistent) |
| `DATA_MODE` | No | `memory` | `memory`, `postgres`, or `sqlite` |
| `SEED_DATA` | No | `false` | Load sample data on first run |
| `ANTHROPIC_API_KEY` | For AI | — | Anthropic Claude API key |
| `OPENAI_API_KEY` | For AI | — | OpenAI API key |
| `GOOGLE_AI_API_KEY` | For AI | — | Google Gemini API key |
| `HOSTNAME` | Yes | — | Set to `0.0.0.0` for containerized deployments |
| `NODE_ENV` | No | `production` | Always `production` for deploys |
| `PORT` | No | `3000` | The port the app listens on |

## Azure Container Apps

```bash
# Create a container registry
az acr create --resource-group <rg> --name <registry> --sku Basic --admin-enabled true

# Build the image server-side (no local Docker needed)
az acr build --registry <registry> --image juniper:latest --file Dockerfile .

# Create the environment and app
az containerapp env create --name <env-name> --resource-group <rg> --location <region>
az containerapp create \
  --name juniper-commerce \
  --resource-group <rg> \
  --environment <env-name> \
  --image <registry>.azurecr.io/juniper:latest \
  --registry-server <registry>.azurecr.io \
  --target-port 3000 \
  --ingress external \
  --env-vars APP_MODE=demo SEED_DATA=true HOSTNAME=0.0.0.0 NODE_ENV=production

# Future deploys (two commands)
az acr build --registry <registry> --image juniper:latest --file Dockerfile .
az containerapp update --name juniper-commerce --resource-group <rg> --image <registry>.azurecr.io/juniper:latest
```

## AWS ECS / Fargate

```bash
# Build and push to ECR
aws ecr create-repository --repository-name juniper-commerce
docker build -t juniper .
docker tag juniper:latest <account>.dkr.ecr.<region>.amazonaws.com/juniper-commerce:latest
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker push <account>.dkr.ecr.<region>.amazonaws.com/juniper-commerce:latest

# Create task definition and service via AWS Console or CLI
# Set container port to 3000, environment variables as above
```

## Google Cloud Run

```bash
# Build and deploy in one command
gcloud run deploy juniper-commerce \
  --source . \
  --region us-central1 \
  --port 3000 \
  --set-env-vars APP_MODE=demo,SEED_DATA=true,HOSTNAME=0.0.0.0,NODE_ENV=production \
  --allow-unauthenticated
```

## Railway / Render

Both platforms auto-detect the `Dockerfile`:

1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy

Railway: `railway up`
Render: Push to your connected branch

## Local Docker

```bash
# Quick demo (no database, no keys needed)
docker compose up --build

# Full stack with PostgreSQL
docker compose --profile postgres up --build

# Full stack with PostgreSQL + MCP server
docker compose --profile postgres --profile mcp up --build
```

## Health Check

All deployments should verify the health endpoint after deploy:

```
GET /api/health
→ {"status":"ok","service":"juniper-commerce","version":"2.0.0"}
```

## Demo vs Full Mode

- **Demo mode** (`APP_MODE=demo`): In-memory data, session-scoped mutations, rate-limited AI. No database required. Ideal for public-facing demos.
- **Full mode** (`APP_MODE=full`): Persistent PostgreSQL or SQLite, unrestricted AI, settings screen at `/settings`. Requires `DATABASE_URL`.
