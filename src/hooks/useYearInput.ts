import type React from 'react';
import { useCallback, useReducer } from 'react';
import { clampYear } from '../utils/yearValidation';

type YearInputState = {
  year: number;
  input: string;
};

type YearInputAction =
  | { type: 'setInput'; value: string }
  | { type: 'commit'; value: string | number }
  | { type: 'adjust'; delta: number };

const parseYear = (value: string | number): number | null => {
  const numeric = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(numeric)) return null;
  return clampYear(numeric);
};

/** 数値の年とテキスト入力を同期させるReducer */
function reducer(state: YearInputState, action: YearInputAction): YearInputState {
  switch (action.type) {
    case 'setInput':
      return { ...state, input: action.value };
    case 'commit': {
      const parsed = parseYear(action.value);
      if (parsed === null) {
        return { ...state, input: String(state.year) };
      }
      return { year: parsed, input: String(parsed) };
    }
    case 'adjust': {
      const next = clampYear(state.year + action.delta);
      return { year: next, input: String(next) };
    }
  }
}

/** 年入力を管理するhook */
export function useYearInput(initialYear: number) {
  const initialClamped = clampYear(initialYear);
  const [state, dispatch] = useReducer(reducer, {
    year: initialClamped,
    input: String(initialClamped),
  });

  const setYearInput = useCallback((value: string) => {
    dispatch({ type: 'setInput', value });
  }, []);

  const commitYear = useCallback((value: string | number) => {
    dispatch({ type: 'commit', value });
  }, []);

  const handleYearKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        dispatch({ type: 'commit', value: state.input });
      }
    },
    [state.input]
  );

  const adjustYear = useCallback((delta: number) => {
    dispatch({ type: 'adjust', delta });
  }, []);

  return {
    year: state.year,
    yearInput: state.input,
    setYearInput,
    commitYear,
    handleYearKeyDown,
    adjustYear,
  };
}
