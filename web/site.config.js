/**
 * The only place the public origin is written down. Everything that needs it —
 * og:url, og:image, twitter:image, robots.txt, sitemap.xml — is rewritten from
 * here at build time by prerender.js.
 *
 * SITE_URL in Netlify (Site configuration -> Environment variables) wins;
 * the fallback below is the same origin. Nothing else changes.
 */
export const SITE = (process.env.SITE_URL || 'https://ritishsaini.tech')
  .replace(/\/+$/, '')
