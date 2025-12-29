import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MIN_SUPPORTED_YEAR, MAX_SUPPORTED_YEAR } from '../utils/yearValidation';
import { useYearInput } from './useYearInput';

describe('useYearInput', () => {
  describe('初期化', () => {
    it('入力した年で初期化を行う', () => {
      const { result } = renderHook(() => useYearInput(2024));
      expect(result.current.year).toBe(2024);
      expect(result.current.yearInput).toBe('2024');
    });

    it('有効範囲外の値を入力した場合', () => {
      const { result: result1 } = renderHook(() => useYearInput(1000));
      expect(result1.current.year).toBe(MIN_SUPPORTED_YEAR);
      expect(result1.current.yearInput).toBe(String(MIN_SUPPORTED_YEAR));

      const { result: result2 } = renderHook(() => useYearInput(99999));
      expect(result2.current.year).toBe(MAX_SUPPORTED_YEAR);
      expect(result2.current.yearInput).toBe(String(MAX_SUPPORTED_YEAR));
    });
  });

  describe('setYearInput', () => {
    it('onChange段階ではカレンダーを更新しない', () => {
      const { result } = renderHook(() => useYearInput(2024));

      act(() => {
        result.current.setYearInput('2025');
      });

      expect(result.current.yearInput).toBe('2025');
      expect(result.current.year).toBe(2024);
    });

    it('onChange段階ではカレンダーを更新しない(入力途中の場合)', () => {
      const { result } = renderHook(() => useYearInput(2024));

      act(() => {
        result.current.setYearInput('20');
      });

      expect(result.current.yearInput).toBe('20');
      expect(result.current.year).toBe(2024);
    });
  });

  describe('commitYear', () => {
    it('入力した年を確定する(string型の場合)', () => {
      const { result } = renderHook(() => useYearInput(2024));

      act(() => {
        result.current.setYearInput('2025');
      });

      act(() => {
        result.current.commitYear(result.current.yearInput);
      });

      expect(result.current.year).toBe(2025);
      expect(result.current.yearInput).toBe('2025');
    });

    it('入力した年を確定する(number型の場合)', () => {
      const { result } = renderHook(() => useYearInput(2024));

      act(() => {
        result.current.commitYear(2026);
      });

      expect(result.current.year).toBe(2026);
      expect(result.current.yearInput).toBe('2026');
    });

    it('無効な入力の場合', () => {
      const { result } = renderHook(() => useYearInput(2024));

      act(() => {
        result.current.setYearInput('invalid');
      });

      act(() => {
        result.current.commitYear(result.current.yearInput);
      });

      expect(result.current.year).toBe(2024);
      expect(result.current.yearInput).toBe('2024');
    });

    it('有効範囲外の値を入力した場合', () => {
      const { result } = renderHook(() => useYearInput(2024));

      act(() => {
        result.current.commitYear(99999);
      });

      expect(result.current.year).toBe(MAX_SUPPORTED_YEAR);
      expect(result.current.yearInput).toBe(String(MAX_SUPPORTED_YEAR));
    });

    it('有効範囲外の値を入力した場合(空文字列は0扱い)', () => {
      const { result } = renderHook(() => useYearInput(2024));

      act(() => {
        result.current.setYearInput('');
      });

      act(() => {
        result.current.commitYear(result.current.yearInput);
      });

      expect(result.current.year).toBe(MIN_SUPPORTED_YEAR);
      expect(result.current.yearInput).toBe(String(MIN_SUPPORTED_YEAR));
    });
  });

  describe('handleYearKeyDown', () => {
    it('Enterキーで入力値確定', () => {
      const { result } = renderHook(() => useYearInput(2024));

      act(() => {
        result.current.setYearInput('2025');
      });

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        result.current.handleYearKeyDown(event as unknown as React.KeyboardEvent<HTMLInputElement>);
      });

      expect(result.current.year).toBe(2025);
      expect(result.current.yearInput).toBe('2025');
    });

    it('他キー押下時は何もしない', () => {
      const { result } = renderHook(() => useYearInput(2024));

      act(() => {
        result.current.setYearInput('2025');
      });

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'a' });
        result.current.handleYearKeyDown(event as unknown as React.KeyboardEvent<HTMLInputElement>);
      });

      expect(result.current.year).toBe(2024);
      expect(result.current.yearInput).toBe('2025');
    });
  });

  describe('incrementYear/decrementYear', () => {
    it('年のインクリメント', () => {
      const { result } = renderHook(() => useYearInput(2024));

      act(() => {
        result.current.incrementYear();
      });

      expect(result.current.year).toBe(2025);
      expect(result.current.yearInput).toBe('2025');
    });

    it('年のデクリメント', () => {
      const { result } = renderHook(() => useYearInput(2024));

      act(() => {
        result.current.decrementYear();
      });

      expect(result.current.year).toBe(2023);
      expect(result.current.yearInput).toBe('2023');
    });

    it('既に最大値だったらインクリメントしない', () => {
      const { result } = renderHook(() => useYearInput(MAX_SUPPORTED_YEAR));

      act(() => {
        result.current.incrementYear();
      });

      expect(result.current.year).toBe(MAX_SUPPORTED_YEAR);
      expect(result.current.yearInput).toBe(String(MAX_SUPPORTED_YEAR));
    });

    it('既に最小値だったらデクリメントしない', () => {
      const { result } = renderHook(() => useYearInput(MIN_SUPPORTED_YEAR));

      act(() => {
        result.current.decrementYear();
      });

      expect(result.current.year).toBe(MIN_SUPPORTED_YEAR);
      expect(result.current.yearInput).toBe(String(MIN_SUPPORTED_YEAR));
    });
  });
});
