export type Retailer = 'walmart' | 'ebay' | 'amazon';

export interface Product {
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
  freeShipping: boolean;
  sizes: string[];
  colors: string[];
}

export type SortOption = 'best-match' | 'lowest-price' | 'highest-rated';
export type StoreFilter = 'all' | Retailer;
