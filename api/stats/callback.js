import { sign } from '../_auth.js';

export default async function handler(req, res) {
  const { code, error: oauthError } = req.query;

  if (oauthError || !code) {
    const reason = oauthError || 'no_code';
    res.writeHead(302, { Location: `/cassie/stats?error=${reason}` });
    res.end();
    return;
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    res.writeHead(302, { Location: '/cassie/stats?error=token_failed' });
    res.end();
    return;
  }

  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!userRes.ok) {
    res.writeHead(302, { Location: '/cassie/stats?error=user_fetch_failed' });
    res.end();
    return;
  }

  const user = await userRes.json();
  const owner = process.env.GITHUB_REPO_OWNER || 'lepex1';

  if (user.login !== owner) {
    res.writeHead(302, { Location: '/cassie/stats?error=not_owner' });
    res.end();
    return;
  }

  const payload = { login: user.login, avatar_url: user.avatar_url, loggedInAt: Date.now() };
  const cookie = sign(payload, process.env.GITHUB_CLIENT_SECRET);

  res.setHeader('Set-Cookie', `stats_session=${cookie}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; Secure`);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200);
  res.end(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Redirecting...</title></head>
<body><script>location.href='/cassie/stats'</script></body></html>`);
}
