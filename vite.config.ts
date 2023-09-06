import { defineConfig } from 'vite'
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
    })
  ],
})
