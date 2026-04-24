/**
 * Smoke test — runs without any .env credentials.
 * Spins the Express app on an ephemeral port, exercises every surface,
 * then validates shapes against NormalizedProduct / SearchResults contracts.
 *
 * Exit 0 = all passed. Exit 1 = one or more failures.
 */
import 'dotenv/config';
import http from 'http';
import axios, { AxiosError } from 'axios';
import { WalmartConnector } from '../src/connectors/walmart';
import { EbayConnector } from '../src/connectors/ebay';
import { AmazonConnector } from '../src/connectors/amazon';
import { NormalizedProduct, SearchResults } from '../src/types/product';
import app from '../src/app';

// ---------- tiny test harness ----------

let passed = 0;
let failed = 0;

function pass(label: string) {
  console.log(`  [PASS] ${label}`);
  passed++;
}

function fail(label: string, reason?: unknown) {
  console.error(`  [FAIL] ${label}${reason !== undefined ? ` — ${reason}` : ''}`);
  failed++;
}

function section(title: string) {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
}

function assert(condition: boolean, label: string, detail?: unknown) {
  condition ? pass(label) : fail(label, detail);
}

// ---------- shape validators ----------

const PRODUCT_FIELDS: (keyof NormalizedProduct)[] = [
  'id', 'retailer', 'title', 'price', 'currency',
  'imageUrl', 'productUrl', 'affiliateUrl',
  'rating', 'reviewCount', 'inStock', 'sizes', 'colors',
];

function validateProduct(p: unknown, label: string): boolean {
  if (typeof p !== 'object' || p === null) {
    fail(`${label}: not an object`);
    return false;
  }
  let ok = true;
  for (const field of PRODUCT_FIELDS) {
    if (!(field in p)) {
      fail(`${label}: missing field "${field}"`);
      ok = false;
    }
  }
  const prod = p as NormalizedProduct;
  if (typeof prod.price !== 'number' || prod.price < 0) {
    fail(`${label}: price must be a non-negative number, got ${prod.price}`);
    ok = false;
  }
  if (!['walmart', 'ebay', 'amazon'].includes(prod.retailer)) {
    fail(`${label}: unknown retailer "${prod.retailer}"`);
    ok = false;
  }
  if (!Array.isArray(prod.sizes))  { fail(`${label}: sizes must be array`);  ok = false; }
  if (!Array.isArray(prod.colors)) { fail(`${label}: colors must be array`); ok = false; }
  if (ok) pass(label);
  return ok;
}

function validateSearchResults(data: unknown, label: string) {
  if (typeof data !== 'object' || data === null) { fail(`${label}: not an object`); return; }
  const r = data as SearchResults;
  assert(Array.isArray(r.results),       `${label}: results is array`);
  assert(typeof r.totalResults === 'number', `${label}: totalResults is number`);
  assert(typeof r.page === 'number',     `${label}: page is number`);
  assert(typeof r.limit === 'number',    `${label}: limit is number`);
  assert(typeof r.retailers === 'object' && r.retailers !== null, `${label}: retailers object present`);
}

// ---------- 1. connector unit tests ----------

async function testConnectors() {
  section('1. Connector unit tests (no HTTP)');

  const query = { query: 't-shirt', page: 1, limit: 10 };

  // Amazon (mock mode — no credentials required)
  const amazon = new AmazonConnector();
  const ar = await amazon.search(query);
  assert(!ar.error, 'Amazon: no error in mock mode', ar.error);
  assert(ar.products.length > 0, `Amazon: mock returns products (got ${ar.products.length})`);
  assert(ar.total > 0, `Amazon: total > 0 (got ${ar.total})`);
  if (ar.products.length > 0) {
    validateProduct(ar.products[0], 'Amazon: first product shape');
    assert(ar.products[0].retailer === 'amazon', 'Amazon: retailer field is "amazon"');
    assert(typeof ar.products[0].rating === 'number', 'Amazon: rating is number in mock');
  }

  // Price filter in mock mode
  const priceFiltered = await amazon.search({ ...query, minPrice: 10, maxPrice: 20 });
  const outOfRange = priceFiltered.products.filter((p) => p.price < 10 || p.price > 20);
  assert(outOfRange.length === 0, `Amazon: minPrice/maxPrice filter respected (${priceFiltered.products.length} results)`);

  // Walmart (no credentials → structured error, no crash)
  const walmart = new WalmartConnector();
  const wr = await walmart.search(query);
  assert(typeof wr.error === 'string', 'Walmart: returns string error when unconfigured');
  assert(wr.products.length === 0,     'Walmart: returns empty products when unconfigured');

  // eBay (no credentials → structured error, no crash)
  const ebay = new EbayConnector();
  const er = await ebay.search(query);
  assert(typeof er.error === 'string', 'eBay: returns string error when unconfigured');
  assert(er.products.length === 0,     'eBay: returns empty products when unconfigured');
}

// ---------- 2. HTTP endpoint tests ----------

async function testHttpEndpoints(baseUrl: string) {
  section('2. HTTP endpoint tests');

  // GET /health
  try {
    const { status, data } = await axios.get(`${baseUrl}/health`);
    assert(status === 200,              'GET /health: status 200');
    assert(data.status === 'ok',        'GET /health: body.status = "ok"');
    assert(typeof data.timestamp === 'string', 'GET /health: timestamp present');
  } catch (e) {
    fail('GET /health', e);
  }

  // GET /api/search — missing q
  try {
    await axios.get(`${baseUrl}/api/search`);
    fail('GET /api/search (no q): expected 400 but got 2xx');
  } catch (e) {
    const status = (e as AxiosError).response?.status;
    assert(status === 400, `GET /api/search (no q): returns 400 (got ${status})`);
  }

  // GET /api/search — empty q
  try {
    await axios.get(`${baseUrl}/api/search?q=`);
    fail('GET /api/search (empty q): expected 400 but got 2xx');
  } catch (e) {
    const status = (e as AxiosError).response?.status;
    assert(status === 400, `GET /api/search (empty q): returns 400 (got ${status})`);
  }

  // GET /api/search?q=t-shirt — happy path
  try {
    const { status, data } = await axios.get<SearchResults>(`${baseUrl}/api/search?q=t-shirt`);
    assert(status === 200, 'GET /api/search?q=t-shirt: status 200');
    validateSearchResults(data, 'GET /api/search?q=t-shirt');

    // Amazon mock results should appear
    const amazonProducts = data.results.filter((p) => p.retailer === 'amazon');
    assert(amazonProducts.length > 0, `Search: Amazon mock results in response (${amazonProducts.length} items)`);

    // All products pass shape validation
    let shapeOk = true;
    for (const p of data.results) {
      if (!validateProduct(p, `Product ${p.id} (${p.retailer})`)) shapeOk = false;
    }
    if (data.results.length > 0 && shapeOk) pass('All returned products pass shape validation');

    // Retailers stat block
    const retailers = data.retailers as Record<string, { count: number; error?: string }>;
    assert('amazon' in retailers,  'retailers block: amazon key present');
    assert('walmart' in retailers, 'retailers block: walmart key present');
    assert('ebay' in retailers,    'retailers block: ebay key present');
    assert(typeof retailers.walmart?.error === 'string', 'retailers.walmart: error string present (no credentials)');
    assert(typeof retailers.ebay?.error === 'string',    'retailers.ebay: error string present (no credentials)');

    // Sort order: results sorted ascending by price
    const prices = data.results.map((p) => p.price);
    const sorted = [...prices].sort((a, b) => a - b);
    assert(
      JSON.stringify(prices) === JSON.stringify(sorted),
      'Search results sorted ascending by price'
    );
  } catch (e) {
    if ((e as AxiosError).response) fail('GET /api/search?q=t-shirt', (e as AxiosError).response?.data);
    else fail('GET /api/search?q=t-shirt', e);
  }

  // GET /api/search — price filter forwarded to connectors
  try {
    const { data } = await axios.get<SearchResults>(`${baseUrl}/api/search?q=t-shirt&minPrice=10&maxPrice=20`);
    const outOfRange = data.results.filter((p) => p.price < 10 || p.price > 20);
    assert(outOfRange.length === 0, `Price filter: no results outside $10–$20 (${data.results.length} results)`);
  } catch (e) {
    fail('GET /api/search price filter', e);
  }

  // GET /api/search — retailers filter (amazon only)
  try {
    const { data } = await axios.get<SearchResults>(`${baseUrl}/api/search?q=t-shirt&retailers=amazon`);
    const nonAmazon = data.results.filter((p) => p.retailer !== 'amazon');
    assert(nonAmazon.length === 0, 'retailers=amazon filter: only Amazon results returned');
    assert(!('walmart' in data.retailers), 'retailers=amazon filter: walmart not in stats block');
    assert(!('ebay' in data.retailers),    'retailers=amazon filter: ebay not in stats block');
  } catch (e) {
    fail('GET /api/search retailers filter', e);
  }

  // GET /api/redirect — missing url
  try {
    await axios.get(`${baseUrl}/api/redirect`);
    fail('GET /api/redirect (no url): expected 400');
  } catch (e) {
    const status = (e as AxiosError).response?.status;
    assert(status === 400, `GET /api/redirect (no url): returns 400 (got ${status})`);
  }

  // GET /api/redirect — disallowed host
  try {
    await axios.get(`${baseUrl}/api/redirect?url=https://evil.example.com/steal`, {
      maxRedirects: 0,
    });
    fail('GET /api/redirect (bad host): expected 403');
  } catch (e) {
    const status = (e as AxiosError).response?.status;
    assert(status === 403, `GET /api/redirect (bad host): returns 403 (got ${status})`);
  }

  // GET /api/redirect — allowed host (should 302, axios follows by default so we disable it)
  try {
    await axios.get(`${baseUrl}/api/redirect?url=https://www.amazon.com/dp/B08N5WRWNW`, {
      maxRedirects: 0,
      validateStatus: (s) => s === 302,
    });
    pass('GET /api/redirect (amazon url): returns 302');
  } catch (e) {
    fail('GET /api/redirect (amazon url)', (e as AxiosError).response?.status ?? e);
  }

  // Cache: second identical request should be served from cache (still 200)
  try {
    const { status } = await axios.get(`${baseUrl}/api/search?q=t-shirt`);
    assert(status === 200, 'Cache: second request still returns 200');
  } catch (e) {
    fail('Cache: second request', e);
  }
}

// ---------- main ----------

async function main() {
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${addr.port}`;
  console.log(`\nServer listening on ${baseUrl}`);

  try {
    await testConnectors();
    await testHttpEndpoints(baseUrl);
  } finally {
    server.close();
  }

  section('Results');
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);

  if (failed > 0) {
    console.error(`\n${failed} test(s) failed.`);
    process.exit(1);
  } else {
    console.log(`\nAll ${passed} tests passed.`);
  }
}

main().catch((err) => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});
