import { useLayoutEffect, useRef, useState } from 'react';

type ScaleState = {
  scale: number;
  wrapperHeight: number | undefined;
};

/**
 * カレンダーを wrapper 幅に合わせてスケールするフック。
 * ResizeObserver で wrapper 幅を監視し、transform: scale() を使ってスケールを調整する。
 * zoom プロパティと異なり transform はレイアウトに影響しないため、
 * wrapperHeight を inline style で明示的に管理する。
 *
 * wrapper は flex justify-center にしておくこと。
 * これにより main が自然幅（flex item の content サイズ）に縮まり、
 * scrollWidth が正しく calendar の自然幅を返す。
 */
export function useCalendarScale() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [{ scale, wrapperHeight }, setState] = useState<ScaleState>({
    scale: 1,
    wrapperHeight: undefined,
  });

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const main = mainRef.current;
    if (!wrapper || !main) return;

    const update = () => {
      const clientWidth = wrapper.clientWidth;
      const scrollWidth = main.scrollWidth;
      const scrollHeight = main.scrollHeight;
      // WebKit では初期化前に 0 が返されるケースがあるためスキップ
      if (clientWidth <= 0 || scrollWidth <= 0 || scrollHeight <= 0) return;

      const newScale = Math.min(1, clientWidth / scrollWidth);
      setState({
        scale: newScale,
        wrapperHeight: Math.ceil(scrollHeight * newScale),
      });
    };

    const observer = new ResizeObserver(update);
    observer.observe(wrapper);
    update();

    return () => observer.disconnect();
  }, []);

  return { wrapperRef, mainRef, scale, wrapperHeight };
}
