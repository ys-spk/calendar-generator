import { AppHeader } from './components/AppHeader';
import { AnnualCalendar } from './components/calendar/AnnualCalendar';
import { MonthlyCalendarList } from './components/calendar/MonthlyCalendarList';
import { GridProvider } from './contexts/GridContext';
import { useYearInput } from './hooks/useYearInput';

/** 初期表示年（今年+1年）。年末における翌年分の印刷を想定 */
const UI_DEFAULT_YEAR_OFFSET = 1;

export default function App() {
  const { year, yearInput, setYearInput, commitYear, handleYearKeyDown } = useYearInput(
    new Date().getFullYear() + UI_DEFAULT_YEAR_OFFSET
  );

  return (
    <GridProvider year={year}>
      <title>カレンダーつくったー</title>
      <div className="min-h-screen bg-slate-50 font-['M_PLUS_2'] text-slate-900 dark:bg-slate-900 dark:text-slate-100 print:bg-white print:text-black">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-6">
          <AppHeader
            yearInput={yearInput}
            onYearInputChange={setYearInput}
            onYearInputBlur={() => commitYear(yearInput)}
            onYearInputKeyDown={handleYearKeyDown}
            onAdjustYear={(delta) => commitYear(year + delta)}
            onPrint={() => window.print()}
          />
          <main>
            <AnnualCalendar />
            <MonthlyCalendarList />
          </main>
        </div>
      </div>
    </GridProvider>
  );
}
