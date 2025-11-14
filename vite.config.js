import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const isElectronBuild = process.env.BUILD_TARGET === "electron";

// https://vite.dev/config/
export default defineConfig({
  base: isElectronBuild ? "./" : "/",
  plugins: [react(), tailwindcss()],
});
