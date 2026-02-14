/// <reference types="node" />
import { defineConfig, devices } from 'playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  grepInvert: process.env.CI ? undefined : /@ci/,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    locale: 'ja-JP',
  },
  webServer: {
    // preview（本番ビルド済み出力）に対してテストを実行
    // 事前に `npm run build` でビルドしておく必要がある
    command: 'npx vite preview --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      // PDF テストで既にカバー済みのため、スクリーンショットテストを除外する
      testIgnore: /print-screenshot/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      // page.pdf() は Chromium 専用のため、PDF テストを除外する
      testIgnore: /print-pdf/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      // page.pdf() は Chromium 専用のため、PDF テストを除外する
      testIgnore: /print-pdf/,
    },
  ],
});
