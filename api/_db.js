import Redis from 'ioredis';

let client = null;

async function getClient() {
  if (client) return client;
  if (!process.env.REDIS_URL) return null;
  client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
    enableReadyCheck: false,
    lazyConnect: true,
  });
  try {
    await client.connect();
  } catch {
    client = null;
  }
  return client;
}

export { getClient };

export async function hgetall(key) {
  const c = await getClient();
  if (!c) return {};
  try { return await c.hgetall(key) || {}; } catch { return {}; }
}

export async function hincrby(key, field, inc) {
  const c = await getClient();
  if (!c) return;
  try { await c.hincrby(key, field, inc); } catch {}
}

export async function hset(key, data) {
  const c = await getClient();
  if (!c) return;
  try { await c.hset(key, data); } catch {}
}

export async function lpush(key, value) {
  const c = await getClient();
  if (!c) return;
  try { await c.lpush(key, value); } catch {}
}

export async function ltrim(key, start, stop) {
  const c = await getClient();
  if (!c) return;
  try { await c.ltrim(key, start, stop); } catch {}
}

export async function lrange(key, start, stop) {
  const c = await getClient();
  if (!c) return [];
  try { return await c.lrange(key, start, stop) || []; } catch { return []; }
}
