import axios, { AxiosError } from 'axios';
import { createSign } from 'crypto';
import { Connector, ConnectorResult } from './base';
import { NormalizedProduct, SearchQuery } from '../types/product';
import { parsePrice, sanitizeUrl } from '../normalizer';
import logger from '../logger';

const BASE_URL = 'https://developer.api.walmart.com/api-proxy/service/affil/product/v2/search';
const MAX_ITEMS_PER_PAGE = 25;

// ---------- auth ----------

function buildAuthHeaders(consumerId: string, privateKey: string, keyVersion: string) {
  const timestamp = Date.now().toString();
  // Walmart IO signature: RSA-SHA256 over "consumerId\ntimestamp\nkeyVersion\n"
  const payload = `${consumerId}\n${timestamp}\n${keyVersion}\n`;
  const sign = createSign('RSA-SHA256');
  sign.update(payload);
  const signature = sign.sign(privateKey, 'base64');

  return {
    'WM_CONSUMER.ID': consumerId,
    'WM_CONSUMER.INTIMESTAMP': timestamp,
    'WM_SEC.KEY_VERSION': keyVersion,
    'WM_SEC.AUTH_SIGNATURE': signature,
  };
}

// ---------- response types ----------

interface WalmartItem {
  itemId: number;
  name: string;
  salePrice?: number;
  msrp?: number;
  largeImage?: string;
  mediumImage?: string;
  thumbnailImage?: string;
  productTrackingUrl?: string;
  productUrl?: string;
  customerRating?: string;
  numReviews?: number;
  stock?: string;
  size?: string;
  color?: string;
  variants?: Record<string, unknown>;
}

interface WalmartSearchResponse {
  totalResults?: string | number;
  start?: number;
  numItems?: number;
  items?: WalmartItem[];
}

// ---------- mapping ----------

function mapItem(item: WalmartItem): NormalizedProduct {
  const price = parsePrice(item.salePrice ?? item.msrp);
  const imageUrl =
    sanitizeUrl(item.largeImage) ??
    sanitizeUrl(item.mediumImage) ??
    sanitizeUrl(item.thumbnailImage);
  const productUrl = sanitizeUrl(item.productUrl) ?? sanitizeUrl(item.productTrackingUrl) ?? '';
  const affiliateUrl = sanitizeUrl(item.productTrackingUrl);
  const rating = item.customerRating ? parseFloat(item.customerRating) : null;

  const sizes = item.size
    ? item.size.split(/[,/]/).map((s) => s.trim()).filter(Boolean)
    : [];
  const colors = item.color
    ? item.color.split(/[,/]/).map((c) => c.trim()).filter(Boolean)
    : [];

  return {
    id: String(item.itemId),
    retailer: 'walmart',
    title: item.name,
    price,
    currency: 'USD',
    imageUrl,
    productUrl,
    affiliateUrl,
    rating: rating !== null && !isNaN(rating) ? rating : null,
    reviewCount: item.numReviews ?? null,
    inStock: (item.stock ?? '').toLowerCase() !== 'not available',
    freeShipping: false,
    sizes,
    colors,
  };
}

// ---------- connector ----------

export class WalmartConnector implements Connector {
  readonly name = 'walmart';

  private consumerId: string;
  private privateKey: string;
  private keyVersion: string;

  constructor() {
    this.consumerId = process.env.WALMART_CONSUMER_ID ?? '';
    // .env stores the PEM with literal \n — restore actual newlines
    this.privateKey = (process.env.WALMART_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
    this.keyVersion = process.env.WALMART_KEY_VERSION ?? '1';
  }

  async search(query: SearchQuery): Promise<ConnectorResult> {
    if (!this.consumerId || !this.privateKey) {
      return { products: [], total: 0, error: 'Walmart credentials not configured' };
    }

    const page = query.page ?? 1;
    const numItems = Math.min(query.limit ?? MAX_ITEMS_PER_PAGE, MAX_ITEMS_PER_PAGE);
    const start = (page - 1) * numItems + 1;

    const params: Record<string, string | number> = {
      query: query.query,
      numItems,
      start,
      facet: 'on',
    };

    if (query.minPrice !== undefined) params['minPrice'] = query.minPrice;
    if (query.maxPrice !== undefined) params['maxPrice'] = query.maxPrice;

    let headers: ReturnType<typeof buildAuthHeaders>;
    try {
      headers = buildAuthHeaders(this.consumerId, this.privateKey, this.keyVersion);
    } catch (err) {
      logger.error('WalmartConnector: failed to build auth headers', { err });
      return { products: [], total: 0, error: 'Failed to sign Walmart request — check private key format' };
    }

    logger.debug('WalmartConnector.search', { query: query.query, page, numItems, start });

    try {
      const { data } = await axios.get<WalmartSearchResponse>(BASE_URL, {
        headers: { ...headers, Accept: 'application/json' },
        params,
        timeout: 8000,
      });

      const items = data.items ?? [];
      const products = items.map(mapItem);
      const total = parseInt(String(data.totalResults ?? '0'), 10);

      return { products, total };
    } catch (err) {
      const axiosErr = err as AxiosError;
      const status = axiosErr.response?.status;
      const detail = axiosErr.response?.data ?? axiosErr.message;
      logger.error('WalmartConnector: search failed', { status, detail });
      return {
        products: [],
        total: 0,
        error: `Walmart API error ${status ?? 'network'}: ${JSON.stringify(detail)}`,
      };
    }
  }
}
