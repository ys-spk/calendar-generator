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

// ── メッセージプロトコル（pdf.ts と共有する型定義） ──────────────────────────

export type TypstWorkerRequest = {
  id: number;
  kind: 'svg' | 'pdf';
  year: number;
};

export type TypstWorkerResponse =
  | { id: number; ok: true; kind: 'svg'; svgs: string[] }
  | { id: number; ok: true; kind: 'pdf'; bytes: Uint8Array }
  | { id: number; ok: false; error: string };

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
  return { module_or_path: url };
}

async function loadMplus2FontData(): Promise<Uint8Array[]> {
  if (!fontDataPromise) {
    fontDataPromise = Promise.all(
      MPLUS2_FONT_URLS.map(async (url) => new Uint8Array(await (await fetch(url)).arrayBuffer()))
    );
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
        // typst 既定フォント（jsDelivr 配信）は使わない。カレンダーの全テキストは
        // #set text(font: "M PLUS 2") で描画されるため、同梱フォントだけで完結する
        TypstSnippet.disableDefaultFontAssets(),
        ...fontData.map((font) => TypstSnippet.preloadFontData(font))
      );
    })
    .catch((error: unknown) => {
      initPromise = null;
      fontDataPromise = null;
      throw error;
    });
  return initPromise;
}

// ── レンダリング ─────────────────────────────────────────────────────────────

/** 指定年のカレンダーをページごとの SVG 文字列として生成する */
async function renderSvgs(year: number): Promise<string[]> {
  await ensureCompilerReady();
  const sources = buildTypstPageSources(buildCalendarYearGrid(year));
  const pages = await Promise.all(sources.map((source) => $typst.svg({ mainContent: source })));

  const emptyPageIndex = pages.findIndex((page) => !page);
  if (emptyPageIndex !== -1) {
    throw new Error(`typst rendering failed — SVG page ${emptyPageIndex + 1} was empty`);
  }

  return pages;
}

/** 指定年のカレンダーを PDF バイト列として生成する */
async function renderPdf(year: number): Promise<Uint8Array> {
  await ensureCompilerReady();
  const source = buildTypstSource(buildCalendarYearGrid(year));

  const pdfBytes = await $typst.pdf({ mainContent: source });
  if (!pdfBytes) throw new Error('typst compilation failed — PDF bytes were empty');

  return pdfBytes;
}

// ── メッセージハンドリング ───────────────────────────────────────────────────

async function handleRequest(request: TypstWorkerRequest): Promise<TypstWorkerResponse> {
  try {
    if (request.kind === 'svg') {
      return { id: request.id, ok: true, kind: 'svg', svgs: await renderSvgs(request.year) };
    }
    return { id: request.id, ok: true, kind: 'pdf', bytes: await renderPdf(request.year) };
  } catch (error) {
    return {
      id: request.id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

self.onmessage = (event: MessageEvent<TypstWorkerRequest>) => {
  void handleRequest(event.data).then((response) => {
    // PDF バイト列はコピーせず所有権ごとメインスレッドへ移譲する（Worker 側で再利用しない）
    const transfer: Transferable[] =
      response.ok && response.kind === 'pdf' ? [response.bytes.buffer as ArrayBuffer] : [];
    self.postMessage(response, { transfer });
  });
};
