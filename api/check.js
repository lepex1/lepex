import { authSession } from './_auth.js';

export default function handler(req, res) {
  const session = authSession(req);
  if (!session) {
    return res.status(401).json({ authenticated: false });
  }
  res.json({ authenticated: true, user: { login: session.login, avatar_url: session.avatar_url } });
}
