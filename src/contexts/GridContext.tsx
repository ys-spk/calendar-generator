import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useGridData } from '../hooks/useGridData';
import { YearGrid } from '../utils/calendar';
import type { HolidayMap } from '../utils/holidays';

type GridContextValue = {
  holidays: HolidayMap;
  yearGrid: YearGrid;
};
type GridProviderProps = {
  year: number;
  children: ReactNode;
};

const GridContext = createContext<GridContextValue | undefined>(undefined);

/** 指定年の祝日マップと年間データをContextに提供する */
export function GridProvider({ year, children }: GridProviderProps) {
  const { holidays, yearGrid } = useGridData(year);
  const value = useMemo(() => ({ holidays, yearGrid }), [holidays, yearGrid]);

  return <GridContext.Provider value={value}>{children}</GridContext.Provider>;
}

/** 年間データへアクセスするhook */
export function useGrid(): GridContextValue {
  const context = useContext(GridContext);
  if (context === undefined) {
    throw new Error('useGrid must be used within a GridProvider');
  }
  return context;
}
