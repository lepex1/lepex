import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  appType: "mpa",
  plugins: [
    viteStaticCopy({
      targets: [
        { src: "css/*", dest: "." },
        { src: "js/*", dest: ".", ignore: ["js/m3e-setup.js"] },
        { src: "images/*", dest: "." },
        { src: "fonts/*", dest: "." },
        { src: "favicon/*", dest: "." },
        { src: "assets/**/*", dest: "." },
        { src: "sw.js", dest: "." },
        { src: "portfolio/**/*", dest: ".", ignore: ["portfolio/index.html"] },
      ],
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        portfolio: "portfolio/index.html",
      },
    },
  },
});
