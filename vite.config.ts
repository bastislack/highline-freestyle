import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {VitePWA} from "vite-plugin-pwa";
import trickFetcher from "./plugins/csvFetcher/csvFetcher";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [trickFetcher(), react({}), VitePWA({})],
});
