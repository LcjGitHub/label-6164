import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ant-design/icons': path.resolve(__dirname, 'node_modules/antd/node_modules/@ant-design/icons'),
    },
  },
  server: {
    port: 6101,
    proxy: {
      '/api': {
        target: 'http://localhost:6000',
        changeOrigin: true,
      },
    },
  },
});
