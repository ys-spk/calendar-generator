import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初期値は遅延なしで返す', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));

    expect(result.current).toBe('initial');
  });

  it('遅延時間が経過するまで前の値を返し、経過後に新しい値を返す', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'first' },
    });

    rerender({ value: 'second' });
    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('second');
  });

  it('遅延中に値が再度変わるとタイマーがリセットされる', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'first' },
    });

    rerender({ value: 'second' });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ value: 'third' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // 最初の変更から400ms経過しているが、リセットにより'first'のまま
    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('third');
  });

  it('アンマウント時にタイマーが破棄され値が更新されない', () => {
    const { result, rerender, unmount } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'first' },
    });

    rerender({ value: 'second' });
    unmount();
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('first');
  });
});
