import { defineConfig } from 'vite';

const { resolve } = require('path');

export default defineConfig({
  base: '/les_petits_plats/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
});
