import { Retailer } from '@/types/product';

// Single source of truth for retailer display metadata on mobile.
//
// To add a new retailer: add its entry here and to the Retailer union in
// src/types/product.ts — the Record<Retailer, …> type enforces exhaustiveness,
// so TypeScript will error here until the entry exists.

export const RETAILER_META: Record<Retailer, { label: string; color: string; abbr: string }> = {
  walmart: { label: 'Walmart', color: '#0071DC', abbr: 'W' },
  ebay:    { label: 'eBay',    color: '#E53238', abbr: 'E' },
  amazon:  { label: 'Amazon',  color: '#FF9900', abbr: 'A' },
};
