import { Connector } from './base';
import { Retailer } from '../types/product';
import { WalmartConnector } from './walmart';
import { EbayConnector } from './ebay';
import { AmazonConnector } from './amazon';

// ── Connector registry ─────────────────────────────────────────────────────
//
// Single source of truth for every active retailer connector.
//
// To add a new retailer (e.g. Etsy):
//   1. Add 'etsy' to the Retailer union in src/types/product.ts
//   2. Create src/connectors/etsy.ts implementing the Connector interface
//   3. Add the entry below — TypeScript will error here until you do, which
//      is intentional: the Record<Retailer, …> type enforces exhaustiveness.
//   4. Add the retailer's allowed redirect hostnames to RETAILER_ALLOWED_HOSTS.
//   5. Add the retailer metadata to mobile/src/config/retailers.ts.

export const connectorRegistry: Record<Retailer, Connector> = {
  walmart: new WalmartConnector(),
  ebay:    new EbayConnector(),
  amazon:  new AmazonConnector(),
};

// Pre-built array for fan-out; avoids repeated Object.values() calls.
export const connectors: Connector[] = Object.values(connectorRegistry);

// Narrows an arbitrary string to Retailer. Used to validate query params.
export function isRetailer(value: string): value is Retailer {
  return Object.prototype.hasOwnProperty.call(connectorRegistry, value);
}

// ── Redirect allowlist ─────────────────────────────────────────────────────
//
// Hosts that /api/redirect is permitted to forward to, keyed by retailer so
// adding a new one is a single object entry instead of hunting for a list.

export const RETAILER_ALLOWED_HOSTS: Record<Retailer, string[]> = {
  walmart: ['walmart.com', 'www.walmart.com'],
  ebay:    ['ebay.com', 'www.ebay.com'],
  amazon:  ['amazon.com', 'www.amazon.com', 'amzn.to'],
};

// Flat array used at runtime by the redirect handler.
export const allowedRedirectHosts: string[] = Object.values(RETAILER_ALLOWED_HOSTS).flat();
