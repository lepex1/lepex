export default function handler(req, res) {
  const host = req.headers.host;
  const callbackUrl = `https://${host}/api/stats/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=read:user&redirect_uri=${encodeURIComponent(callbackUrl)}`;
  res.redirect(url);
}
