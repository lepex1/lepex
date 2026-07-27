import { authSession } from './_auth.js';
import { hgetall, lrange } from './_db.js';

export default async function handler(req, res) {
  const session = authSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const raw = await lrange('events', 0, 999);
  const commands = await hgetall('stats:commands');
  const sections = await hgetall('stats:sections');
  const categories = await hgetall('stats:categories');
  const ips = await hgetall('stats:ips');

  const ipDetails = {};
  for (const ip of Object.keys(ips)) {
    const detail = await hgetall(`ip:${ip}`);
    if (detail) ipDetails[ip] = detail;
  }

  const events = raw.map(e => { try { return JSON.parse(e); } catch { return null; } }).filter(Boolean);

  const topCommands = Object.entries(commands)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => ({ name, count }));

  const topCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const topSections = Object.entries(sections)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const topIps = Object.entries(ips)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([ip, count]) => ({
      ip,
      count,
      country: ipDetails[ip]?.country || '',
      os: ipDetails[ip]?.os || '',
      device: ipDetails[ip]?.device || '',
      browser: ipDetails[ip]?.browser || '',
    }));

  res.json({
    totalEvents: events.length,
    uniqueIps: Object.keys(ips).length,
    topCommands,
    topCategories,
    topSections,
    topIps,
    recentEvents: events.slice(0, 100).map(e => ({
      ts: e.ts,
      ip: e.ip,
      country: e.country,
      os: e.os,
      device: e.device,
      browser: e.browser,
      command: e.command?.slice(0, 100),
      category: e.category,
      section: e.section,
    })),
  });
}
