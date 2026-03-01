import { AppHeader } from './components/AppHeader';
import { AnnualCalendar } from './components/calendar/AnnualCalendar';
import { MonthlyCalendarList } from './components/calendar/MonthlyCalendarList';
import { GridProvider } from './contexts/GridContext';
import { useCalendarScale } from './hooks/useCalendarScale';
import { useYearInput } from './hooks/useYearInput';

/** 初期表示年（今年+1年）。年末における翌年分の印刷を想定 */
const UI_DEFAULT_YEAR_OFFSET = 1;

export function App() {
  const {
    year,
    yearInput,
    setYearInput,
    commitYear,
    handleYearKeyDown,
    incrementYear,
    decrementYear,
  } = useYearInput(new Date().getFullYear() + UI_DEFAULT_YEAR_OFFSET);
  const { wrapperRef, mainRef, scale, wrapperHeight } = useCalendarScale();

  return (
    <GridProvider year={year}>
      <title>カレンダーつくったー</title>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 print:bg-white print:text-black">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-6">
          <AppHeader
            yearInput={yearInput}
            onYearInputChange={setYearInput}
            onYearInputBlur={() => commitYear(yearInput)}
            onYearInputKeyDown={handleYearKeyDown}
            onAdjustYear={(delta) => (delta > 0 ? incrementYear() : decrementYear())}
            onPrint={() => window.print()}
          />
          <div
            ref={wrapperRef}
            className="calendar-scale-wrapper flex w-full items-start justify-center overflow-hidden"
            style={wrapperHeight != null ? { height: `${wrapperHeight}px` } : undefined}
          >
            <main
              ref={mainRef}
              style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
            >
              <AnnualCalendar />
              <MonthlyCalendarList />
            </main>
          </div>
        </div>
      </div>
    </GridProvider>
  );
}
