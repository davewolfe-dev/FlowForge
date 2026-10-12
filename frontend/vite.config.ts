import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/static/dist/', // Tells Vite where files live relative to Django's static setup
  build: {
    outDir: '../flowforge/static/dist', // output the production build files directly where Django expects them
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: 'src/main.tsx',
    },
  },
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    cors: true,
    // Ensures Vite plays nicely with Django's origin requests in dev mode
    origin: 'http://localhost:5173',
  },
  test: {
    globals: true,
    environment: 'jsdom', // mimic browser dom in terminal
    setupFiles: './src/setupTests.ts',
    cache: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*'],
      exclude: [
          'src/main.tsx',
          'src/setupTests.ts',
          'src/**/*.test.tsx',
          'src/**/*.test.ts',
          'src/vite-env.d.ts'
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  },
});
