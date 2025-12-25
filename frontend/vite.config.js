import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // allow external access
    port: 5173,

    // 👇 Add this section to allow ngrok domain
    allowedHosts: ["nematocystic-noble-tropophilous.ngrok-free.dev"],
  },
});
