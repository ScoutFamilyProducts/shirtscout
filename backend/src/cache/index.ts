import NodeCache from 'node-cache';
import { SearchResults } from '../types/product';

const TTL = parseInt(process.env.CACHE_TTL ?? '300', 10);

const cache = new NodeCache({ stdTTL: TTL, checkperiod: TTL * 0.2, useClones: false });

export function getCachedResults(key: string): SearchResults | undefined {
  return cache.get<SearchResults>(key);
}

export function setCachedResults(key: string, results: SearchResults): void {
  cache.set(key, results);
}

export function buildCacheKey(params: Record<string, unknown>): string {
  return JSON.stringify(params, Object.keys(params).sort());
}

export function flushCache(): void {
  cache.flushAll();
}
