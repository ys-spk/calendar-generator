import Holidays from 'date-holidays';
import { describe, it, expect, vi } from 'vitest';
import { formatDateKey, loadHolidays, MIN_SUPPORTED_YEAR } from './holidays';

describe('holidays', () => {
  describe('formatDateKey', () => {
    it('日付をYYYY-M-D形式(0埋めなし)でフォーマット', () => {
      const date1 = new Date(2024, 0, 1);
      expect(formatDateKey(date1)).toBe('2024-1-1');

      const date2 = new Date(2024, 11, 25);
      expect(formatDateKey(date2)).toBe('2024-12-25');

      const date3 = new Date(2024, 5, 15);
      expect(formatDateKey(date3)).toBe('2024-6-15');

      const date4 = new Date(2024, 2, 5);
      expect(formatDateKey(date4)).toBe('2024-3-5');
    });
  });

  describe('loadHolidays', () => {
    it('各年の祝日を出力する', () => {
      const holidays = loadHolidays(2024);
      expect(holidays).toBeDefined();
      expect(typeof holidays).toBe('object');
    });

    it('無効な年の場合', () => {
      expect(loadHolidays(NaN)).toEqual({});
      expect(loadHolidays(Number.POSITIVE_INFINITY)).toEqual({});
      expect(loadHolidays(Number.NEGATIVE_INFINITY)).toEqual({});
    });

    it('有効範囲外の年の場合', () => {
      const holidays1 = loadHolidays(1000);
      const holidays2 = loadHolidays(MIN_SUPPORTED_YEAR);
      expect(Object.keys(holidays1).length).toBeGreaterThan(0);
      expect(Object.keys(holidays2).length).toBeGreaterThan(0);
    });

    it('日本の祝日が出力されている', () => {
      const holidays = loadHolidays(2024);

      const newYearKey = '2024-1-1';
      expect(holidays[newYearKey]).toBeDefined();
    });

    it('同一年が再度指定された場合はキャッシュからの応答が行われる', () => {
      const holidays1 = loadHolidays(2024);
      const holidays2 = loadHolidays(2024);
      expect(holidays1).toBe(holidays2);
    });

    it('getHolidaysがfalsyを返した場合でも空のマップを返す', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      const spy = vi.spyOn(Holidays.prototype, 'getHolidays').mockReturnValueOnce(null as any);

      // キャッシュされていない年を使用する
      const holidays = loadHolidays(1960);
      expect(holidays).toEqual({});

      spy.mockRestore();
    });

    it('振替休日名は「振替休日」となっている', () => {
      const holidays = loadHolidays(2024);
      const substituteHolidays = Object.values(holidays).filter((name) =>
        name.includes('振替休日')
      );

      for (const name of substituteHolidays) {
        expect(name).toBe('振替休日');
      }
    });
  });
});
