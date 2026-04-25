import axios, { AxiosError } from 'axios';
import { createHmac, createHash } from 'crypto';
import { Connector, ConnectorResult } from './base';
import { NormalizedProduct, SearchQuery } from '../types/product';
import { parsePrice, sanitizeUrl } from '../normalizer';
import logger from '../logger';

// --------------------------------------------------------------------------
// Amazon Associates Product Advertising API 5.0 (PAAPI 5.0)
//
// IMPORTANT: Amazon requires 10 qualifying referral sales through your
// Associates account before PAAPI access is granted. Until that threshold
// is met, any API call returns a 401 / "InvalidPartnerTag" error. The
// connector automatically falls back to mock mode when credentials are
// absent. Set AMAZON_MOCK=true to force mock mode during development.
// --------------------------------------------------------------------------

const PAAPI_HOST = process.env.AMAZON_HOST ?? 'webservices.amazon.com';
const PAAPI_REGION = process.env.AMAZON_REGION ?? 'us-east-1';
const PAAPI_PATH = '/paapi5/searchitems';
const PAAPI_URL = `https://${PAAPI_HOST}${PAAPI_PATH}`;
const PAAPI_TARGET = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';
const PAAPI_CONTENT_TYPE = 'application/json; charset=utf-8';

// ---------- PAAPI 5.0 response types ----------

interface PaapiImageVariant {
  URL: string;
  Height: number;
  Width: number;
}

interface PaapiImages {
  Primary?: {
    Large?: PaapiImageVariant;
    Medium?: PaapiImageVariant;
  };
}

interface PaapiDisplayValue<T = string> {
  DisplayValue: T;
  Label?: string;
  Locale?: string;
}

interface PaapiPrice {
  Amount: number;
  Currency: string;
  DisplayAmount: string;
}

interface PaapiListing {
  Price?: PaapiPrice;
  Availability?: { Type: string; Message: string };
  DeliveryInfo?: { IsPrimeEligible: boolean; IsFreeShippingEligible: boolean };
  Condition?: { Value: string };
}

interface PaapiVariationAttribute {
  Name: string;
  Values: string[];
}

interface PaapiItem {
  ASIN: string;
  DetailPageURL?: string;
  Images?: PaapiImages;
  ItemInfo?: {
    Title?: PaapiDisplayValue;
    ByLineInfo?: { Brand?: PaapiDisplayValue };
    Classifications?: { Binding?: PaapiDisplayValue };
  };
  Offers?: {
    Listings?: PaapiListing[];
  };
  CustomerReviews?: {
    Count?: number;
    StarRating?: PaapiDisplayValue<number>;
  };
  VariationAttributes?: PaapiVariationAttribute[];
}

interface PaapiSearchResponse {
  SearchResult?: {
    TotalResultCount?: number;
    Items?: PaapiItem[];
  };
  Errors?: Array<{ Code: string; Message: string }>;
}

// ---------- mock data ----------
// Mirrors the exact PAAPI 5.0 SearchItems response shape.

const MOCK_ITEMS: PaapiItem[] = [
  {
    ASIN: 'B08N5WRWNW',
    DetailPageURL: 'https://www.amazon.com/dp/B08N5WRWNW',
    Images: {
      Primary: {
        Large: { URL: 'https://m.media-amazon.com/images/I/mock-hanes-beefy.jpg', Height: 500, Width: 500 },
      },
    },
    ItemInfo: {
      Title: { DisplayValue: "Hanes Men's Beefy-T Short Sleeve T-Shirt" },
      ByLineInfo: { Brand: { DisplayValue: 'Hanes' } },
    },
    Offers: {
      Listings: [
        {
          Price: { Amount: 9.98, Currency: 'USD', DisplayAmount: '$9.98' },
          Availability: { Type: 'Now', Message: 'In Stock.' },
          DeliveryInfo: { IsPrimeEligible: true, IsFreeShippingEligible: true },
          Condition: { Value: 'New' },
        },
      ],
    },
    CustomerReviews: { Count: 58432, StarRating: { DisplayValue: 4.6 } },
    VariationAttributes: [
      { Name: 'Size', Values: ['S', 'M', 'L', 'XL', '2XL', '3XL'] },
      { Name: 'Color', Values: ['White', 'Black', 'Navy', 'Grey'] },
    ],
  },
  {
    ASIN: 'B07H479KHQ',
    DetailPageURL: 'https://www.amazon.com/dp/B07H479KHQ',
    Images: {
      Primary: {
        Large: { URL: 'https://m.media-amazon.com/images/I/mock-gildan-ultra.jpg', Height: 500, Width: 500 },
      },
    },
    ItemInfo: {
      Title: { DisplayValue: "Gildan Men's Ultra Cotton T-Shirt, Style G2000" },
      ByLineInfo: { Brand: { DisplayValue: 'Gildan' } },
    },
    Offers: {
      Listings: [
        {
          Price: { Amount: 7.22, Currency: 'USD', DisplayAmount: '$7.22' },
          Availability: { Type: 'Now', Message: 'In Stock.' },
          DeliveryInfo: { IsPrimeEligible: true, IsFreeShippingEligible: true },
          Condition: { Value: 'New' },
        },
      ],
    },
    CustomerReviews: { Count: 41287, StarRating: { DisplayValue: 4.5 } },
    VariationAttributes: [
      { Name: 'Size', Values: ['S', 'M', 'L', 'XL', '2XL'] },
      { Name: 'Color', Values: ['White', 'Black', 'Sport Grey', 'Navy'] },
    ],
  },
  {
    ASIN: 'B0B2NPDQWT',
    DetailPageURL: 'https://www.amazon.com/dp/B0B2NPDQWT',
    Images: {
      Primary: {
        Large: { URL: 'https://m.media-amazon.com/images/I/mock-amazon-essentials.jpg', Height: 500, Width: 500 },
      },
    },
    ItemInfo: {
      Title: { DisplayValue: 'Amazon Essentials Men\'s Slim-Fit Short-Sleeve Crewneck T-Shirt' },
      ByLineInfo: { Brand: { DisplayValue: 'Amazon Essentials' } },
    },
    Offers: {
      Listings: [
        {
          Price: { Amount: 13.40, Currency: 'USD', DisplayAmount: '$13.40' },
          Availability: { Type: 'Now', Message: 'In Stock.' },
          DeliveryInfo: { IsPrimeEligible: true, IsFreeShippingEligible: true },
          Condition: { Value: 'New' },
        },
      ],
    },
    CustomerReviews: { Count: 22819, StarRating: { DisplayValue: 4.4 } },
    VariationAttributes: [
      { Name: 'Size', Values: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'] },
      { Name: 'Color', Values: ['Black', 'White', 'Grey', 'Olive', 'Navy', 'Red'] },
    ],
  },
  {
    ASIN: 'B07B3XSCMK',
    DetailPageURL: 'https://www.amazon.com/dp/B07B3XSCMK',
    Images: {
      Primary: {
        Large: { URL: 'https://m.media-amazon.com/images/I/mock-fruit-loom.jpg', Height: 500, Width: 500 },
      },
    },
    ItemInfo: {
      Title: { DisplayValue: "Fruit of the Loom Men's Eversoft Cotton Stay Tucked Crew T-Shirt" },
      ByLineInfo: { Brand: { DisplayValue: 'Fruit of the Loom' } },
    },
    Offers: {
      Listings: [
        {
          Price: { Amount: 8.10, Currency: 'USD', DisplayAmount: '$8.10' },
          Availability: { Type: 'Now', Message: 'In Stock.' },
          DeliveryInfo: { IsPrimeEligible: true, IsFreeShippingEligible: false },
          Condition: { Value: 'New' },
        },
      ],
    },
    CustomerReviews: { Count: 18204, StarRating: { DisplayValue: 4.5 } },
    VariationAttributes: [
      { Name: 'Size', Values: ['S', 'M', 'L', 'XL', '2XL', '3XL'] },
      { Name: 'Color', Values: ['White', 'Black', 'Heather Grey'] },
    ],
  },
  {
    ASIN: 'B07KC5MFXH',
    DetailPageURL: 'https://www.amazon.com/dp/B07KC5MFXH',
    Images: {
      Primary: {
        Large: { URL: 'https://m.media-amazon.com/images/I/mock-carhartt-tee.jpg', Height: 500, Width: 500 },
      },
    },
    ItemInfo: {
      Title: { DisplayValue: "Carhartt Men's Force Flex Short Sleeve T-Shirt" },
      ByLineInfo: { Brand: { DisplayValue: 'Carhartt' } },
    },
    Offers: {
      Listings: [
        {
          Price: { Amount: 29.99, Currency: 'USD', DisplayAmount: '$29.99' },
          Availability: { Type: 'Now', Message: 'In Stock.' },
          DeliveryInfo: { IsPrimeEligible: true, IsFreeShippingEligible: true },
          Condition: { Value: 'New' },
        },
      ],
    },
    CustomerReviews: { Count: 9341, StarRating: { DisplayValue: 4.7 } },
    VariationAttributes: [
      { Name: 'Size', Values: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] },
      { Name: 'Color', Values: ['Black', 'Heather Grey', 'Navy', 'Dark Brown'] },
    ],
  },
  {
    ASIN: 'B078HMGCQ2',
    DetailPageURL: 'https://www.amazon.com/dp/B078HMGCQ2',
    Images: {
      Primary: {
        Large: { URL: 'https://m.media-amazon.com/images/I/mock-bella-canvas.jpg', Height: 500, Width: 500 },
      },
    },
    ItemInfo: {
      Title: { DisplayValue: "Bella + Canvas Unisex Jersey Short Sleeve V-Neck T-Shirt" },
      ByLineInfo: { Brand: { DisplayValue: 'Bella + Canvas' } },
    },
    Offers: {
      Listings: [
        {
          Price: { Amount: 15.75, Currency: 'USD', DisplayAmount: '$15.75' },
          Availability: { Type: 'Now', Message: 'In Stock.' },
          DeliveryInfo: { IsPrimeEligible: false, IsFreeShippingEligible: false },
          Condition: { Value: 'New' },
        },
      ],
    },
    CustomerReviews: { Count: 5102, StarRating: { DisplayValue: 4.3 } },
    VariationAttributes: [
      { Name: 'Size', Values: ['XS', 'S', 'M', 'L', 'XL', '2XL'] },
      { Name: 'Color', Values: ['White', 'Black', 'Heather Deep Teal', 'Soft Cream'] },
    ],
  },
];

function applyMockFilters(items: PaapiItem[], query: SearchQuery): PaapiItem[] {
  const q = query.query.toLowerCase();
  let filtered = items.filter((item) =>
    item.ItemInfo?.Title?.DisplayValue.toLowerCase().includes(q) ||
    item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue.toLowerCase().includes(q) ||
    q.includes('shirt') || q.includes('tee') || q.includes('t-shirt')
  );

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filtered = filtered.filter((item) => {
      const price = item.Offers?.Listings?.[0]?.Price?.Amount ?? 0;
      if (query.minPrice !== undefined && price < query.minPrice) return false;
      if (query.maxPrice !== undefined && price > query.maxPrice) return false;
      return true;
    });
  }

  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  return filtered.slice((page - 1) * limit, page * limit);
}

// ---------- mapping ----------

function mapItem(item: PaapiItem, partnerTag: string): NormalizedProduct {
  const listing = item.Offers?.Listings?.[0];
  const price = parsePrice(listing?.Price?.Amount);
  const currency = listing?.Price?.Currency ?? 'USD';
  const imageUrl = sanitizeUrl(item.Images?.Primary?.Large?.URL);
  const productUrl = sanitizeUrl(item.DetailPageURL) ?? `https://www.amazon.com/dp/${item.ASIN}`;
  const affiliateUrl = partnerTag
    ? `https://www.amazon.com/dp/${item.ASIN}?tag=${partnerTag}`
    : null;

  const rating = item.CustomerReviews?.StarRating?.DisplayValue ?? null;
  const reviewCount = item.CustomerReviews?.Count ?? null;
  const inStock = (listing?.Availability?.Type ?? '') === 'Now';

  const varAttrs = item.VariationAttributes ?? [];
  const sizes = varAttrs.find((a) => a.Name === 'Size')?.Values ?? [];
  const colors = varAttrs.find((a) => a.Name === 'Color')?.Values ?? [];

  return {
    id: item.ASIN,
    retailer: 'amazon',
    title: item.ItemInfo?.Title?.DisplayValue ?? item.ASIN,
    price,
    currency,
    imageUrl,
    productUrl,
    affiliateUrl,
    rating: rating !== null ? Number(rating) : null,
    reviewCount,
    inStock,
    freeShipping: listing?.DeliveryInfo?.IsFreeShippingEligible ?? false,
    sizes,
    colors,
  };
}

// ---------- AWS SigV4 (ready for real credentials) ----------

function sha256hex(data: string): string {
  return createHash('sha256').update(data, 'utf8').digest('hex');
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data, 'utf8').digest();
}

function buildSigV4Headers(
  accessKey: string,
  secretKey: string,
  partnerTag: string,
  payload: string
): Record<string, string> {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '');
  const dateStamp = amzDate.slice(0, 8);

  const payloadHash = sha256hex(payload);

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:${PAAPI_CONTENT_TYPE}\n` +
    `host:${PAAPI_HOST}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${PAAPI_TARGET}\n`;

  const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';

  const canonicalRequest = [
    'POST',
    PAAPI_PATH,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/${PAAPI_REGION}/ProductAdvertisingAPI/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256hex(canonicalRequest),
  ].join('\n');

  const signingKey = hmacSha256(
    hmacSha256(
      hmacSha256(
        hmacSha256(Buffer.from(`AWS4${secretKey}`, 'utf8'), dateStamp),
        PAAPI_REGION
      ),
      'ProductAdvertisingAPI'
    ),
    'aws4_request'
  );

  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  return {
    'Content-Encoding': 'amz-1.0',
    'Content-Type': PAAPI_CONTENT_TYPE,
    'Host': PAAPI_HOST,
    'X-Amz-Date': amzDate,
    'X-Amz-Target': PAAPI_TARGET,
    'Authorization': `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
}

// ---------- connector ----------

export class AmazonConnector implements Connector {
  readonly name = 'amazon';

  private accessKey: string;
  private secretKey: string;
  private partnerTag: string;
  private useMock: boolean;

  constructor() {
    this.accessKey = process.env.AMAZON_ACCESS_KEY ?? '';
    this.secretKey = process.env.AMAZON_SECRET_KEY ?? '';
    this.partnerTag = process.env.AMAZON_PARTNER_TAG ?? '';
    this.useMock =
      process.env.AMAZON_MOCK === 'true' ||
      !this.accessKey ||
      !this.secretKey ||
      !this.partnerTag;
  }

  async search(query: SearchQuery): Promise<ConnectorResult> {
    if (this.useMock) {
      return this.searchMock(query);
    }
    return this.searchLive(query);
  }

  private searchMock(query: SearchQuery): ConnectorResult {
    logger.debug('AmazonConnector.searchMock', { query: query.query });
    const items = applyMockFilters(MOCK_ITEMS, query);
    const products = items.map((item) => mapItem(item, this.partnerTag));
    return { products, total: MOCK_ITEMS.length };
  }

  private async searchLive(query: SearchQuery): Promise<ConnectorResult> {
    const limit = Math.min(query.limit ?? 10, 10); // PAAPI max is 10 per request
    const payload = JSON.stringify({
      Keywords: query.query,
      SearchIndex: 'Fashion',
      PartnerTag: this.partnerTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com',
      ItemPage: query.page ?? 1,
      ItemCount: limit,
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'ItemInfo.ByLineInfo',
        'Offers.Listings.Price',
        'Offers.Listings.Availability.Type',
        'Offers.Listings.DeliveryInfo.IsPrimeEligible',
        'Offers.Listings.Condition',
        'CustomerReviews.Count',
        'CustomerReviews.StarRating',
        'VariationSummary.Price.HighestPrice',
        'VariationSummary.Price.LowestPrice',
      ],
      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? {
            MinPrice: query.minPrice !== undefined ? Math.round(query.minPrice * 100) : undefined,
            MaxPrice: query.maxPrice !== undefined ? Math.round(query.maxPrice * 100) : undefined,
          }
        : {}),
    });

    const headers = buildSigV4Headers(this.accessKey, this.secretKey, this.partnerTag, payload);

    logger.debug('AmazonConnector.searchLive', { query: query.query, page: query.page ?? 1 });

    try {
      const { data } = await axios.post<PaapiSearchResponse>(PAAPI_URL, payload, {
        headers,
        timeout: 10000,
      });

      if (data.Errors?.length) {
        const msg = data.Errors.map((e) => `${e.Code}: ${e.Message}`).join('; ');
        logger.error('AmazonConnector: PAAPI returned errors', { errors: data.Errors });
        return { products: [], total: 0, error: `Amazon PAAPI error — ${msg}` };
      }

      const items = data.SearchResult?.Items ?? [];
      const products = items.map((item) => mapItem(item, this.partnerTag));
      const total = data.SearchResult?.TotalResultCount ?? products.length;

      return { products, total };
    } catch (err) {
      const axiosErr = err as AxiosError;
      const status = axiosErr.response?.status;
      const detail = axiosErr.response?.data ?? axiosErr.message;
      logger.error('AmazonConnector: search failed', { status, detail });
      return {
        products: [],
        total: 0,
        error: `Amazon API error ${status ?? 'network'}: ${JSON.stringify(detail)}`,
      };
    }
  }
}
