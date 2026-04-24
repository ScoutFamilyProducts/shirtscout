import { NormalizedProduct, SearchQuery } from '../types/product';

export interface ConnectorResult {
  products: NormalizedProduct[];
  total: number;
  error?: string;
}

export interface Connector {
  name: string;
  search(query: SearchQuery): Promise<ConnectorResult>;
}
