import { Product, Retailer } from '@/types/product';

// iOS simulator and Expo web: localhost works.
// Android emulator: replace with 'http://10.0.2.2:3000'.
// Physical device: replace with your machine's LAN IP, e.g. 'http://192.168.1.x:3000'.
const API_BASE = 'http://192.168.4.115:3000';

export interface SearchResult {
  products: Product[];
  totalResults: number;
  retailers: Record<string, { count: number; error?: string }>;
}

const VALID_RETAILERS = new Set<string>(['walmart', 'ebay', 'amazon']);

function isRetailer(value: string): value is Retailer {
  return VALID_RETAILERS.has(value);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(raw: any): Product {
  return {
    id:          String(raw.id),
    retailer:    isRetailer(raw.retailer) ? raw.retailer : 'amazon',
    title:       String(raw.title ?? ''),
    price:       Number(raw.price) || 0,
    currency:    String(raw.currency ?? 'USD'),
    imageUrl:    raw.imageUrl ?? null,
    productUrl:  String(raw.productUrl ?? ''),
    affiliateUrl: raw.affiliateUrl ?? null,
    rating:      raw.rating != null ? Number(raw.rating) : null,
    reviewCount: raw.reviewCount != null ? Number(raw.reviewCount) : null,
    inStock:     raw.inStock !== false,
    freeShipping: raw.freeShipping === true,
    sizes:       Array.isArray(raw.sizes) ? raw.sizes : [],
    colors:      Array.isArray(raw.colors) ? raw.colors : [],
  };
}

export async function searchProducts(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult> {
  const params = new URLSearchParams({ q: query, limit: '50' });
  const res = await fetch(`${API_BASE}/api/search?${params}`, { signal });

  if (!res.ok) {
    let message = `Server error (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch { /* non-JSON body */ }
    throw new Error(message);
  }

  const data = await res.json();
  return {
    products:     (data.results ?? []).map(mapProduct),
    totalResults: Number(data.totalResults) || 0,
    retailers:    data.retailers ?? {},
  };
}
