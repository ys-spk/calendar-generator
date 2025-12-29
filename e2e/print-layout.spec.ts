import { expect, test } from '@playwright/test';
import { expectDimension, REFERENCE_YEAR, setupCalendar } from './helpers';

test.describe('印刷レイアウト', () => {
  test.beforeEach(async ({ page }) => {
    await setupCalendar(page, REFERENCE_YEAR);
  });

  test('印刷時はヘッダー全体が非表示になる', async ({ page }) => {
    await expect(page.getByTestId('app-header')).toBeHidden();
    await expect(page.getByTestId('annual-calendar-card')).toHaveCount(1);
    await expect(page.getByTestId('monthly-calendar-card')).toHaveCount(12);
  });

  test('寸法が期待通りである', async ({ page }) => {
    const annualCard = page.getByTestId('annual-calendar-card');
    const monthlyCard = page.getByTestId('monthly-calendar-card').first();

    const annualBox = await annualCard.boundingBox();
    const monthlyBox = await monthlyCard.boundingBox();

    expect(annualBox).not.toBeNull();
    expect(monthlyBox).not.toBeNull();

    // ±2px の許容範囲で寸法を検証する
    expectDimension(annualBox!.width, 140);
    expectDimension(annualBox!.height, 160);

    expectDimension(monthlyBox!.width, 140);
    expectDimension(monthlyBox!.height, 80);
  });
});
