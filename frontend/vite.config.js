import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      // This enables JSX in .js files 
      include: "**/*.{jsx,js}",
    }),
  ],
  server: {
    port: 5000,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://0.0.0.0:8000",
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
    allowedHosts: [
      "97079d33-237c-45a4-bdd1-ba8572985cbb-00-23w2owx782irr.worf.replit.dev",
      ".replit.dev",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    extensions: [".js", ".jsx", ".json"],
  },
  // Remove the problematic esbuild configurations
});
