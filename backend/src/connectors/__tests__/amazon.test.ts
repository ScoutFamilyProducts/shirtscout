import { buildAmazonSearchUrl } from '../amazon';

describe('buildAmazonSearchUrl', () => {
  it('produces a well-formed Amazon search URL', () => {
    const url = buildAmazonSearchUrl('funny cat shirt');
    expect(url).toMatch(/^https:\/\/www\.amazon\.com\/s\?/);
  });

  it('URL-encodes spaces as + and preserves special characters', () => {
    const url = buildAmazonSearchUrl('vintage band tee');
    expect(url).toContain('k=vintage+band+tee');

    const urlSpecial = buildAmazonSearchUrl("men's t-shirt & polo");
    const parsed = new URL(urlSpecial);
    expect(parsed.searchParams.get('k')).toBe("men's t-shirt & polo");
  });

  it('always appends the affiliate tag when provided', () => {
    const url = buildAmazonSearchUrl('gaming shirt', 'shirtscout-20');
    expect(url).toContain('tag=shirtscout-20');
  });

  it('omits the tag param when partnerTag is not provided', () => {
    const url = buildAmazonSearchUrl('gaming shirt');
    expect(url).not.toContain('tag=');
  });

  it('omits the tag param when partnerTag is empty string', () => {
    const url = buildAmazonSearchUrl('gaming shirt', '');
    expect(url).not.toContain('tag=');
  });
});
