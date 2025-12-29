/** 国民の祝日に関する法律 施行年 */
export const MIN_SUPPORTED_YEAR = 1948;
export const MAX_SUPPORTED_YEAR = 9999;

/** サポート対象外の年を指定できないよう丸める */
export function clampYear(year: number): number {
  return Math.max(MIN_SUPPORTED_YEAR, Math.min(MAX_SUPPORTED_YEAR, Math.trunc(year)));
}
