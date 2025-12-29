import Holidays from 'date-holidays-parser';
import holidaysData from '../data/holidays-jp.json';
import { LRUCache } from './lruCache';
import { MIN_SUPPORTED_YEAR } from './yearValidation';

export { MIN_SUPPORTED_YEAR } from './yearValidation';

export type HolidayMap = Record<string, string>;
const HOLIDAY_CACHE = new LRUCache<number, HolidayMap>(48);
const HOLIDAY_LAW_START_DATE = new Date('1948-07-20');
const HOLIDAYS_CALCULATOR = new Holidays(holidaysData, 'JP');

/** 日付を `YYYY-M-D` 形式に整形する */
export function formatDateKey(dt: Date): string {
  return `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()}`;
}

/** 祝日名を正規化する */
function normalizeHolidayName(name: string): string {
  return name.includes('振替休日') ? '振替休日' : name;
}

/** parser が返す祝日名を文字列へ正規化する */
function resolveHolidayName(name: unknown): string | undefined {
  if (typeof name === 'string') {
    return name;
  }

  if (typeof name !== 'object' || name === null) {
    return undefined;
  }

  const localized = name as Record<string, unknown>;
  if (typeof localized.ja === 'string') return localized.ja;
  if (typeof localized.jp === 'string') return localized.jp;
  if (typeof localized.en === 'string') return localized.en;

  const fallback = Object.values(localized).find(
    (value): value is string => typeof value === 'string'
  );
  return fallback;
}

/**
 * date-holidays-parser の日付文字列から月日を抽出する。
 * parser は ISO 8601 拡張形式（例: "2024-01-01T00:00:00.000+09:00", "10000-01-01T..."）を返す。
 * 年 10000 以降では JS の Date コンストラクタが年を正しく解釈できないため、
 * 正規表現で月日のみを取り出し、問い合わせ年から Date を再構築する。
 */
function parseMonthDay(dateString: string): { month: number; day: number } | undefined {
  const match = /^-?\d+-(\d{2})-(\d{2})/.exec(dateString);
  if (!match) return undefined;
  const month = Number(match[1]);
  const day = Number(match[2]);
  if (!Number.isInteger(month) || !Number.isInteger(day)) return undefined;
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  return { month, day };
}

/** 指定年の祝日マップを生成する */
function buildHolidays(year: number): HolidayMap {
  const holidays: HolidayMap = {};
  const list = HOLIDAYS_CALCULATOR.getHolidays(year) || [];

  for (const { date, name, type } of list) {
    if (type !== 'public') continue;
    const holidayName = resolveHolidayName(name);
    if (!holidayName) continue;
    const monthDay = parseMonthDay(date);
    if (!monthDay) continue;
    // 年 10000 以降で parser が 0000 年表記を返すため、問い合わせ年を基準に実日付を再構築する
    const dt = new Date(year, monthDay.month - 1, monthDay.day);
    if (dt.getFullYear() !== year) continue;
    if (dt < HOLIDAY_LAW_START_DATE) continue;
    const key = formatDateKey(dt);
    holidays[key] = normalizeHolidayName(holidayName);
  }

  return holidays;
}

/** 指定年の祝日を取得する */
export function loadHolidays(year: number): HolidayMap {
  if (!Number.isFinite(year)) {
    return {};
  }

  const normalizedYear = Math.max(MIN_SUPPORTED_YEAR, Math.trunc(year));
  const cached = HOLIDAY_CACHE.get(normalizedYear);
  if (cached) {
    return cached;
  }

  const holidays = buildHolidays(normalizedYear);
  HOLIDAY_CACHE.set(normalizedYear, holidays);
  return holidays;
}

/** テスト用: モジュールスコープのキャッシュを初期化する */
export function resetHolidayCacheForTest(): void {
  HOLIDAY_CACHE.clear();
}
