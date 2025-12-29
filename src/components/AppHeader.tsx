import type React from 'react';
import { MIN_SUPPORTED_YEAR } from '../utils/yearValidation';

type AppHeaderProps = {
  yearInput: string;
  onYearInputChange: (value: string) => void;
  onYearInputBlur: () => void;
  onYearInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onAdjustYear: (delta: number) => void;
  onPrint: () => void;
};

export function AppHeader({
  yearInput,
  onYearInputChange,
  onYearInputBlur,
  onYearInputKeyDown,
  onAdjustYear,
  onPrint,
}: AppHeaderProps) {
  return (
    <header className="rounded-xl bg-white p-6 shadow-sm backdrop-blur dark:bg-slate-800 dark:shadow-slate-900/30 print:hidden">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <h1 className="text-3xl leading-none font-bold dark:text-white">カレンダーつくったー</h1>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <input
                  type="number"
                  min={MIN_SUPPORTED_YEAR}
                  value={yearInput}
                  onChange={(e) => onYearInputChange(e.target.value)}
                  onBlur={onYearInputBlur}
                  onKeyDown={onYearInputKeyDown}
                  className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-center dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
                年
              </label>
              <div className="flex overflow-hidden rounded-lg border border-slate-200 dark:border-slate-600">
                <button
                  type="button"
                  onClick={() => onAdjustYear(-1)}
                  className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-600 dark:active:bg-slate-500"
                >
                  前年
                </button>
                <div className="h-full w-px bg-slate-200 dark:bg-slate-600" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => onAdjustYear(1)}
                  className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-600 dark:active:bg-slate-500"
                >
                  翌年
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={onPrint}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              印刷
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
