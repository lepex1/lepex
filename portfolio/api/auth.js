export default function handler(req, res) {
  const { host } = req.headers;
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,user&redirect_uri=https://${host}/api/callback`;
  res.redirect(url);
}