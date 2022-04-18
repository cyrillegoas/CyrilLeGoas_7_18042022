import { defineConfig } from 'vite';

const { resolve } = require('path');

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
});
