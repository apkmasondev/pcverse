import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/pcverse/',
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        codeSplitting: {
          minSize: 20 * 1024,
          maxSize: 700 * 1024,
          groups: [
            {
              name: 'vendor',
              test: /node_modules[\\/]/,
              entriesAware: true,
            },
          ],
        },
      }
    }
  }
})
