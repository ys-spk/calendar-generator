import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { promisify } from 'node:util';
import { expect, test } from 'playwright/test';
import { REFERENCE_YEAR } from './helpers';

const execFile = promisify(execFileCallback);

const convertPdfToPng = async (pdfPath: string, outputPrefix: string): Promise<string[]> => {
  try {
    await execFile('pdftoppm', ['-png', '-r', '144', pdfPath, outputPrefix]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`pdftoppm failed. Is poppler-utils installed?\n${message}`);
  }

  const outputDir = dirname(outputPrefix);
  const outputBase = basename(outputPrefix);
  const files = await readdir(outputDir);

  return files
    .filter((file) => file.startsWith(`${outputBase}-`) && file.endsWith('.png'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((file) => join(outputDir, file));
};

test.describe('PDF出力 @ci', () => {
  test('印刷結果がPNG画像と一致する', async ({ page }) => {
    await page.goto('/');

    const yearInput = page.getByRole('spinbutton');
    await yearInput.fill(REFERENCE_YEAR);
    await yearInput.blur();

    await page.emulateMedia({ media: 'print' });

    await expect(page.getByTestId('annual-calendar-card')).toBeVisible();
    await expect(page.getByTestId('monthly-calendar-card')).toHaveCount(12);
    for (let i = 0; i < 12; i++) {
      await expect(page.getByTestId('monthly-calendar-card').nth(i)).toBeVisible();
    }
    await page.evaluate(async () => document.fonts.ready);

    const tempDir = await mkdtemp(join(tmpdir(), 'calendar-pdf-'));

    try {
      const pdfPath = join(tempDir, 'calendar.pdf');
      const pngPrefix = join(tempDir, 'calendar-page');

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
      });

      await writeFile(pdfPath, pdf);
      const pngPaths = await convertPdfToPng(pdfPath, pngPrefix);

      // 年間1ページ + 月間4ページ = 計5ページ
      expect(pngPaths).toHaveLength(5);

      for (const [index, pngPath] of pngPaths.entries()) {
        const pngBinary = await readFile(pngPath);
        expect(pngBinary).toMatchSnapshot(`calendar-2026-print-page-${index + 1}.png`, {
          maxDiffPixelRatio: 0.02,
        });
      }
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
