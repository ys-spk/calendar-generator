import { formatDateKey, type HolidayMap } from './holidays';

type CalendarCell = {
  date: Date;
  inMonth: boolean;
  holidayName?: string | undefined;
};
type MonthGrid = {
  month: number;
  dayCells: CalendarCell[];
};
export type YearGrid = {
  year: number;
  monthGrids: MonthGrid[];
};
export type CellColorType = 'out-of-month' | WeekdayColorType;
export type WeekdayColorType = 'holiday' | 'saturday' | 'weekday';
type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const WEEKDAY = {
  SUNDAY: 0 as Weekday,
  SATURDAY: 6 as Weekday,
} as const;
const MONTHS_IN_YEAR = 12;
const DAYS_IN_WEEK = 7;
const GRID_TOTAL_MIN_ROWS = 5;
const MONTH_GRID_CACHE = new WeakMap<HolidayMap, Map<string, MonthGrid>>();

export const MONTH_NUMBERS = Array.from({ length: MONTHS_IN_YEAR }, (_, i) => i + 1);
export const WEEKDAY_NUMBERS = Array.from({ length: DAYS_IN_WEEK }, (_, i) => i) as Weekday[];
export const WEEKDAY_LABELS = {
  enShort: buildWeekdayLabels('en'),
  jaShort: buildWeekdayLabels('ja'),
} as const;

/** 曜日数値から曜日名を生成する（2001年1月0日＝日曜日を基準として算出 */
function buildWeekdayLabels(locale: string) {
  return Array.from({ length: DAYS_IN_WEEK }, (_, dayOfWeek) =>
    new Date(2001, 0, dayOfWeek).toLocaleDateString(locale, { weekday: 'short' })
  );
}

/** 年と月を "January 2024" のような英語表記にフォーマットする。 */
export function formatMonthYear(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString('en', { month: 'long', year: 'numeric' });
}

/** 曜日ごとの色を判定する */
export function getWeekdayColorType(weekday: Weekday): WeekdayColorType {
  if (weekday === WEEKDAY.SUNDAY) return 'holiday';
  if (weekday === WEEKDAY.SATURDAY) return 'saturday';
  return 'weekday';
}

/** 日付セルの色を判定する */
export function getCellColorType(cell: CalendarCell): CellColorType {
  if (!cell.inMonth) return 'out-of-month';
  if (cell.holidayName) return 'holiday';
  return getWeekdayColorType(cell.date.getDay() as Weekday);
}

/** 1か月分のグリッドを作成する。日曜日始まり・土曜日終わりになるよう前後を埋める */
function buildMonthGrid(year: number, month: number, holidays: HolidayMap): MonthGrid {
  const monthIndex = month - 1;
  const monthKey = `${year}-${month}`;
  const holidayCache = MONTH_GRID_CACHE.get(holidays) ?? new Map<string, MonthGrid>();
  const cached = holidayCache.get(monthKey);
  if (cached) return cached;

  const firstOfMonth = new Date(year, monthIndex, 1);
  const startDay = firstOfMonth.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const weekCount = Math.max(
    GRID_TOTAL_MIN_ROWS,
    Math.ceil((startDay + daysInMonth) / DAYS_IN_WEEK)
  );
  const totalCells = weekCount * DAYS_IN_WEEK;
  const startDate = 1 - startDay;

  const dayCells: CalendarCell[] = Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(year, monthIndex, startDate + index);
    const inMonth = date.getMonth() === monthIndex;
    const key = formatDateKey(date);
    return {
      date,
      inMonth,
      holidayName: holidays[key],
    };
  });

  holidayCache.set(monthKey, { month, dayCells });
  MONTH_GRID_CACHE.set(holidays, holidayCache);
  return { month, dayCells };
}

/** 12か月分のグリッドをまとめて生成する */
export function buildYearGrid(year: number, holidays: HolidayMap): YearGrid {
  return { year, monthGrids: MONTH_NUMBERS.map((month) => buildMonthGrid(year, month, holidays)) };
}
