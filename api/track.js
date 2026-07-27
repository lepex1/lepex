import { hincrby, hset, lpush, ltrim } from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { command, section, category } = req.body || {};
  if (!command) {
    return res.status(400).json({ error: 'Missing command' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown';

  const country = req.headers['x-vercel-ip-country'] || '';
  const ua = req.headers['user-agent'] || '';

  const os = ua.match(/\(([^)]+)\)/)?.[1] || 'unknown';
  const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop';
  const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/)?.[1] || 'unknown';

  const event = {
    ts: Date.now(),
    ip,
    country,
    os,
    device,
    browser,
    command: command.slice(0, 200),
    section: section || '',
    category: category || '',
  };

  await lpush('events', JSON.stringify(event));
  await ltrim('events', 0, 4999);
  await hincrby('stats:commands', event.command, 1);
  await hincrby('stats:sections', event.section, 1);
  await hincrby('stats:categories', event.category, 1);
  await hincrby('stats:ips', event.ip, 1);
  await hset(`ip:${event.ip}`, { country, os, device, browser });

  res.json({ ok: true });
}
