import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// Mirrors vercel.json "trailingSlash": true, which only the Vercel host applies.
const trailingSlash = () => (req, res, next) => {
  const [path, query] = req.url.split("?");
  if (path.endsWith("/") || /\.[^/]+$/.test(path)) return next();
  res.writeHead(308, { Location: `${path}/${query ? `?${query}` : ""}` });
  res.end();
};

export default defineConfig({
  appType: "mpa",
  plugins: [
    {
      name: "trailing-slash",
      configureServer(server) {
        server.middlewares.use(trailingSlash());
      },
      configurePreviewServer(server) {
        server.middlewares.use(trailingSlash());
      },
    },
    viteStaticCopy({
      targets: [
        { src: "css/*", dest: "." },
        { src: "js/*", dest: "." },
        { src: "images/*", dest: "." },
        { src: "fonts/*", dest: "." },
        { src: "favicon/*", dest: "." },
        { src: "assets/**/*", dest: "." },
        { src: "sw.js", dest: "." },
        { src: "404.html", dest: "." },
        { src: "robots.txt", dest: "." },
        { src: "sitemap.xml", dest: "." },
        { src: "portfolio/**/*", dest: "." },
      ],
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        gradient: "portfolio/gradient-text/index.html",
      },
    },
  },
});
