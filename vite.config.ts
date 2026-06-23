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
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'vendor-three';
            if (id.includes('@react-three')) return 'vendor-r3f';
            if (id.includes('postprocessing')) return 'vendor-postprocessing';
            if (id.includes('framer-motion')) return 'vendor-motion';
            return 'vendor';
          }
        }
      }
    }
  }
})
