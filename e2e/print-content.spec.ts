import { expect, test } from '@playwright/test';
import { setupCalendar } from './helpers';

test.describe('カレンダー内容', () => {
  test.describe('スモークテスト', () => {
    test('年を変更するとページ内容が更新される', async ({ page }) => {
      await setupCalendar(page, '2027');

      await expect(page.getByText('2027 CALENDAR')).toBeVisible();
      await expect(page.getByText('January 2027')).toBeVisible();
      await expect(page.getByText('December 2027')).toBeVisible();
      await expect(page.getByTestId('monthly-calendar-card')).toHaveCount(12);
    });
  });

  test.describe('色', () => {
    test('平日・土曜日・日祝の色が異なる', async ({ page }) => {
      await setupCalendar(page, '2024');

      const januaryCard = page
        .getByTestId('monthly-calendar-card')
        .filter({ hasText: 'January 2024' });

      // 1月6日（土曜日）
      const saturdayCell = januaryCard.locator('[data-in-month="true"]').nth(6 - 1);
      const saturdayColor = await saturdayCell.evaluate((el) => getComputedStyle(el).color);

      // 1月7日（日曜日）
      const sundayCell = januaryCard.locator('[data-in-month="true"]').nth(7 - 1);
      const sundayColor = await sundayCell.evaluate((el) => getComputedStyle(el).color);

      // 1月8日（祝日）
      const holidayCell = januaryCard.locator('[data-in-month="true"]').nth(8 - 1);
      const holidayColor = await holidayCell.evaluate((el) => getComputedStyle(el).color);

      // 1月9日（平日）
      const weekdayCell = januaryCard.locator('[data-in-month="true"]').nth(9 - 1);
      const weekdayColor = await weekdayCell.evaluate((el) => getComputedStyle(el).color);

      // 日曜日と祝日は同じ色
      expect(holidayColor).toBe(sundayColor);
      // それ以外は異なる色
      expect(holidayColor).not.toBe(saturdayColor);
      expect(holidayColor).not.toBe(weekdayColor);
      expect(saturdayColor).not.toBe(weekdayColor);
    });
  });
});
