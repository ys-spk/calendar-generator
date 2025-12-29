import Holidays from 'date-holidays';
import { LRUCache } from './lruCache';
import { clampYear } from './yearValidation';

export { MIN_SUPPORTED_YEAR } from './yearValidation';

export type HolidayMap = Record<string, string>;
const HOLIDAY_CACHE = new LRUCache<number, HolidayMap>(48);
const HOLIDAY_LAW_START_DATE = new Date('1948-07-20');
const HOLIDAYS_CALCULATOR = new Holidays('JP');

/** 日付を `YYYY-MM-DD` 形式に整形する */
export function formatDateKey(dt: Date): string {
  return `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()}`;
}

/** 祝日名を正規化する */
function normalizeHolidayName(name: string): string {
  return name.includes('振替休日') ? '振替休日' : name;
}

/** 指定年の祝日マップを生成する */
function buildHolidays(year: number): HolidayMap {
  const list = HOLIDAYS_CALCULATOR.getHolidays(year) || [];
  const holidays: HolidayMap = {};

  for (const { date, name, type } of list) {
    if (type !== 'public') continue;
    const dt = new Date(date);
    if (dt < HOLIDAY_LAW_START_DATE) continue;
    const key = formatDateKey(dt);
    holidays[key] = normalizeHolidayName(name);
  }

  return holidays;
}

/** 指定年の祝日を取得する */
export function loadHolidays(year: number): HolidayMap {
  if (!Number.isFinite(year)) {
    return {};
  }

  const clampedYear = clampYear(year);
  const cached = HOLIDAY_CACHE.get(clampedYear);
  if (cached) {
    return cached;
  }

  const holidays = buildHolidays(clampedYear);
  HOLIDAY_CACHE.set(clampedYear, holidays);
  return holidays;
}
