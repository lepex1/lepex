export default function handler(req, res) {
  res.setHeader('Set-Cookie', 'stats_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure');
  res.writeHead(302, { Location: '/cassie/stats' });
  res.end();
}
