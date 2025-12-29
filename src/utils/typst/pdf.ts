import rendererWasmUrl from '@myriaddreamin/typst-ts-renderer/wasm?url';
import compilerWasmUrl from '@myriaddreamin/typst-ts-web-compiler/wasm?url';
import { $typst, TypstSnippet } from '@myriaddreamin/typst.ts/contrib/snippet';
import type { WebAssemblyModuleRef } from '@myriaddreamin/typst.ts/wasm';
import mplus2BlackUrl from '../../assets/fonts/MPLUS2-Black.ttf?url';
import mplus2BoldUrl from '../../assets/fonts/MPLUS2-Bold.ttf?url';
import mplus2ExtraBoldUrl from '../../assets/fonts/MPLUS2-ExtraBold.ttf?url';
import mplus2MediumUrl from '../../assets/fonts/MPLUS2-Medium.ttf?url';
import mplus2RegularUrl from '../../assets/fonts/MPLUS2-Regular.ttf?url';
import { buildCalendarYearGrid, buildTypstPageSources, buildTypstSource } from './document';

// ── 初期化 ──────────────────────────────────────────────────────────────────

const MPLUS2_FONT_URLS = [
  mplus2RegularUrl,
  mplus2MediumUrl,
  mplus2BoldUrl,
  mplus2ExtraBoldUrl,
  mplus2BlackUrl,
] as const;

let initPromise: Promise<void> | null = null;
let fontDataPromise: Promise<Uint8Array[]> | null = null;

// wasm-bindgen の新形式: URL 文字列ではなく { module_or_path } オブジェクトで渡す
function wasmModule(url: string): WebAssemblyModuleRef {
  return { module_or_path: url } as unknown as WebAssemblyModuleRef;
}

async function loadMplus2FontData(): Promise<Uint8Array[]> {
  if (!fontDataPromise) {
    fontDataPromise = Promise.all(
      MPLUS2_FONT_URLS.map(async (url) => new Uint8Array(await (await fetch(url)).arrayBuffer()))
    ).then((fontData) => {
      const expectedCount = MPLUS2_FONT_URLS.length;
      if (fontData.length !== expectedCount) {
        throw new Error(
          `failed to load M PLUS 2 fonts: expected ${expectedCount}, got ${fontData.length}`
        );
      }
      return fontData;
    });
  }

  return fontDataPromise;
}

/** typst WASM コンパイラ＋レンダラーを遅延初期化する（1セッション1回） */
function ensureCompilerReady(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = loadMplus2FontData()
    .then((fontData) => {
      $typst.setCompilerInitOptions({ getModule: () => wasmModule(compilerWasmUrl) });
      // レンダラーはコンパイラが生成したベクターIRのグリフパスをそのまま変換するため
      // フォントファイルの供給は不要（コンパイラ側のみに供給すれば十分）
      $typst.setRendererInitOptions({ getModule: () => wasmModule(rendererWasmUrl) });
      $typst.use(
        TypstSnippet.preloadFontAssets({ assets: ['text', 'cjk'] }),
        ...fontData.map((font) => TypstSnippet.preloadFontData(font))
      );
    })
    .catch((error) => {
      initPromise = null;
      fontDataPromise = null;
      throw error;
    });
  return initPromise;
}

/** 指定年のカレンダーを SVG 文字列として返す（比較表示用） */
export async function renderCalendarSvgs(year: number): Promise<string[]> {
  await ensureCompilerReady();
  const sources = buildTypstPageSources(buildCalendarYearGrid(year));
  const pages = await Promise.all(sources.map((source) => $typst.svg({ mainContent: source })));

  if (pages.length === 0) {
    throw new Error('typst rendering failed — SVG pages were empty');
  }

  return pages;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = Object.assign(document.createElement('a'), {
    href: url,
    download: filename,
  });

  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** 指定年のカレンダーを PDF としてブラウザダウンロードする */
export async function downloadCalendarPdf(year: number): Promise<void> {
  await ensureCompilerReady();
  const yearGrid = buildCalendarYearGrid(year);
  const source = buildTypstSource(yearGrid);

  const pdfBytes = await $typst.pdf({ mainContent: source });
  if (!pdfBytes) throw new Error('typst compilation failed — PDF bytes were empty');

  triggerDownload(
    new Blob([pdfBytes as BlobPart], { type: 'application/pdf' }),
    `calendar-${yearGrid.year}.pdf`
  );
}
