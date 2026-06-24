import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: '../',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: import.meta.env.VITE_SERVER_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    '/server': import.meta.env.VITE_SERVER_URL || 'http://localhost:3001',
    hmr: {
      clientPort: 443,
    },
  },
});
