// @vitest-environment node
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderCalendarPdfInNode, renderCalendarSvgsInNode } from './svgNode';

/**
 * Typst の SVG 出力はグリフ ID が実行ごとに変わる（Rust の HashMap のハッシュランダム化による）。
 * グリフのパスデータ（d 属性）を基準にソートして <defs> を再構築し ID を振り直すことで
 * 決定的な出力にする。
 */
function normalizeSvgGlyphIds(svg: string): string {
  // <defs class="glyph">...</defs> 全体を抽出
  const defsBlockMatch = /<defs class="glyph">[\s\S]*?<\/defs>/.exec(svg);
  if (!defsBlockMatch) return svg;

  // <defs> 内のすべての <path> を抽出
  const pathRegex = /<path id="([^"]+)"([^/]*\/?>)/g;
  const paths: { id: string; rest: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = pathRegex.exec(defsBlockMatch[0])) !== null) {
    paths.push({ id: m[1]!, rest: m[2]! });
  }

  // d 属性値でソートして決定的な順序にする
  paths.sort((a, b) => {
    const dA = /d="([^"]*)"/.exec(a.rest)?.[1] ?? '';
    const dB = /d="([^"]*)"/.exec(b.rest)?.[1] ?? '';
    return dA < dB ? -1 : dA > dB ? 1 : 0;
  });

  // 旧 ID → 新 ID のマッピング（g0, g1, ...）
  const idMap = new Map(paths.map(({ id }, i) => [id, `g${i}`]));

  // ソート済みの <defs> ブロックを再構築
  const newDefs =
    '<defs class="glyph">' +
    paths.map(({ rest }, i) => `<path id="g${i}"${rest}`).join('') +
    '</defs>';

  // <defs> ブロックを差し替え、body 内の href="#..." と非決定的な data-tid も更新
  return svg
    .replace(/<defs class="glyph">[\s\S]*?<\/defs>/, newDefs)
    .replace(/\bhref="#(g[^"]+)"/g, (_, id: string) => `href="#${idMap.get(id) ?? id}"`)
    .replace(/ data-tid="[^"]*"/g, '');
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
        await expect(normalizeSvgGlyphIds(svg)).toMatchFileSnapshot(
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
