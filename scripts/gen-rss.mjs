import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://lepex.vercel.app';

const esc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
const rfc822 = (dateOnly) => new Date(`${dateOnly}T12:00:00Z`).toUTCString();

const projects = JSON.parse(readFileSync('portfolio/data/projects.json', 'utf8'));
const { works } = JSON.parse(readFileSync('portfolio/subtitles/data/works.json', 'utf8'));

const projectItems = projects.map((p) => ({
    title: p.title,
    link: `${SITE}${p.link}`,
    description: p.desc,
    category: 'Project',
    date: p.date,
    guid: `${SITE}${p.link}`,
    isPermalink: true,
}));

const workItems = works.map((w) => ({
    title: `${w.title} (subtitles)`,
    link: w.link,
    description: `Russian subtitles for ${w.title} by ${w.author}`,
    category: 'Subtitles',
    date: w.date,
    guid: `subtitle-${String(w.title).toLowerCase().replace(/\s+/g, '-')}`,
    isPermalink: false,
}));

const all = [...projectItems, ...workItems]
    .filter((i) => i.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

const itemsXml = all.map((i) => `    <item>
      <title>${esc(i.title)}</title>
      <link>${esc(i.link)}</link>
      <description>${esc(i.description)}</description>
      <category>${i.category}</category>
      <pubDate>${rfc822(i.date)}</pubDate>
      <guid isPermaLink="${i.isPermalink}">${esc(i.guid)}</guid>
    </item>`).join('\n\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>lepex — Projects &amp; Subtitles</title>
    <link>${SITE}</link>
    <description>Latest projects and subtitle works by lepex</description>
    <language>en</language>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>

${itemsXml}
  </channel>
</rss>
`;

writeFileSync('rss.xml', xml);
console.log(`rss.xml generated: ${all.length} items`);
