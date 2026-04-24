# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

ShirtScout is in early development.

- `backend/` — Node.js/TypeScript Express API (scaffolded, connectors stubbed)
- `mobile/` — mobile app code (not yet started)
- `docs/` — documentation (not yet started)

## Backend

### Setup

```bash
cd backend
cp .env.example .env   # fill in API keys
npm install
```

### Commands

```bash
npm run dev        # ts-node-dev with hot reload
npm run build      # compile to dist/
npm start          # run compiled output
npm run typecheck  # type-check without emitting
```

### Architecture

```
src/
  index.ts          — entry point, starts HTTP server
  app.ts            — Express app, middleware, route registration
  logger.ts         — Winston logger
  types/
    product.ts      — shared types: NormalizedProduct, SearchQuery, SearchResults
  connectors/
    base.ts         — Connector interface
    walmart.ts      — Walmart Open API v2
    ebay.ts         — eBay Browse API
    amazon.ts       — Amazon PAAPI 5.0
  normalizer/
    index.ts        — price parsing, URL sanitization, deduplication helpers
  cache/
    index.ts        — node-cache wrapper (TTL from CACHE_TTL env var, default 300s)
  routes/
    search.ts       — GET /api/search?q=...  (fans out to all connectors, merges results)
    redirect.ts     — GET /api/redirect?url=... (allowlisted outbound link proxy)
```

### Environment Variables

See `.env.example`. Connector API keys are required for live results; the server starts without them but connectors will return errors.
