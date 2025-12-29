import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MAX_SUPPORTED_YEAR, MIN_SUPPORTED_YEAR } from '../utils/yearValidation';
import { useGridData } from './useGridData';

describe('useGridData', () => {
  describe('基本機能', () => {
    it('年を入力するとholidaysとyearGridが出力される', () => {
      const { result } = renderHook(() => useGridData(2024));

      expect(result.current.holidays).toBeDefined();
      expect(result.current.yearGrid).toBeDefined();
      expect(result.current.yearGrid.year).toBe(2024);
      expect(result.current.yearGrid.monthGrids).toHaveLength(12);
    });

    it('年が違うと生成結果も違う', () => {
      const { result: result1 } = renderHook(() => useGridData(2023));
      const { result: result2 } = renderHook(() => useGridData(2024));

      expect(result1.current.yearGrid.year).toBe(2023);
      expect(result2.current.yearGrid.year).toBe(2024);
    });
  });

  describe('年の正規化', () => {
    it('数値以外が入力された場合', () => {
      const { result: result1 } = renderHook(() => useGridData(NaN));
      const { result: result2 } = renderHook(() => useGridData(Number.POSITIVE_INFINITY));

      expect(result1.current.yearGrid.year).toBe(MIN_SUPPORTED_YEAR);
      expect(result2.current.yearGrid.year).toBe(MIN_SUPPORTED_YEAR);
    });

    it('有効範囲外の年が入力された場合', () => {
      const { result: result1 } = renderHook(() => useGridData(1000));
      const { result: result2 } = renderHook(() => useGridData(99999));

      expect(result1.current.yearGrid.year).toBe(MIN_SUPPORTED_YEAR);
      expect(result2.current.yearGrid.year).toBe(MAX_SUPPORTED_YEAR);
    });
  });

  describe('祝日取得', () => {
    it('指定年とその前後の祝日が出力されている', () => {
      const { result } = renderHook(() => useGridData(2024));
      const holidayKeys = Object.keys(result.current.holidays);

      const has2023 = holidayKeys.some((key) => key.startsWith('2023'));
      const has2024 = holidayKeys.some((key) => key.startsWith('2024'));
      const has2025 = holidayKeys.some((key) => key.startsWith('2025'));

      expect(has2023).toBe(true);
      expect(has2024).toBe(true);
      expect(has2025).toBe(true);
    });
  });

  describe('メモ化', () => {
    it('同一年が再度指定された場合はキャッシュからの応答が行われる', () => {
      const { result: result1 } = renderHook(() => useGridData(2024));
      const { result: result2 } = renderHook(() => useGridData(2024));

      expect(result1.current.yearGrid).toBe(result2.current.yearGrid);
      expect(result1.current.holidays).toBe(result2.current.holidays);
    });

    it('年が変更されたら更新する', () => {
      const { result, rerender } = renderHook(({ year }) => useGridData(year), {
        initialProps: { year: 2024 },
      });
      const firstResult = result.current;
      rerender({ year: 2025 });

      expect(result.current.yearGrid.year).toBe(2025);
      expect(result.current.yearGrid).not.toBe(firstResult.yearGrid);
    });

    it('年が同じ場合は更新しない', () => {
      const { result, rerender } = renderHook(({ year }) => useGridData(year), {
        initialProps: { year: 2024 },
      });
      const firstResult = result.current;
      rerender({ year: 2024 });

      expect(result.current).toBe(firstResult);
    });
  });

  describe('グリッド構造', () => {
    it('12ヶ月分のグリッドが生成されている', () => {
      const { result } = renderHook(() => useGridData(2024));

      expect(result.current.yearGrid.monthGrids).toHaveLength(12);
      for (const [index, grid] of result.current.yearGrid.monthGrids.entries()) {
        expect(grid.month).toBe(index + 1);
      }
    });

    it('各月のセルが生成されている', () => {
      const { result } = renderHook(() => useGridData(2024));

      for (const grid of result.current.yearGrid.monthGrids) {
        expect(grid.dayCells.length).toBeGreaterThan(0);
        expect(grid.dayCells.length % 7).toBe(0);
      }
    });
  });
});
