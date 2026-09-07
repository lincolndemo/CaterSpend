import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Separate from vitest.config.ts on purpose: these tests need a live Postgres and are not part of
// `npm test`. See README — they run against `npx supabase start`, never against the hosted project.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    testTimeout: 30_000,
    // Every file signs up its own users against one shared local stack; running files concurrently
    // would race the auth rate limiter rather than anything in the schema.
    fileParallelism: false,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
