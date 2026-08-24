// @vitest-environment node
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderCalendarPdfInNode, renderCalendarSvgsInNode } from './svgNode';

/**
 * Typst の SVG 出力には実行ごとに変わるランダム ID が含まれる（Rust の HashMap のハッシュランダム化）。
 * - グリフ ID（href="#gXXX"）: SVG 本文での初出順で振り直し、d 属性（フォント固有パス）は除去
 * - クリップパス ID（clip-path="url(#cXXX)"）: 本文での初出順で振り直し
 * これによりフォント・Typst のマイナーアップデートやアーキテクチャの違いに耐えるスナップショットになる。
 */
function normalizeSvg(svg: string): string {
  // ---- グリフ正規化 ----
  const defsBlockMatch = /<defs class="glyph">[\s\S]*?<\/defs>/.exec(svg);
  if (defsBlockMatch) {
    const pathRegex = /<path id="([^"]+)"/g;
    const ids: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = pathRegex.exec(defsBlockMatch[0])) !== null) ids.push(m[1]!);

    // SVG 本文での href 初出順を記録
    const bodyStart = defsBlockMatch.index + defsBlockMatch[0].length;
    const glyphOrder = new Map<string, number>();
    let order = 0;
    const hrefRegex = /href="#(g[^"]+)"/g;
    let hm: RegExpExecArray | null;
    while ((hm = hrefRegex.exec(svg.slice(bodyStart))) !== null) {
      const id = hm[1]!;
      if (!glyphOrder.has(id)) glyphOrder.set(id, order++);
    }

    // 初出順でソート（未参照グリフは元の位置順を保持）
    const sorted = ids
      .map((id, origIndex) => ({ id, origIndex }))
      .sort((a, b) => {
        const oa = glyphOrder.get(a.id) ?? Infinity;
        const ob = glyphOrder.get(b.id) ?? Infinity;
        return oa !== ob ? oa - ob : a.origIndex - b.origIndex;
      });

    const glyphMap = new Map(sorted.map(({ id }, i) => [id, `g${i}`]));

    // defs 未定義の孤立グリフ（スペース文字など）も初出順で番号を振る
    let phantomOrder = sorted.length;
    for (const [id] of glyphOrder) {
      if (!glyphMap.has(id)) glyphMap.set(id, `g${phantomOrder++}`);
    }

    const newDefs =
      '<defs class="glyph">' +
      sorted.map((_, i) => `<path id="g${i}" class="outline_glyph" d=""/>`).join('') +
      '</defs>';

    svg = svg
      .replace(/<defs class="glyph">[\s\S]*?<\/defs>/, newDefs)
      .replace(/\bhref="#(g[^"]+)"/g, (_, id: string) => `href="#${glyphMap.get(id) ?? id}"`);
  }

  // ---- クリップパス正規化 ----
  // clip-path ID は <clipPath id="cXXX"> としてインライン定義され url(#cXXX) で参照される
  const clipOrder = new Map<string, number>();
  let clipCount = 0;
  const clipRefRegex = /clip-path="url\(#([^)]+)\)"|<clipPath id="([^"]+)"/g;
  let cm: RegExpExecArray | null;
  while ((cm = clipRefRegex.exec(svg)) !== null) {
    const id = cm[1] ?? cm[2]!;
    if (!clipOrder.has(id)) clipOrder.set(id, clipCount++);
  }
  const clipMap = new Map([...clipOrder].map(([id, i]) => [id, `c${i}`]));

  svg = svg
    .replace(
      /clip-path="url\(#([^)]+)\)"/g,
      (_, id: string) => `clip-path="url(#${clipMap.get(id) ?? id})"`
    )
    .replace(
      /<clipPath id="([^"]+)"/g,
      (_, id: string) => `<clipPath id="${clipMap.get(id) ?? id}"`
    );

  return svg.replace(/ data-tid="[^"]*"/g, '');
}

const SNAPSHOT_DIR = join(import.meta.dirname, 'svgNode.test-snapshots');

// フォント取得（~2MB）を含むため余裕を持ったタイムアウトを設定
// 2回目以降はコンパイラがキャッシュされるため高速
const TIMEOUT = 60_000;

describe('typstSvgNode', () => {
  it(
    '2026年のカレンダーSVGが5ページ生成される',
    async () => {
      const svgs = await renderCalendarSvgsInNode(2026);

      expect(svgs).toHaveLength(5);

      for (const [i, svg] of svgs.entries()) {
        await expect(normalizeSvg(svg)).toMatchFileSnapshot(
          join(SNAPSHOT_DIR, `calendar-2026-page-${i + 1}.svg`)
        );
      }
    },
    TIMEOUT
  );

  it(
    '2026年のカレンダーPDFが有効なPDFとして生成される',
    async () => {
      const pdf = await renderCalendarPdfInNode(2026);

      expect(pdf.subarray(0, 5).toString('ascii')).toBe('%PDF-');
      // 5ページ分として最低限のサイズ（目安: 50KB 以上）
      expect(pdf.length).toBeGreaterThan(50_000);
    },
    TIMEOUT
  );
});
