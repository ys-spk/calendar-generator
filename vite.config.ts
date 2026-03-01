import React from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';
import { type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

function restartOnSpecialFiles(): Plugin {
  return {
    name: 'restart-on-special-files',
    handleHotUpdate({ file, server }) {
      if (file.endsWith('src/styles/config.ts')) {
        console.log('[vite] special file changed, restarting server...');
        void server.restart(true);
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
          'date-holidays': ['date-holidays-parser'],
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
