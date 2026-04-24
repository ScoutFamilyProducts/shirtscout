import axios, { AxiosError } from 'axios';
import { Connector, ConnectorResult } from './base';
import { NormalizedProduct, SearchQuery } from '../types/product';
import { parsePrice, sanitizeUrl } from '../normalizer';
import logger from '../logger';

const TOKEN_URL = 'https://api.ebay.com/identity/v1/oauth2/token';
const BROWSE_BASE = 'https://api.ebay.com/buy/browse/v1';
const BROWSE_SCOPE = 'https://api.ebay.com/oauth/api_scope/buy.browse.readonly';
const MAX_LIMIT = 200;
// eBay category 15687 = Men's T-Shirts; keeps results relevant without
// forcing an exact category filter that would drop women's/unisex listings.
const TSHIRT_CATEGORY_ID = '15687';

// ---------- token cache (module-level, shared across requests) ----------

let tokenCache: { value: string; expiresAt: number } | null = null;

async function getAccessToken(appId: string, certId: string): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.value;
  }

  const credentials = Buffer.from(`${appId}:${certId}`).toString('base64');
  const { data } = await axios.post<{ access_token: string; expires_in: number }>(
    TOKEN_URL,
    `grant_type=client_credentials&scope=${encodeURIComponent(BROWSE_SCOPE)}`,
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 8000,
    }
  );

  // Subtract 60s buffer so we never send a token that expires mid-request.
  tokenCache = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  logger.debug('EbayConnector: fetched new access token');
  return tokenCache.value;
}

// ---------- response types ----------

interface EbayPrice {
  value: string;
  currency: string;
}

interface EbayAspect {
  type: string;
  name: string;
  value: string;
}

interface EbayItemSummary {
  itemId: string;
  title: string;
  price?: EbayPrice;
  image?: { imageUrl: string };
  itemWebUrl?: string;
  condition?: string;
  seller?: { feedbackScore?: number; feedbackPercentage?: string };
  localizedAspects?: EbayAspect[];
}

interface EbaySearchResponse {
  total?: number;
  limit?: number;
  offset?: number;
  itemSummaries?: EbayItemSummary[];
}

// ---------- mapping ----------

function mapItem(item: EbayItemSummary): NormalizedProduct {
  const price = parsePrice(item.price?.value);
  const currency = item.price?.currency ?? 'USD';
  const imageUrl = sanitizeUrl(item.image?.imageUrl);
  const productUrl = sanitizeUrl(item.itemWebUrl) ?? '';

  const aspects = item.localizedAspects ?? [];
  const sizes = aspects
    .filter((a) => a.name.toLowerCase() === 'size')
    .map((a) => a.value)
    .filter(Boolean);
  const colors = aspects
    .filter((a) => a.name.toLowerCase() === 'color')
    .map((a) => a.value)
    .filter(Boolean);

  return {
    id: item.itemId,
    retailer: 'ebay',
    title: item.title,
    price,
    currency,
    imageUrl,
    productUrl,
    // eBay Partner Network rover links require a campaign ID not available
    // from standard Browse API responses — leave null until PN is configured.
    affiliateUrl: null,
    rating: null,
    reviewCount: null,
    // All items returned by Browse API search are active listings.
    inStock: true,
    sizes,
    colors,
  };
}

// ---------- filter string builder ----------

function buildPriceFilter(minPrice?: number, maxPrice?: number): string | null {
  if (minPrice === undefined && maxPrice === undefined) return null;
  const min = minPrice !== undefined ? minPrice.toFixed(2) : '';
  const max = maxPrice !== undefined ? maxPrice.toFixed(2) : '';
  return `price:[${min}..${max}],priceCurrency:USD`;
}

// ---------- connector ----------

export class EbayConnector implements Connector {
  readonly name = 'ebay';

  private appId: string;
  private certId: string;

  constructor() {
    this.appId = process.env.EBAY_APP_ID ?? '';
    this.certId = process.env.EBAY_CERT_ID ?? '';
  }

  async search(query: SearchQuery): Promise<ConnectorResult> {
    if (!this.appId || !this.certId) {
      return { products: [], total: 0, error: 'eBay credentials not configured' };
    }

    let token: string;
    try {
      token = await getAccessToken(this.appId, this.certId);
    } catch (err) {
      const detail = (err as AxiosError).response?.data ?? (err as Error).message;
      logger.error('EbayConnector: token fetch failed', { detail });
      return { products: [], total: 0, error: `eBay token error: ${JSON.stringify(detail)}` };
    }

    const limit = Math.min(query.limit ?? 50, MAX_LIMIT);
    const offset = ((query.page ?? 1) - 1) * limit;

    const params: Record<string, string | number> = {
      q: query.query,
      limit,
      offset,
      category_ids: TSHIRT_CATEGORY_ID,
      fieldgroups: 'EXTENDED',
    };

    const priceFilter = buildPriceFilter(query.minPrice, query.maxPrice);
    if (priceFilter) params['filter'] = priceFilter;

    logger.debug('EbayConnector.search', { query: query.query, limit, offset });

    try {
      const { data } = await axios.get<EbaySearchResponse>(`${BROWSE_BASE}/item_summary/search`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          'Content-Type': 'application/json',
        },
        params,
        timeout: 8000,
      });

      const items = data.itemSummaries ?? [];
      const products = items.map(mapItem);
      const total = data.total ?? products.length;

      return { products, total };
    } catch (err) {
      const axiosErr = err as AxiosError;
      const status = axiosErr.response?.status;
      const detail = axiosErr.response?.data ?? axiosErr.message;

      // 401 means the token was invalidated server-side — clear the cache so
      // the next call re-fetches rather than retrying with a bad token.
      if (status === 401) tokenCache = null;

      logger.error('EbayConnector: search failed', { status, detail });
      return {
        products: [],
        total: 0,
        error: `eBay API error ${status ?? 'network'}: ${JSON.stringify(detail)}`,
      };
    }
  }
}
