import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useYearTaggedState } from './useYearTaggedState';

describe('useYearTaggedState', () => {
  it('初期状態ではcurrentもlatestもnullを返す', () => {
    const { result } = renderHook(() => useYearTaggedState<string>(2026));

    expect(result.current.current).toBeNull();
    expect(result.current.latest).toBeNull();
  });

  it('現在の年と一致する値をcurrentとして返す', () => {
    const { result } = renderHook(() => useYearTaggedState<string>(2026));

    act(() => {
      result.current.set(2026, 'value-2026');
    });

    expect(result.current.current).toBe('value-2026');
    expect(result.current.latest).toEqual({ year: 2026, value: 'value-2026' });
  });

  it('現在の年と一致しない値はcurrentではnullになるがlatestには残る', () => {
    const { result, rerender } = renderHook(({ year }) => useYearTaggedState<string>(year), {
      initialProps: { year: 2026 },
    });

    act(() => {
      result.current.set(2026, 'value-2026');
    });
    rerender({ year: 2027 });

    expect(result.current.current).toBeNull();
    expect(result.current.latest).toEqual({ year: 2026, value: 'value-2026' });
  });

  it('clearでcurrentとlatestの両方がnullに戻る', () => {
    const { result } = renderHook(() => useYearTaggedState<string>(2026));

    act(() => {
      result.current.set(2026, 'value-2026');
    });
    act(() => {
      result.current.clear();
    });

    expect(result.current.current).toBeNull();
    expect(result.current.latest).toBeNull();
  });

  it('setで値を上書きするとタグも更新される', () => {
    const { result, rerender } = renderHook(({ year }) => useYearTaggedState<string>(year), {
      initialProps: { year: 2026 },
    });

    act(() => {
      result.current.set(2026, 'value-2026');
    });
    rerender({ year: 2027 });
    act(() => {
      result.current.set(2027, 'value-2027');
    });

    expect(result.current.current).toBe('value-2027');
    expect(result.current.latest).toEqual({ year: 2027, value: 'value-2027' });
  });
});
