import { describe, it, expect } from 'vitest';
import {
  formatMonthYear,
  getWeekdayColorType,
  getCellColorType,
  buildYearGrid,
  MONTH_NUMBERS,
  WEEKDAY_NUMBERS,
  WEEKDAY_LABELS,
} from './calendar';
import { loadHolidays } from './holidays';

describe('calendar', () => {
  describe('formatMonthYear', () => {
    it('年月を英語形式でフォーマット', () => {
      expect(formatMonthYear(2024, 1)).toBe('January 2024');
      expect(formatMonthYear(2024, 6)).toBe('June 2024');
      expect(formatMonthYear(2024, 12)).toBe('December 2024');
      expect(formatMonthYear(2025, 1)).toBe('January 2025');
    });
  });

  describe('getWeekdayColorType', () => {
    it('日曜日は"holiday"、土曜日は"saturday"、それ以外は"weekday"', () => {
      expect(getWeekdayColorType(0)).toBe('holiday');
      expect(getWeekdayColorType(1)).toBe('weekday');
      expect(getWeekdayColorType(2)).toBe('weekday');
      expect(getWeekdayColorType(3)).toBe('weekday');
      expect(getWeekdayColorType(4)).toBe('weekday');
      expect(getWeekdayColorType(5)).toBe('weekday');
      expect(getWeekdayColorType(6)).toBe('saturday');
    });
  });

  describe('getCellColorType', () => {
    it('当月でなければ"out-of-month"', () => {
      const cell = {
        date: new Date(2024, 0, 1),
        inMonth: false,
      };
      expect(getCellColorType(cell)).toBe('out-of-month');
    });

    it('祝日名がある場合は"holiday"', () => {
      const cell = {
        date: new Date(2024, 0, 1), // 月曜日
        inMonth: true,
        holidayName: '元日',
      };
      expect(getCellColorType(cell)).toBe('holiday');
    });

    it('当月中で祝日でなければ、曜日ごとの色を出力', () => {
      const sundayCell = {
        date: new Date(2024, 0, 7), // 日曜日
        inMonth: true,
      };
      expect(getCellColorType(sundayCell)).toBe('holiday');

      const saturdayCell = {
        date: new Date(2024, 0, 6), // 土曜日
        inMonth: true,
      };
      expect(getCellColorType(saturdayCell)).toBe('saturday');

      const weekdayCell = {
        date: new Date(2024, 0, 2), // 火曜日
        inMonth: true,
      };
      expect(getCellColorType(weekdayCell)).toBe('weekday');
    });
  });

  describe('buildYearGrid', () => {
    it('12ヶ月分のグリッドが生成されている', () => {
      const holidays = {};
      const yearGrid = buildYearGrid(2024, holidays);

      expect(yearGrid.year).toBe(2024);
      expect(yearGrid.monthGrids).toHaveLength(12);
    });

    it('各月の月番号が正しく生成されている', () => {
      const holidays = {};
      const yearGrid = buildYearGrid(2024, holidays);

      for (const [index, grid] of yearGrid.monthGrids.entries()) {
        expect(grid.month).toBe(index + 1);
      }
    });

    it('各月のセルが生成されている', () => {
      const holidays = {};
      const yearGrid = buildYearGrid(2024, holidays);

      for (const grid of yearGrid.monthGrids) {
        expect(grid.dayCells.length).toBeGreaterThan(0);
        expect(grid.dayCells.length % 7).toBe(0);
      }
    });

    it('各月のグリッドには前後月のセルが含まれている', () => {
      const holidays = {};
      const yearGrid = buildYearGrid(2024, holidays);

      const januaryGrid = yearGrid.monthGrids[0];
      const outOfMonthCells = januaryGrid?.dayCells.filter((cell) => !cell.inMonth);
      expect(outOfMonthCells?.length).toBeGreaterThan(0);
    });

    it('祝日名が適用されている', () => {
      const holidays = { '2024-1-1': '元日' };
      const yearGrid = buildYearGrid(2024, holidays);

      const januaryGrid = yearGrid.monthGrids[0];
      const newYearCell = januaryGrid?.dayCells.find(
        (cell) => cell.inMonth && cell.date.getDate() === 1 && cell.date.getMonth() === 0
      );

      expect(newYearCell).toBeDefined();
      expect(newYearCell?.holidayName).toBe('元日');
    });

    it('各月には最低5行が含まれている', () => {
      const holidays = {};
      const yearGrid = buildYearGrid(2024, holidays);

      for (const grid of yearGrid.monthGrids) {
        const rowCount = grid.dayCells.length / 7;
        expect(rowCount).toBeGreaterThanOrEqual(5);
      }
    });

    it('同じ祝日情報を複数回使用しても正しく動作する', () => {
      const holidays = { '2024-1-1': '元日', '2024-11-3': '文化の日' };
      const yearGrid1 = buildYearGrid(2024, holidays);
      const yearGrid2 = buildYearGrid(2024, holidays);

      // 同じholidaysオブジェクトを使用した場合、同じ内容が返却される
      expect(yearGrid1.monthGrids.length).toBe(12);
      expect(yearGrid2.monthGrids.length).toBe(12);

      const jan1Cell1 = yearGrid1.monthGrids[0]?.dayCells.find(
        (cell) => cell.inMonth && cell.date.getDate() === 1
      );
      const jan1Cell2 = yearGrid2.monthGrids[0]?.dayCells.find(
        (cell) => cell.inMonth && cell.date.getDate() === 1
      );
      expect(jan1Cell1?.holidayName).toBe('元日');
      expect(jan1Cell2?.holidayName).toBe('元日');

      const nov3Cell1 = yearGrid1.monthGrids[10]?.dayCells.find(
        (cell) => cell.inMonth && cell.date.getDate() === 3
      );
      const nov3Cell2 = yearGrid2.monthGrids[10]?.dayCells.find(
        (cell) => cell.inMonth && cell.date.getDate() === 3
      );
      expect(nov3Cell1?.holidayName).toBe('文化の日');
      expect(nov3Cell2?.holidayName).toBe('文化の日');
    });

    it('うるう年は2月が29日まである', () => {
      const holidays = loadHolidays(2024);
      const yearGrid = buildYearGrid(2024, holidays);
      const febGrid = yearGrid.monthGrids[1];
      const inMonthCells = febGrid?.dayCells.filter((cell) => cell.inMonth);
      expect(inMonthCells).toHaveLength(29);
    });

    it('平年は2月が28日まである', () => {
      const holidays = loadHolidays(2025);
      const yearGrid = buildYearGrid(2025, holidays);
      const febGrid = yearGrid.monthGrids[1];
      const inMonthCells = febGrid?.dayCells.filter((cell) => cell.inMonth);
      expect(inMonthCells).toHaveLength(28);
    });

    it('振替休日が正しく判定されている', () => {
      const holidays = loadHolidays(2023);
      const yearGrid = buildYearGrid(2023, holidays);
      const janGrid = yearGrid.monthGrids[0];
      const jan2Cell = janGrid?.dayCells.find(
        (cell) => cell.inMonth && cell.date.getDate() === 2 && cell.date.getMonth() === 0
      );
      expect(jan2Cell).toBeDefined();
      expect(jan2Cell?.holidayName).toBe('振替休日');
    });

    it('複数年のグリッドが正しく生成される', () => {
      const holidays = { '2024-1-1': '元日' };
      const yearGrid2024 = buildYearGrid(2024, holidays);
      const yearGrid2025 = buildYearGrid(2025, holidays);

      expect(yearGrid2024.year).toBe(2024);
      expect(yearGrid2025.year).toBe(2025);

      // 2024年1月1日は月曜日
      const day1 = yearGrid2024.monthGrids[0]?.dayCells.find(
        (cell) => cell.inMonth && cell.date.getDate() === 1
      );
      expect(day1?.date.getDay()).toBe(1);

      // 2025年1月1日は水曜日
      const day2 = yearGrid2025.monthGrids[0]?.dayCells.find(
        (cell) => cell.inMonth && cell.date.getDate() === 1
      );
      expect(day2?.date.getDay()).toBe(3);
    });
  });

  describe('定数', () => {
    it('月の配列', () => {
      expect(MONTH_NUMBERS).toHaveLength(12);
      expect(MONTH_NUMBERS[0]).toBe(1);
      expect(MONTH_NUMBERS[11]).toBe(12);
    });

    it('曜日の配列', () => {
      expect(WEEKDAY_NUMBERS).toHaveLength(7);
      expect(WEEKDAY_NUMBERS[0]).toBe(0);
      expect(WEEKDAY_NUMBERS[6]).toBe(6);
    });

    it('曜日ラベルの配列', () => {
      expect(WEEKDAY_LABELS.enShort).toHaveLength(7);
      expect(WEEKDAY_LABELS.jaShort).toHaveLength(7);

      expect(WEEKDAY_LABELS.enShort[0]).toBe('Sun');
      expect(WEEKDAY_LABELS.jaShort[0]).toBe('日');
    });
  });
});
