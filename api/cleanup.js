import { lrange, getClient } from './_db.js';

export default async function handler(req, res) {
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const client = await getClient();
  if (!client) {
    return res.json({ removed: 0, note: 'Redis not connected' });
  }

  const cutoff = Date.now() - 30 * 86400 * 1000;
  const raw = await lrange('events', 0, -1);
  let removed = 0;

  for (const entry of raw) {
    try {
      const ev = JSON.parse(entry);
      if (ev.ts < cutoff) {
        await client.lrem('events', 1, entry);
        removed++;
      }
    } catch {}
  }

  res.json({ removed });
}
