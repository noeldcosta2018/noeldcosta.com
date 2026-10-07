import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    // scripts/**/*.test.mjs use node:test, not Vitest; run them with
    // `npm run test:scripts`.
    exclude: [...configDefaults.exclude, "scripts/**"],
    // The routing, hreflang and sitemap contracts walk every article in all
    // 17 languages (about 1,650 routes); the full reciprocity proof takes about a minute.
    testTimeout: 180000,
  },
});
