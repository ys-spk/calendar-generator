import { useEffect, useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { useDebounce } from './hooks/useDebounce';
import { useYearInput } from './hooks/useYearInput';
import {
  appContainer,
  appShell,
  inlineErrorBanner,
  pageList,
  panelErrorDetail,
  panelErrorTitle,
  panelState,
  panelStateLoading,
  wasmSvgPageWrapper,
} from './styles/app.css';
import './styles/theme.css';
import { downloadCalendarPdf, renderCalendarSvgs } from './utils/typst/pdf';

/** 初期表示年（今年+1年）。年末に翌年版を開く想定 */
const UI_DEFAULT_YEAR_OFFSET = 1;

export function App() {
  const { year, yearInput, setYearInput, commitYear, handleYearKeyDown, adjustYear } = useYearInput(
    new Date().getFullYear() + UI_DEFAULT_YEAR_OFFSET
  );
  const debouncedYear = useDebounce(year, 300);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<{ year: number; message: string } | null>(null);
  const [wasmResult, setWasmResult] = useState<
    | { year: number; status: 'ok'; svgs: string[] }
    | { year: number; status: 'error'; error: string }
    | null
  >(null);
  const currentPdfError = pdfError?.year === year ? pdfError.message : null;
  const currentResult = wasmResult?.year === debouncedYear ? wasmResult : null;
  const wasmSvgs = currentResult?.status === 'ok' ? currentResult.svgs : null;
  const wasmError = currentResult?.status === 'error' ? currentResult.error : null;
  const isWasmRendering = currentResult === null;

  useEffect(() => {
    let cancelled = false;

    renderCalendarSvgs(debouncedYear)
      .then((svgs) => {
        if (cancelled) return;
        setWasmResult({ year: debouncedYear, status: 'ok', svgs });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error('WASM SVG rendering failed', error);
        setWasmResult({
          year: debouncedYear,
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedYear]);

  const handleDownloadPdf = () => {
    setPdfError(null);
    setIsPdfGenerating(true);
    void downloadCalendarPdf(year)
      .catch((error: unknown) => {
        console.error('PDF generation failed', error);
        setPdfError({
          year,
          message: error instanceof Error ? error.message : String(error),
        });
      })
      .finally(() => setIsPdfGenerating(false));
  };

  return (
    <>
      <title>カレンダーつくったー</title>
      <div className={appShell}>
        <div className={appContainer}>
          <AppHeader
            yearInput={yearInput}
            onYearInputChange={setYearInput}
            onYearInputBlur={() => commitYear(yearInput)}
            onYearInputKeyDown={handleYearKeyDown}
            onAdjustYear={adjustYear}
            onDownloadPdf={handleDownloadPdf}
            isPdfGenerating={isPdfGenerating}
          />
          {currentPdfError ? (
            <div className={inlineErrorBanner} role="alert">
              PDF出力に失敗しました: {currentPdfError}
            </div>
          ) : null}
          {isWasmRendering ? (
            <div className={`${panelState} ${panelStateLoading}`}>レンダリング中...</div>
          ) : wasmError ? (
            <div className={panelState}>
              <p className={panelErrorTitle}>レンダリング失敗</p>
              <pre className={panelErrorDetail}>{wasmError}</pre>
            </div>
          ) : wasmSvgs ? (
            <div className={pageList} data-testid="wasm-svg-viewer">
              {wasmSvgs.map((svg, index) => (
                <div
                  key={`${year}-${index + 1}`}
                  className={wasmSvgPageWrapper}
                  data-testid="wasm-svg-page"
                  // SVG は WASM コンパイラ出力のみ（ユーザー入力を含まない）
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
