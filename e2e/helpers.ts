import type { Page } from 'playwright/test';
import { expect } from 'playwright/test';

export const REFERENCE_YEAR = '2026';
export const MM_TO_PX = 96 / 25.4;
export const mmToPx = (mm: number): number => mm * MM_TO_PX;

/** 年を選択し印刷メディアをエミュレーションする */
export async function setupCalendar(page: Page, year: string) {
  await page.goto('/');
  const yearInput = page.getByRole('spinbutton');
  await yearInput.fill(year);
  await yearInput.blur();
  await page.emulateMedia({ media: 'print' });
}

/** mm 単位の寸法を ±2px の許容範囲でアサーションする */
export function expectDimension(actual: number, expectedMm: number) {
  const expectedPx = mmToPx(expectedMm);
  expect(actual).toBeGreaterThanOrEqual(expectedPx - 2);
  expect(actual).toBeLessThanOrEqual(expectedPx + 2);
}
