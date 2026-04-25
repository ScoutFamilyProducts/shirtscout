export type Retailer = 'walmart' | 'ebay' | 'amazon';

export interface NormalizedProduct {
  id: string;
  retailer: Retailer;
  title: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  productUrl: string;
  affiliateUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  inStock: boolean;
  sizes: string[];
  colors: string[];
}

export interface SearchQuery {
  query: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  retailers?: Retailer[];
  page?: number;
  limit?: number;
}

export interface SearchResults {
  query: SearchQuery;
  results: NormalizedProduct[];
  totalResults: number;
  page: number;
  limit: number;
  retailers: Record<string, { count: number; error?: string }>;
}
