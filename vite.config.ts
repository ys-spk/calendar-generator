import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import React from '@vitejs/plugin-react';
import { type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

function restartOnSpecialFiles(): Plugin {
  return {
    name: 'restart-on-special-files',
    handleHotUpdate({ file, server }) {
      if (file.endsWith('src/utils/typstLayout.ts')) {
        console.log('[vite] special file changed, restarting server...');
        void server.restart(true);
      }
    },
  };
}

export default defineConfig({
  plugins: [vanillaExtractPlugin(), React(), restartOnSpecialFiles()],
  base: './',
  optimizeDeps: {
    // WASM パッケージは Vite の事前バンドル対象から除外する
    // wasm-pack-shim.mjs が import.meta.url でWASMパスを解決するため、
    // 3パッケージすべてをesbuildプリバンドルから外す必要がある
    exclude: [
      '@myriaddreamin/typst-ts-web-compiler',
      '@myriaddreamin/typst-ts-renderer',
      '@myriaddreamin/typst.ts',
    ],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('date-holidays-parser')) {
            return 'date-holidays';
          }
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
