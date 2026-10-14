import { useCallback, useState } from 'react';

export type YearTagged<T> = { year: number; value: T };

/**
 * 対象年をタグ付けした値を保持する state。
 * 非同期処理の結果に「どの年のものか」を焼き込むことで、
 * 年の切り替え後に古い結果を現在の年のものとして誤表示するのを防ぐ。
 *
 * - `current`: タグが `currentYear` と一致するときだけ値を返す
 * - `latest`: 年の一致に関わらず直近に設定された値を返す（stale 表示用）
 */
export function useYearTaggedState<T>(currentYear: number) {
  const [latest, setLatest] = useState<YearTagged<T> | null>(null);

  const set = useCallback((year: number, value: T) => {
    setLatest({ year, value });
  }, []);

  const clear = useCallback(() => {
    setLatest(null);
  }, []);

  const current = latest !== null && latest.year === currentYear ? latest.value : null;

  return { current, latest, set, clear };
}
