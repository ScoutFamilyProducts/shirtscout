import { NormalizedProduct } from '../types/product';

// Each connector transforms raw API responses into NormalizedProduct here.
// Shared helpers for price parsing and URL sanitization live in this module.

export function parsePrice(raw: string | number | undefined): number {
  if (raw === undefined || raw === null) return 0;
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

export function sanitizeUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function deduplicateById(products: NormalizedProduct[]): NormalizedProduct[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    const key = `${p.retailer}:${p.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
