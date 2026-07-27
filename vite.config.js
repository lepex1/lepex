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
        { src: "portfolio/**/*", dest: "." },
        { src: "cassie/**/*", dest: "." },
        { src: "gradient-text/**/*", dest: "." },
      ],
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        gradient: "gradient-text/index.html",
      },
    },
  },
});
