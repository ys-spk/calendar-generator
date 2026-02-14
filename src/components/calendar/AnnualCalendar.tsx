import { clsx } from 'clsx';
import { useGrid } from '../../contexts/GridContext';
import {
  CellColorType,
  WEEKDAY_LABELS,
  WEEKDAY_NUMBERS,
  WeekdayColorType,
  getCellColorType,
  getWeekdayColorType,
} from '../../utils/calendar';

const weekdayColorClassMap: Record<WeekdayColorType, string> = {
  holiday: 'text-holiday',
  saturday: 'text-saturday',
  weekday: 'text-weekday',
} as const;

const cellColorClassMap: Record<CellColorType, string> = {
  holiday: 'text-holiday',
  saturday: 'text-saturday',
  weekday: 'text-weekday',
  'out-of-month': 'text-transparent',
} as const;

export function AnnualCalendar() {
  const { yearGrid } = useGrid();

  return (
    <div
      data-testid="annual-calendar-card"
      className="annual-grid-cols annual-grid-rows h-annual-height w-common-width calendar-card grid print:break-after-page"
    >
      <div className="text-annual-title pb-1mm col-span-full text-center leading-none font-black">
        {yearGrid.year} CALENDAR
      </div>
      {yearGrid.monthGrids.map((monthGrid) => (
        <div
          key={monthGrid.month}
          data-testid={`annual-month-${monthGrid.month}`}
          className="col-span-8 row-span-8 grid grid-flow-row grid-cols-subgrid grid-rows-subgrid after:-col-end-1 after:row-span-full after:content-['']"
        >
          <div className="text-annual-month-label pl-0.8mm col-span-7 self-end text-left font-extrabold">
            {monthGrid.month}
          </div>
          {WEEKDAY_NUMBERS.map((weekday) => (
            <div
              key={weekday}
              className={clsx(
                'border-b-width-0.4mm border-common-grid text-annual-weekday pb-0.5mm flex items-center justify-center leading-none font-bold',
                weekdayColorClassMap[getWeekdayColorType(weekday)]
              )}
            >
              {WEEKDAY_LABELS.jaShort[weekday]}
            </div>
          ))}
          {monthGrid.dayCells.map((cell) => (
            <div
              key={cell.date.toISOString()}
              data-in-month={cell.inMonth}
              className={clsx(
                'text-annual-date flex items-center justify-center leading-none font-bold',
                cellColorClassMap[getCellColorType(cell)]
              )}
            >
              {cell.date.getDate()}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
