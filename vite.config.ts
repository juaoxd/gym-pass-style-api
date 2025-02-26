import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    coverage: {
      all: false,
    },
    exclude: ['**/node_modules/**', '**/build/**'],
    environmentMatchGlobs: [
      ['src/http/controllers/**', 'src/vitest-environments/prisma.ts'],
    ],
  },
})
