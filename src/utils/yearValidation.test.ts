import { describe, it, expect } from 'vitest';
import { clampYear, MIN_SUPPORTED_YEAR, MAX_SUPPORTED_YEAR } from './yearValidation';

describe('yearValidation', () => {
  describe('clampYear', () => {
    it('年が有効範囲内の場合', () => {
      expect(clampYear(2024)).toBe(2024);
      expect(clampYear(2000)).toBe(2000);
      expect(clampYear(MIN_SUPPORTED_YEAR)).toBe(MIN_SUPPORTED_YEAR);
      expect(clampYear(MAX_SUPPORTED_YEAR)).toBe(MAX_SUPPORTED_YEAR);
    });

    it('最小値未満の場合', () => {
      expect(clampYear(MIN_SUPPORTED_YEAR - 1)).toBe(MIN_SUPPORTED_YEAR);
      expect(clampYear(1000)).toBe(MIN_SUPPORTED_YEAR);
      expect(clampYear(-100)).toBe(MIN_SUPPORTED_YEAR);
    });

    it('最大値超過の場合', () => {
      expect(clampYear(MAX_SUPPORTED_YEAR + 1)).toBe(MAX_SUPPORTED_YEAR);
      expect(clampYear(99999)).toBe(MAX_SUPPORTED_YEAR);
    });

    it('整数でない場合は整数に切り捨てる', () => {
      expect(clampYear(2024.7)).toBe(2024);
      expect(clampYear(2024.1)).toBe(2024);
      expect(clampYear(2024.99)).toBe(2024);
    });
  });
});
