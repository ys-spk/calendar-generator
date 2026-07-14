import { LRUCache } from '../lruCache';
import { clampYear } from '../yearValidation';
import type { TypstWorkerRequest, TypstWorkerResponse } from './typstWorker';
import TypstWorker from './typstWorker?worker';

// ── Worker RPC ──────────────────────────────────────────────────────────────
// Typst WASM のコンパイルは重いため Web Worker（typstWorker.ts）で実行し、
// メインスレッドは id 付きリクエストと Promise の対応付けのみを行う。

type SuccessResponse<K extends TypstWorkerRequest['kind']> = Extract<
  TypstWorkerResponse,
  { ok: true; kind: K }
>;

type PendingEntry = {
  resolve: (response: TypstWorkerResponse & { ok: true }) => void;
  reject: (error: Error) => void;
};

let worker: Worker | null = null;
let nextRequestId = 1;
const pendingRequests = new Map<number, PendingEntry>();

function rejectAllPending(error: Error): void {
  for (const { reject } of pendingRequests.values()) reject(error);
  pendingRequests.clear();
}

function handleMessage(event: MessageEvent<TypstWorkerResponse>): void {
  const response = event.data;
  const pending = pendingRequests.get(response.id);
  if (!pending) return;
  pendingRequests.delete(response.id);

  if (response.ok) {
    pending.resolve(response);
  } else {
    pending.reject(new Error(response.error));
  }
}

/** Worker 自体の失敗（スクリプトロード失敗など）: 全リクエストを失敗させ、次回に作り直す */
function handleWorkerFailure(message: string): void {
  rejectAllPending(new Error(message));
  worker?.terminate();
  worker = null;
}

function ensureWorker(): Worker {
  if (worker) return worker;

  const created = new TypstWorker();
  created.onmessage = handleMessage;
  created.onerror = (event) => handleWorkerFailure(event.message || 'typst worker crashed');
  created.onmessageerror = () => handleWorkerFailure('typst worker message could not be parsed');
  worker = created;
  return created;
}

function requestRender<K extends TypstWorkerRequest['kind']>(
  kind: K,
  year: number
): Promise<SuccessResponse<K>> {
  const target = ensureWorker();
  const id = nextRequestId++;

  return new Promise((resolve, reject) => {
    pendingRequests.set(id, {
      resolve: (response) => {
        if (response.kind !== kind) {
          reject(new Error(`unexpected worker response kind: ${response.kind}`));
          return;
        }
        resolve(response as SuccessResponse<K>);
      },
      reject,
    });
    target.postMessage({ id, kind, year } satisfies TypstWorkerRequest);
  });
}

// ── 公開 API ────────────────────────────────────────────────────────────────

// 1年分のSVGは約1MB。12年分でも十数MBに収まる
const SVG_CACHE_MAX_YEARS = 12;
// Promise をキャッシュすることで、同一年のレンダリング実行中の再要求も1回のコンパイルに合流させる
const SVG_CACHE = new LRUCache<number, Promise<string[]>>(SVG_CACHE_MAX_YEARS);

/** 指定年のカレンダーを SVG 文字列として返す（プレビュー表示用、年単位でキャッシュ） */
export function renderCalendarSvgs(year: number): Promise<string[]> {
  // Worker 側の buildCalendarYearGrid と同じ正規化を行い、キャッシュキーを実際の生成年に揃える
  const normalizedYear = clampYear(year);

  const cached = SVG_CACHE.get(normalizedYear);
  if (cached) return cached;

  const promise = requestRender('svg', normalizedYear).then((response) => response.svgs);
  // 失敗した Promise はキャッシュから除去し、次回の要求でリトライさせる
  promise.catch(() => SVG_CACHE.delete(normalizedYear));
  SVG_CACHE.set(normalizedYear, promise);
  return promise;
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
  const normalizedYear = clampYear(year);
  const response = await requestRender('pdf', normalizedYear);

  triggerDownload(
    new Blob([response.bytes as BlobPart], { type: 'application/pdf' }),
    `calendar-${normalizedYear}.pdf`
  );
}
