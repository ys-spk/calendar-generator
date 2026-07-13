import { readFileSync } from 'node:fs';
import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler';
import { buildCalendarYearGrid, buildTypstPageSources, buildTypstSource } from './document';

// アプリ本体と同じ TTF を Node テストでも使い、PDF 埋め込み条件を揃える。
function loadFontBlobs(): Buffer[] {
  return [
    readFileSync(new URL('../../assets/fonts/MPLUS2-Regular.ttf', import.meta.url)),
    readFileSync(new URL('../../assets/fonts/MPLUS2-Medium.ttf', import.meta.url)),
    readFileSync(new URL('../../assets/fonts/MPLUS2-Bold.ttf', import.meta.url)),
    readFileSync(new URL('../../assets/fonts/MPLUS2-ExtraBold.ttf', import.meta.url)),
    readFileSync(new URL('../../assets/fonts/MPLUS2-Black.ttf', import.meta.url)),
  ];
}

// フォント読み込みとコンパイラ初期化はテスト実行中に1回だけ行う
let compilerPromise: Promise<NodeCompiler> | null = null;

function getCompiler(): Promise<NodeCompiler> {
  if (!compilerPromise) {
    compilerPromise = Promise.resolve()
      .then(() => {
        const fontBlobs = loadFontBlobs();
        return NodeCompiler.create({ fontArgs: [{ fontBlobs }] });
      })
      .catch((error) => {
        compilerPromise = null;
        throw error;
      });
  }
  return compilerPromise;
}

function compileSource(
  compiler: NodeCompiler,
  source: string
): ReturnType<NodeCompiler['compile']>['result'] {
  const result = compiler.compile({ mainFileContent: source });
  if (result.hasError()) {
    result.printDiagnostics();
    throw new Error('Typst compilation failed');
  }
  return result.result;
}

/** Node.js 環境で Typst ソースを SVG にコンパイルする（テスト専用） */
export async function renderCalendarSvgsInNode(year: number): Promise<string[]> {
  const compiler = await getCompiler();
  const sources = buildTypstPageSources(buildCalendarYearGrid(year));
  return sources.map((source) => compiler.svg(compileSource(compiler, source)!));
}

/** Node.js 環境で Typst ソースを PDF にコンパイルする（テスト専用） */
export async function renderCalendarPdfInNode(year: number): Promise<Buffer> {
  const compiler = await getCompiler();
  const source = buildTypstSource(buildCalendarYearGrid(year));
  return compiler.pdf(compileSource(compiler, source)!);
}
