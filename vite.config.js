import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src/pwa",
      filename: "sw.js",
      registerType: "prompt",
      injectRegister: false,
      manifest: {
        name: "Gimpro beta",
        short_name: "Gimpro",
        description: "Entrenamiento deliberado para improvisación teatral.",
        theme_color: "#111827",
        background_color: "#f8fafc",
        display: "standalone",
        start_url: "./#/home",
        scope: "./",
        lang: "es",
        icons: [
          {
            src: "icons/gimpro.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,json}"]
      },
      devOptions: {
        enabled: true,
        type: "module"
      }
    })
  ],
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.js"]
  }
});
