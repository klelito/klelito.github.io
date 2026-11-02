import type { APIRoute } from 'astro';
import { SITE } from '../config/site';

// Generated (not a static file) so the sitemap URL follows SITE.url.
export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', SITE.url).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
