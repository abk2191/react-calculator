import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto", // auto-injects the SW register script
      manifest: {
        name: "Calculator",
        short_name: "Calculator",
        start_url: ".", // see Step 7 for GitHub Pages
        scope: ".", // see Step 7 for GitHub Pages
        display: "fullscreen", // removes browser UI/URL bar when installed
        background_color: "#000000",
        theme_color: "#000000",
        icons: [
          {
            src: "/android-icon-192x192-maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/android-icon-512x512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // sensible defaults: caches your build assets & basic navigation
      },
    }),
  ],
  base: "/react-calculator/",
});
