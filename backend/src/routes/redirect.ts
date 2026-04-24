import { Router, Request, Response } from 'express';
import logger from '../logger';

const router = Router();

// Proxies outbound affiliate/product links so the mobile client never
// constructs retailer URLs directly. Allows future click tracking.
router.get('/', (req: Request, res: Response) => {
  const { url } = req.query as { url?: string };

  if (!url) {
    res.status(400).json({ error: 'Missing required query parameter: url' });
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    res.status(400).json({ error: 'Invalid URL' });
    return;
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    res.status(400).json({ error: 'Only http/https URLs are allowed' });
    return;
  }

  const allowedHosts = [
    'walmart.com', 'www.walmart.com',
    'ebay.com', 'www.ebay.com',
    'amazon.com', 'www.amazon.com', 'amzn.to',
  ];

  const host = parsed.hostname.toLowerCase();
  if (!allowedHosts.some((h) => host === h || host.endsWith(`.${h}`))) {
    res.status(403).json({ error: 'Host not in allowlist' });
    return;
  }

  logger.info('redirect', { url: parsed.toString() });
  res.redirect(302, parsed.toString());
});

export default router;
