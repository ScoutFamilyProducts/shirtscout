import { Router, Request, Response } from 'express';
import { SearchQuery, Retailer } from '../types/product';
import { WalmartConnector } from '../connectors/walmart';
import { EbayConnector } from '../connectors/ebay';
import { AmazonConnector } from '../connectors/amazon';
import { deduplicateById } from '../normalizer';
import { getCachedResults, setCachedResults, buildCacheKey } from '../cache';
import logger from '../logger';

const router = Router();

const connectors = [new WalmartConnector(), new EbayConnector(), new AmazonConnector()];

router.get('/', async (req: Request, res: Response) => {
  const {
    q,
    minPrice,
    maxPrice,
    size,
    color,
    retailers,
    page = '1',
    limit = '20',
  } = req.query as Record<string, string>;

  if (!q || q.trim().length === 0) {
    res.status(400).json({ error: 'Missing required query parameter: q' });
    return;
  }

  const searchQuery: SearchQuery = {
    query: q.trim(),
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    size,
    color,
    retailers: retailers ? (retailers.split(',') as Retailer[]) : undefined,
    page: parseInt(page, 10),
    limit: Math.min(parseInt(limit, 10), 100),
  };

  const cacheKey = buildCacheKey(searchQuery as unknown as Record<string, unknown>);
  const cached = getCachedResults(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  const activeConnectors = searchQuery.retailers
    ? connectors.filter((c) => searchQuery.retailers!.includes(c.name as Retailer))
    : connectors;

  const settled = await Promise.allSettled(activeConnectors.map((c) => c.search(searchQuery)));

  const retailerStats: SearchQuery['retailers'] extends undefined ? never : Record<string, { count: number; error?: string }> = {} as never;
  let allProducts = settled.flatMap((result, i) => {
    const name = activeConnectors[i].name as Retailer;
    if (result.status === 'fulfilled') {
      (retailerStats as Record<string, { count: number; error?: string }>)[name] = { count: result.value.products.length };
      if (result.value.error) {
        (retailerStats as Record<string, { count: number; error?: string }>)[name].error = result.value.error;
      }
      return result.value.products;
    } else {
      logger.error(`Connector ${name} failed`, { error: result.reason });
      (retailerStats as Record<string, { count: number; error?: string }>)[name] = { count: 0, error: String(result.reason) };
      return [];
    }
  });

  allProducts = deduplicateById(allProducts);
  allProducts.sort((a, b) => a.price - b.price);

  const pageNum = searchQuery.page ?? 1;
  const pageSize = searchQuery.limit ?? 20;
  const start = (pageNum - 1) * pageSize;
  const paginated = allProducts.slice(start, start + pageSize);

  const response = {
    query: searchQuery,
    results: paginated,
    totalResults: allProducts.length,
    page: pageNum,
    limit: pageSize,
    retailers: retailerStats,
  };

  setCachedResults(cacheKey, response);
  res.json(response);
});

export default router;
