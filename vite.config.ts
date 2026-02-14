/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite';
import React from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';

function restartOnSpecialFiles(): Plugin {
  return {
    name: 'restart-on-special-files',
    handleHotUpdate({ file, server }) {
      if (file.endsWith('src/styles/config.ts')) {
        console.log('[vite] special file changed, restarting server...');
        server.restart(true);
      }
    },
  };
}

export default defineConfig({
  plugins: [React(), UnoCSS(), restartOnSpecialFiles()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'date-holidays': ['date-holidays'],
        },
      },
    },
    chunkSizeWarningLimit: 2000,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'dist/**', 'node_modules/**'],
  },
});
