import { useEffect, useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { useDebounce } from './hooks/useDebounce';
import { useYearInput } from './hooks/useYearInput';
import { useYearTaggedState } from './hooks/useYearTaggedState';
import {
  appContainer,
  appShell,
  inlineErrorBanner,
  pageList,
  pageListStale,
  panelErrorDetail,
  panelErrorTitle,
  panelState,
  panelStateLoading,
  previewArea,
  previewRenderingBadge,
  wasmSvgPageWrapper,
} from './styles/app.css';
import './styles/theme.css';
import { downloadCalendarPdf, renderCalendarSvgs } from './utils/typst/pdf';

/** 初期表示年（今年+1年）。年末に翌年版を開く想定 */
const INITIAL_YEAR = new Date().getFullYear() + 1;

type SvgOutcome = { status: 'ok'; svgs: string[] } | { status: 'error'; error: string };

export function App() {
  const { year, yearInput, setYearInput, commitYear, handleYearKeyDown, adjustYear } =
    useYearInput(INITIAL_YEAR);
  const debouncedYear = useDebounce(year, 300);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const pdfError = useYearTaggedState<string>(year);
  const svgOutcome = useYearTaggedState<SvgOutcome>(debouncedYear);

  const wasmError = svgOutcome.current?.status === 'error' ? svgOutcome.current.error : null;
  const isWasmRendering = svgOutcome.current === null;
  // レンダリング中は直近の成功結果を表示し続け、年切り替えごとの白紙化を避ける
  const latestSvgs =
    svgOutcome.latest?.value.status === 'ok'
      ? { year: svgOutcome.latest.year, svgs: svgOutcome.latest.value.svgs }
      : null;

  const setSvgOutcome = svgOutcome.set;
  useEffect(() => {
    let cancelled = false;

    renderCalendarSvgs(debouncedYear)
      .then((svgs) => {
        if (cancelled) return;
        setSvgOutcome(debouncedYear, { status: 'ok', svgs });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error('WASM SVG rendering failed', error);
        setSvgOutcome(debouncedYear, {
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedYear, setSvgOutcome]);

  const setPdfError = pdfError.set;
  const clearPdfError = pdfError.clear;
  const handleDownloadPdf = () => {
    clearPdfError();
    setIsPdfGenerating(true);
    void downloadCalendarPdf(year)
      .catch((error: unknown) => {
        console.error('PDF generation failed', error);
        setPdfError(year, error instanceof Error ? error.message : String(error));
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
          {pdfError.current ? (
            <div className={inlineErrorBanner} role="alert">
              PDF出力に失敗しました: {pdfError.current}
            </div>
          ) : null}
          {wasmError ? (
            <div className={panelState}>
              <p className={panelErrorTitle}>レンダリング失敗</p>
              <pre className={panelErrorDetail}>{wasmError}</pre>
            </div>
          ) : latestSvgs ? (
            <div className={previewArea} aria-busy={isWasmRendering}>
              {isWasmRendering ? (
                <div className={previewRenderingBadge} role="status">
                  レンダリング中...
                </div>
              ) : null}
              <div
                className={isWasmRendering ? `${pageList} ${pageListStale}` : pageList}
                data-testid="wasm-svg-viewer"
              >
                {latestSvgs.svgs.map((svg, index) => (
                  <div
                    key={`${latestSvgs.year}-${index + 1}`}
                    className={wasmSvgPageWrapper}
                    data-testid="wasm-svg-page"
                    role="img"
                    aria-label={`${latestSvgs.year}年カレンダー ${index + 1}ページ目`}
                    // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- WASM コンパイラ出力のみでユーザー入力を含まない
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className={`${panelState} ${panelStateLoading}`}>レンダリング中...</div>
          )}
        </div>
      </div>
    </>
  );
}
