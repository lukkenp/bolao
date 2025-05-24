import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "localhost",
    port: 8080,
    proxy: {
      '/loteria-api': {
        target: 'https://loteriascaixa-api.herokuapp.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/loteria-api/, ''),
        secure: false,
      },
    }
  },
  optimizeDeps: {
    include: ['@tanstack/react-query'],
  },
}));
