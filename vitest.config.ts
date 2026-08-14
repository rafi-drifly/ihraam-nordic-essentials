import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    // Analytics only fire on the real storefront hostname, so tests that assert
    // on tracking have to run as if they are on it. Tests for the off-domain
    // behaviour stub window.location themselves.
    environmentOptions: { jsdom: { url: "https://pureihram.com/" } },
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
