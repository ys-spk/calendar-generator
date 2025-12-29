import Holidays from 'date-holidays-parser';
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

    it('年10000でも祝日を取得できる', () => {
      const holidays = loadHolidays(10000);
      expect(holidays['10000-1-1']).toBe('元日');
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

    it('祝日名がオブジェクト（ja キー）の場合でも解決できる', () => {
      const data = [
        { date: '2007-01-01T00:00:00.000+09:00', name: { ja: '元日' }, type: 'public' },
      ];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      const spy = vi.spyOn(Holidays.prototype, 'getHolidays').mockReturnValueOnce(data as any);
      const holidays = loadHolidays(2007);
      spy.mockRestore();
      expect(holidays['2007-1-1']).toBe('元日');
    });

    it('祝日名がオブジェクト（jp キー）の場合でも解決できる', () => {
      const data = [
        { date: '2001-01-01T00:00:00.000+09:00', name: { jp: '元日' }, type: 'public' },
      ];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      const spy = vi.spyOn(Holidays.prototype, 'getHolidays').mockReturnValueOnce(data as any);
      const holidays = loadHolidays(2001);
      spy.mockRestore();
      expect(holidays['2001-1-1']).toBe('元日');
    });

    it('祝日名がオブジェクト（en キー）の場合でも解決できる', () => {
      const data = [
        { date: '2002-01-01T00:00:00.000+09:00', name: { en: "New Year's Day" }, type: 'public' },
      ];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      const spy = vi.spyOn(Holidays.prototype, 'getHolidays').mockReturnValueOnce(data as any);
      const holidays = loadHolidays(2002);
      spy.mockRestore();
      expect(holidays['2002-1-1']).toBe("New Year's Day");
    });

    it('祝日名がオブジェクト（任意キー）の場合はフォールバックで解決できる', () => {
      const data = [
        { date: '2003-01-01T00:00:00.000+09:00', name: { zh: '元旦' }, type: 'public' },
      ];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      const spy = vi.spyOn(Holidays.prototype, 'getHolidays').mockReturnValueOnce(data as any);
      const holidays = loadHolidays(2003);
      spy.mockRestore();
      expect(holidays['2003-1-1']).toBe('元旦');
    });

    it('祝日名がオブジェクトで文字列値がない場合はスキップされる', () => {
      const data = [{ date: '2004-01-01T00:00:00.000+09:00', name: { num: 123 }, type: 'public' }];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      const spy = vi.spyOn(Holidays.prototype, 'getHolidays').mockReturnValueOnce(data as any);
      const holidays = loadHolidays(2004);
      spy.mockRestore();
      expect(holidays['2004-1-1']).toBeUndefined();
    });

    it('祝日名が null の場合はスキップされる', () => {
      const data = [{ date: '2005-01-01T00:00:00.000+09:00', name: null, type: 'public' }];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      const spy = vi.spyOn(Holidays.prototype, 'getHolidays').mockReturnValueOnce(data as any);
      const holidays = loadHolidays(2005);
      spy.mockRestore();
      expect(holidays['2005-1-1']).toBeUndefined();
    });

    it('日付文字列が不正な形式の場合はスキップされる', () => {
      const data = [{ date: 'invalid-date-string', name: '元日', type: 'public' }];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      const spy = vi.spyOn(Holidays.prototype, 'getHolidays').mockReturnValueOnce(data as any);
      const holidays = loadHolidays(2006);
      spy.mockRestore();
      expect(Object.keys(holidays)).not.toContain('2006-1-1');
    });

    it('日付の月が範囲外の場合はスキップされる', () => {
      const data = [{ date: '2008-13-01T00:00:00.000+09:00', name: '元日', type: 'public' }];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      const spy = vi.spyOn(Holidays.prototype, 'getHolidays').mockReturnValueOnce(data as any);
      const holidays = loadHolidays(2008);
      spy.mockRestore();
      expect(Object.keys(holidays)).toHaveLength(0);
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
