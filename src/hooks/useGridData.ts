import { useMemo } from 'react';
import { buildYearGrid, YearGrid } from '../utils/calendar';
import { loadHolidays, type HolidayMap } from '../utils/holidays';
import { LRUCache } from '../utils/lruCache';
import { clampYear, MIN_SUPPORTED_YEAR } from '../utils/yearValidation';

const GRID_CACHE = new LRUCache<number, { holidays: HolidayMap; yearGrid: YearGrid }>(12);
const HOLIDAY_PRELOAD_RANGE = 1;

/** 指定年の祝日マップと年間グリッドを構築するhook */
export function useGridData(year: number): {
  holidays: HolidayMap;
  yearGrid: YearGrid;
} {
  const normalizedYear = useMemo(
    () => (Number.isFinite(year) ? clampYear(year) : MIN_SUPPORTED_YEAR),
    [year]
  );

  return useMemo(() => buildGridData(normalizedYear), [normalizedYear]);
}

/** 年間データを年ごとにメモ化する */
function buildGridData(normalizedYear: number): { holidays: HolidayMap; yearGrid: YearGrid } {
  const cached = GRID_CACHE.get(normalizedYear);
  if (cached) return cached;

  /** 前後1年の祝日も取得する（12月のカレンダーに翌年の元日を載せるため） */
  const buildTargetYears = [
    normalizedYear - HOLIDAY_PRELOAD_RANGE,
    normalizedYear,
    normalizedYear + HOLIDAY_PRELOAD_RANGE,
  ];
  const holidayMaps = buildTargetYears.map((y) => loadHolidays(y));
  const merged = holidayMaps.reduce<HolidayMap>((acc, map) => Object.assign(acc, map), {});
  const yearGrid = buildYearGrid(normalizedYear, merged);
  const result = { holidays: merged, yearGrid };
  GRID_CACHE.set(normalizedYear, result);
  return result;
}

/** テスト用: モジュールスコープのキャッシュを初期化する */
export function resetGridCacheForTest(): void {
  GRID_CACHE.clear();
}
