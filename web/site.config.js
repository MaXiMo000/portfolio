/**
 * The only place the public origin is written down. Everything that needs it —
 * og:url, og:image, twitter:image, robots.txt, sitemap.xml — is rewritten from
 * here at build time by prerender.js.
 *
 * To move to a custom domain: change the fallback below, or set SITE_URL in
 * Netlify (Site configuration -> Environment variables). Nothing else changes.
 */
export const SITE = (process.env.SITE_URL || 'https://ritishsaini.netlify.app')
  .replace(/\/+$/, '')
