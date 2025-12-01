import { clsx } from 'clsx';
import { useGrid } from '../../contexts/GridContext';
import {
  WEEKDAY_LABELS,
  WEEKDAY_NUMBERS,
  formatMonthYear,
  getWeekdayColorType,
  getCellColorType,
  WeekdayColorType,
  CellColorType,
} from '../../utils/calendar';

const weekdayColorClassMap: Record<WeekdayColorType, string> = {
  holiday: 'bg-holiday',
  saturday: 'bg-saturday',
  weekday: 'bg-weekday',
} as const;

const cellColorClassMap: Record<CellColorType, string> = {
  holiday: 'text-holiday',
  saturday: 'text-saturday',
  weekday: 'text-weekday',
  'out-of-month': 'text-out-of-month',
} as const;

export function MonthlyCalendarList() {
  const { yearGrid } = useGrid();

  return yearGrid.monthGrids.map((monthGrid) => (
    <div
      key={monthGrid.month}
      className="calendar-card h-monthly-height w-common-width grid grid-cols-7 grid-rows-[min-content_min-content]"
    >
      <div className="text-monthly-title pb-1.5mm col-span-full text-center leading-none font-black">
        {formatMonthYear(yearGrid.year, monthGrid.month)}
      </div>
      {WEEKDAY_NUMBERS.map((weekday) => (
        <div
          key={weekday}
          className={clsx(
            'bo-common-grid bo-width-0.2mm text-monthly-weekday py-1mm text-center leading-none font-bold text-white',
            weekdayColorClassMap[getWeekdayColorType(weekday)]
          )}
        >
          {WEEKDAY_LABELS.enShort[weekday]}
        </div>
      ))}
      {monthGrid.dayCells.map((cell) => (
        <div
          key={cell.date.toISOString()}
          className={clsx(
            'bo-common-grid bo-width-0.2mm flex flex-col',
            cellColorClassMap[getCellColorType(cell)]
          )}
        >
          <div className="text-monthly-date ml-1mm flex-1 leading-none font-bold">
            {cell.date.getDate()}
          </div>
          <div className="min-h-1lh text-monthly-holiday mb-0.5mm text-center leading-none font-medium whitespace-nowrap">
            {cell.holidayName}
          </div>
        </div>
      ))}
    </div>
  ));
}
