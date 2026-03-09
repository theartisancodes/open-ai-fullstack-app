# Open AI Fullstack App

This Next.js app is structured to consume:

- External APIs
- A PostgreSQL database
- OpenAI responses

## Changes Documented (2026-03-05)

The following updates were added to the project:

- New App Router pages:
  - `app/home/page.tsx`
  - `app/dashboard/page.tsx`
  - `app/auth/page.tsx`
- Root landing page updated in `app/page.tsx` to navigate to new pages.
- New service-layer modules for integration concerns:
  - `lib/api/fetch-json.ts`
  - `lib/db/client.ts`
  - `lib/openai/client.ts`
  - `lib/env.ts`
- New API routes for health checks and integrations:
  - `app/api/health/route.ts`
  - `app/api/external/route.ts`
  - `app/api/db/route.ts`
  - `app/api/openai/route.ts`
- Added environment template: `.env.example`
- Added dependencies for integrations:
  - `openai`
  - `pg`
  - `@types/pg`

## Directory Setup

```text
app/
	api/
		db/route.ts          # Database connectivity endpoint
		external/route.ts    # External API consumption endpoint
		health/route.ts      # Health check endpoint
		openai/route.ts      # OpenAI responses endpoint
	auth/page.tsx
	dashboard/page.tsx
	home/page.tsx
	page.tsx

lib/
	api/fetch-json.ts      # Reusable fetch helper
	db/client.ts           # PostgreSQL pool + query helper
	env.ts                 # Server env helpers
	openai/client.ts       # OpenAI client singleton
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill values:

```bash
cp .env.example .env.local
```

Required values:

- `OPENAI_API_KEY`
- `DATABASE_URL`

Optional values:

- `OPENAI_MODEL` (defaults to `gpt-4.1-mini`)
- `EXTERNAL_API_BASE_URL` (defaults to `https://jsonplaceholder.typicode.com`)

## Run Locally

```bash
yarn install
yarn dev
```

## API Endpoints

- `GET /api/health`
  - Purpose: health check for app runtime.
  - Response:
    - `200` `{ "ok": true, "service": "open-ai-fullstack-app", "timestamp": "..." }`

- `GET /api/db`
  - Purpose: verify PostgreSQL connectivity using `select now()::text as now`.
  - Response:
    - `200` `{ "ok": true, "source": "database", "now": "..." }`
    - `500` `{ "ok": false, "source": "database", "error": "..." }`

- `GET /api/external`
  - Purpose: fetch sample data from `EXTERNAL_API_BASE_URL` using `/todos/1`.
  - Response:
    - `200` `{ "ok": true, "source": "external-api", "data": { ... } }`
    - `500` `{ "ok": false, "source": "external-api", "error": "..." }`

- `POST /api/openai`
  - Purpose: create a response from OpenAI.
  - Request body:
    - `prompt` (required, string)
    - `model` (optional, string; defaults to `OPENAI_MODEL` or `gpt-4.1-mini`)
  - Response:
    - `200` `{ "ok": true, "source": "openai", "output": "...", "responseId": "..." }`
    - `400` `{ "ok": false, "error": "prompt is required" }`
    - `500` `{ "ok": false, "source": "openai", "error": "..." }`

Example request:

```bash
curl -X POST http://localhost:3000/api/openai \
	-H "Content-Type: application/json" \
	-d '{"prompt":"Write a short welcome message for my app"}'
```

## Quick Verify

Run these after `yarn dev`:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/external
curl http://localhost:3000/api/db
curl -X POST http://localhost:3000/api/openai \
	-H "Content-Type: application/json" \
	-d '{"prompt":"Say hello from my API"}'
```
