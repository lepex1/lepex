import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  appType: "mpa",
  plugins: [
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
        { src: "offline.html", dest: "." },
        { src: "manifest.json", dest: "." },
        { src: "rss.xml", dest: "." },
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
