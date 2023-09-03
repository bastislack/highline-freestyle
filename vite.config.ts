import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {viteDataPlugin} from "./src/data/viteDataPlugin"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), viteDataPlugin()],
})
