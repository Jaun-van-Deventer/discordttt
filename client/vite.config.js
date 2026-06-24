import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/.proxy/api': {
        target: process.env.VITE_SERVER_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/.proxy\/api/, ''),
      },
      '/.proxy/server': {
        target: process.env.VITE_SERVER_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/.proxy\/server/, ''),
        ws: true,
      },
    },
    hmr: {
      clientPort: 443,
    },
  },
})