import path from "path"
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vue from '@vitejs/plugin-vue'
import {viteDataPlugin} from "./src/data/viteDataPlugin"
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    viteDataPlugin(), 
    visualizer({
      emitFile: true, 
      filename: "stats-treemap.html",
      template: "treemap"
    }),
    visualizer({
      emitFile: true, 
      filename: "stats-network.html",
      template: "network"
    }),
    visualizer({
      emitFile: true, 
      filename: "stats-sunburst.html",
      template: "sunburst"
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png'],
      manifest: 
        {
        "short_name": "Freestyle",
        "name": "Highline Freestyle",
        "icons": [
          {
            "src": "favicon.ico",
            "type": "image/x-icon"
          },
          {
            "src": "logo192.png",
            "type": "image/png",
            "sizes": "192x192"
          },
          {
            "src": "logo512.png",
            "type": "image/png",
            "sizes": "512x512"
          }
        ],
        "start_url": ".",
        "display": "standalone",
        "theme_color": "#000000",
        "background_color": "#ffffff",
        "orientation": "portrait-primary"
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
