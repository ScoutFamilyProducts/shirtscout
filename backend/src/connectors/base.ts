import { NormalizedProduct, Retailer, SearchQuery } from '../types/product';

export interface ConnectorResult {
  products: NormalizedProduct[];
  total: number;
  error?: string;
}

export interface Connector {
  name: Retailer;
  search(query: SearchQuery): Promise<ConnectorResult>;
}
