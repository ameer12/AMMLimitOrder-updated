import { defineConfig } from 'vite';
import {config} from "dotenv";
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { resolve } from 'path';
config()

// https://vitejs.dev/config/
export default defineConfig({
  appType: 'spa',
  root: resolve(__dirname, '.'), //tell Vite where index.html is
  publicDir: resolve(__dirname, './public'), //assets folder
  build: {
    outDir: resolve(__dirname, '../../dist-frontend'),  //optional
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
},
  plugins: [react(), nodePolyfills()],
  //  base: '/', 
});

