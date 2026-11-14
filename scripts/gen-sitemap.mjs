import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://lepex.vercel.app';

const projects = JSON.parse(readFileSync('portfolio/data/projects.json', 'utf8'));
const misc = JSON.parse(readFileSync('portfolio/misc/data/misc.json', 'utf8'));

// Sitemap covers the indexable pages only: 404.html carries noindex.
// vercel.json sets trailingSlash: true, so every URL is emitted with a trailing slash.
const sitemapPaths = [
    '/',
    '/portfolio/',
    ...projects.map((p) => p.link),
    ...misc.map((m) => m.link),
].map((p) => (p.endsWith('/') ? p : `${p}/`));

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPaths.map((p) => `  <url>
    <loc>${SITE}${p}</loc>
  </url>`).join('\n')}
</urlset>
`;

writeFileSync('sitemap.xml', sitemapXml);
console.log(`sitemap.xml generated: ${sitemapPaths.length} urls`);
