import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      plugins: [["@swc-jotai/debug-label", {}]],
    }),
    svgr(),
    TanStackRouterVite(),
    visualizer({
      filename: "dist/stats.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: { setupFiles: ["./src/test/setupTests.ts"] },
});
