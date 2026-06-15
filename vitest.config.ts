import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
    // These are integration tests sharing one MySQL (DATABASE_URL). Running test
    // files in parallel causes cross-file data races (e.g. one file reviews
    // allRoasters[0] while another seeds roasters). Run serially for determinism.
    // NOTE: tests are not yet per-test isolated (no per-test cleanup/transactions),
    // so a clean DB is expected at the start of a run; CI provisions a fresh
    // MySQL service. See implementation-readiness-report.md.
    fileParallelism: false,
  },
});
