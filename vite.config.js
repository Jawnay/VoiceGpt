import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  base: process.env.NODE_ENV === 'production' ? '/VoiceGpt/' : '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://voicegpt-o6b1.onrender.com', // Change this to match the URL of your API server
        changeOrigin: true, // This sets the origin of the host header to the target URL
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});