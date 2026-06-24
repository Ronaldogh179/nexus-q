import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/tests/unit/setup.js'],
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
    // Cobertura para SonarCloud — genera coverage/lcov.info (lcov format)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        'src/main.jsx',
        'src/App.jsx',
        '**/*.config.js',
        '**/*.spec.ts',
        '**/*.test.jsx',
        'load-test.js',
      ],
    },
  },
})