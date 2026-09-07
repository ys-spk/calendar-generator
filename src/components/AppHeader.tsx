import type React from 'react';
import {
  actionButton,
  appActions,
  appHeader,
  appHeaderRow,
  appTitle,
  stepperButton,
  stepperDivider,
  stepperGroup,
  yearControls,
  yearInput,
  yearInputLabel,
  yearInputPrefix,
} from '../styles/header.css';
import { MAX_SUPPORTED_YEAR, MIN_SUPPORTED_YEAR } from '../utils/yearValidation';

type AppHeaderProps = {
  yearInput: string;
  onYearInputChange: (value: string) => void;
  onYearInputBlur: () => void;
  onYearInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onAdjustYear: (delta: number) => void;
  onDownloadPdf: () => void;
  isPdfGenerating: boolean;
};

export function AppHeader({
  yearInput: yearInputValue,
  onYearInputChange,
  onYearInputBlur,
  onYearInputKeyDown,
  onAdjustYear,
  onDownloadPdf,
  isPdfGenerating,
}: AppHeaderProps) {
  return (
    <header data-testid="app-header" className={appHeader}>
      <div className={appHeaderRow}>
        <h1 className={appTitle}>カレンダーつくったー</h1>
        <div className={appActions}>
          <div className={yearControls}>
            <label className={yearInputLabel}>
              <span className={yearInputPrefix}>年</span>
              <input
                type="number"
                min={MIN_SUPPORTED_YEAR}
                max={MAX_SUPPORTED_YEAR}
                value={yearInputValue}
                onChange={(e) => onYearInputChange(e.target.value)}
                onBlur={onYearInputBlur}
                onKeyDown={onYearInputKeyDown}
                className={yearInput}
              />
            </label>
            <div className={stepperGroup}>
              <button type="button" onClick={() => onAdjustYear(-1)} className={stepperButton}>
                前年
              </button>
              <div className={stepperDivider} aria-hidden="true" />
              <button type="button" onClick={() => onAdjustYear(1)} className={stepperButton}>
                翌年
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isPdfGenerating}
            className={actionButton}
          >
            {isPdfGenerating ? 'PDF生成中...' : 'PDF出力'}
          </button>
        </div>
      </div>
    </header>
  );
}
