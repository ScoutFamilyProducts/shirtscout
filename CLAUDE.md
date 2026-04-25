# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

ShirtScout is in early development.

- `backend/` — Node.js/TypeScript Express API (connectors for Walmart, eBay, Amazon)
- `mobile/` — Expo React Native app (TypeScript, brand theme set up)
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

## Mobile

### Setup & Commands

```bash
cd mobile
npm run start    # Expo dev server (scan QR with Expo Go)
npm run android  # Android emulator
npm run ios      # iOS simulator (macOS only)
npm run web      # Browser
```

### Architecture

```
src/
  theme/
    colors.ts     — palette (6 brand tokens) + semantic aliases (bgBase, accentPrimary, …)
    typography.ts — font scale, weights, pre-composed textPresets (heading, body, price, …)
    spacing.ts    — 4 px grid (spacing[4] = 16), radius, borderWidth, shadow (incl. neonGlow)
    index.ts      — re-exports everything + unified `theme` object + Theme type
```

### Path alias

`@/*` resolves to `src/*` — e.g. `import { colors } from '@/theme'`.

### Brand palette

| Token          | Hex       | Role                          |
|----------------|-----------|-------------------------------|
| Deep Purple    | `#2A0E4A` | surfaces, adaptive icon bg    |
| Dark Base      | `#1B0A30` | screen background, splash bg  |
| Neon Green     | `#7CFF5B` | primary CTA, price, active    |
| Soft Violet    | `#B388FF` | secondary accent, links       |
| Off White      | `#F5F2FA` | primary text                  |
| Muted Gray-Lilac | `#B9AEC9` | secondary text, placeholders |
