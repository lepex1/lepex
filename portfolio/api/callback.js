export default async function handler(req, res) {
  const { code } = req.query;
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();

  const content = `
    <script>
      const receiveMessage = (message) => {
        if (message.data === "authorizing:github") {
          window.opener.postMessage(
            'authorization:github:success:${JSON.stringify({
              token: data.access_token,
              provider: 'github',
            })}',
            message.origin
          );
        }
      };
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "https://lepex.vercel.app");
    </script>
  `;
  res.send(content);
}