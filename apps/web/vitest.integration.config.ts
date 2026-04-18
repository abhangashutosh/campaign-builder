import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.integration.test.{ts,tsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup-integration.ts'],
    testTimeout: 15_000,
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
})
