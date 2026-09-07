import { formatDateKey, type HolidayMap } from './holidays';

export type CalendarCell = {
  date: Date;
  key: string;
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
export type CellColorType = 'out-of-month' | 'holiday' | 'saturday' | 'weekday';

const WEEKDAY = {
  SUNDAY: 0,
  SATURDAY: 6,
} as const;
const MONTHS_IN_YEAR = 12;
const DAYS_IN_WEEK = 7;
const GRID_TOTAL_MIN_ROWS = 5;

export const MONTH_NUMBERS = Array.from({ length: MONTHS_IN_YEAR }, (_, i) => i + 1);

/** 日付セルの色を判定する */
export function getCellColorType(cell: CalendarCell): CellColorType {
  if (!cell.inMonth) return 'out-of-month';
  if (cell.holidayName) return 'holiday';
  const dayOfWeek = cell.date.getDay();
  if (dayOfWeek === WEEKDAY.SUNDAY) return 'holiday';
  if (dayOfWeek === WEEKDAY.SATURDAY) return 'saturday';
  return 'weekday';
}

/** 1か月分のグリッドを作成する。日曜日始まり・土曜日終わりになるよう前後を埋める */
function buildMonthGrid(year: number, month: number, holidays: HolidayMap): MonthGrid {
  const monthIndex = month - 1;
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
      key,
      inMonth,
      holidayName: holidays[key],
    };
  });

  return { month, dayCells };
}

/** 12か月分のグリッドをまとめて生成する */
export function buildYearGrid(year: number, holidays: HolidayMap): YearGrid {
  return { year, monthGrids: MONTH_NUMBERS.map((month) => buildMonthGrid(year, month, holidays)) };
}
