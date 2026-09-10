import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isElectronBuild = process.env.BUILD_TARGET === "electron";

// https://vite.dev/config/
export default defineConfig({
  base: isElectronBuild ? "./" : "/",
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2020",
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split the heavy vendor libraries out of the single entry chunk so the
        // first load downloads less and the parts that rarely change stay cached.
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          state: ["@reduxjs/toolkit", "react-redux", "@tanstack/react-query"],
          charts: ["recharts"],
          sheets: ["xlsx"],
          motion: ["framer-motion"],
          utils: ["date-fns", "lodash"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
