import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCalendarScale } from './useCalendarScale';

function TestComponent() {
  const { wrapperRef, mainRef, scale, wrapperHeight } = useCalendarScale();
  return (
    <div data-testid="wrapper" ref={wrapperRef}>
      <main
        data-testid="main"
        ref={mainRef}
        data-scale={scale}
        data-wrapper-height={wrapperHeight ?? ''}
      />
    </div>
  );
}

describe('useCalendarScale', () => {
  type ResizeObserverCallback = () => void;
  let observerCallback: ResizeObserverCallback | undefined;
  let mockDisconnect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observerCallback = undefined;
    mockDisconnect = vi.fn();

    const disconnect = mockDisconnect;
    vi.stubGlobal(
      'ResizeObserver',
      class MockResizeObserver {
        constructor(cb: ResizeObserverCallback) {
          observerCallback = cb;
        }
        observe = vi.fn();
        disconnect = disconnect;
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('初期値は scale=1、wrapperHeight=undefined', () => {
    render(<TestComponent />);
    const main = screen.getByTestId('main');
    expect(main.dataset.scale).toBe('1');
    expect(main.dataset.wrapperHeight).toBe('');
  });

  it('要素の寸法が有効な場合に scale と wrapperHeight を更新する', () => {
    render(<TestComponent />);

    const wrapper = screen.getByTestId('wrapper');
    const main = screen.getByTestId('main');

    Object.defineProperty(wrapper, 'clientWidth', { get: () => 800, configurable: true });
    Object.defineProperty(main, 'scrollWidth', { get: () => 1000, configurable: true });
    Object.defineProperty(main, 'scrollHeight', { get: () => 600, configurable: true });

    act(() => {
      observerCallback?.();
    });

    // scale = min(1, 800/1000) = 0.8, wrapperHeight = ceil(600 * 0.8) = 480
    expect(main.dataset.scale).toBe('0.8');
    expect(main.dataset.wrapperHeight).toBe('480');
  });

  it('コンテンツが wrapper より小さい場合は scale=1 を維持する', () => {
    render(<TestComponent />);

    const wrapper = screen.getByTestId('wrapper');
    const main = screen.getByTestId('main');

    Object.defineProperty(wrapper, 'clientWidth', { get: () => 1200, configurable: true });
    Object.defineProperty(main, 'scrollWidth', { get: () => 800, configurable: true });
    Object.defineProperty(main, 'scrollHeight', { get: () => 600, configurable: true });

    act(() => {
      observerCallback?.();
    });

    // scale = min(1, 1200/800) = 1, wrapperHeight = ceil(600 * 1) = 600
    expect(main.dataset.scale).toBe('1');
    expect(main.dataset.wrapperHeight).toBe('600');
  });

  it('寸法が 0 の場合は state を更新しない', () => {
    render(<TestComponent />);
    const main = screen.getByTestId('main');

    // happy-dom では寸法が 0 のためコールバック呼び出しでも state 変化なし
    act(() => {
      observerCallback?.();
    });

    expect(main.dataset.scale).toBe('1');
    expect(main.dataset.wrapperHeight).toBe('');
  });

  it('アンマウント時に observer を切断する', () => {
    const { unmount } = render(<TestComponent />);
    unmount();
    expect(mockDisconnect).toHaveBeenCalledOnce();
  });
});
