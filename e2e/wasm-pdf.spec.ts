import { type Page, expect, test } from '@playwright/test';

const REFERENCE_YEAR = '2026';

/** PDF出力ボタンをクリックしてダウンロードイベントを返すヘルパー */
async function clickPdfDownload(page: Page) {
  const downloadPromise = page.waitForEvent('download');
  // ResizeObserver の stability チェックを回避するため evaluate でクリックする
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('PDF出力')
    );
    btn?.click();
  });
  return downloadPromise;
}

test.describe('WASM PDF出力', () => {
  // WASM ロード + CJK フォント取得のため長めのタイムアウトを設定
  test.setTimeout(120_000);

  test('PDF出力ボタンで PDF がダウンロードされる', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('spinbutton').fill(REFERENCE_YEAR);
    await page.getByRole('spinbutton').blur();

    const downloadPromise = clickPdfDownload(page);

    // 生成中表示に変わることを確認
    await expect(page.getByRole('button', { name: 'PDF生成中...' })).toBeVisible();

    const download = await downloadPromise;

    // 生成完了後にボタンが元に戻ることを確認
    await expect(page.getByRole('button', { name: 'PDF出力' })).toBeVisible({
      timeout: 90_000,
    });

    expect(download.suggestedFilename()).toBe(`calendar-${REFERENCE_YEAR}.pdf`);
  });
});
