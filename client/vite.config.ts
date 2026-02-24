import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  server: {
    host: "0.0.0.0",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("/recharts/")) {
            return "charts";
          }

          if (
            id.includes("/rete/") ||
            id.includes("/rete-") ||
            id.includes("/rete-kit/")
          ) {
            return "rete";
          }

          if (
            id.includes("/@mui/") ||
            id.includes("/@emotion/") ||
            id.includes("/@popperjs/")
          ) {
            return "vendor-mui";
          }

          if (id.includes("/@lottiefiles/dotlottie-react/")) {
            return "lottie";
          }

          return undefined;
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
