import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

/**
 * opentype.js は WOFF→TTF 変換時に head テーブルの created/modified を
 * new Date() で上書きするため実行ごとに出力が変わる。
 * TTF バイナリを受け取り created/modified を 0 に固定し
 * 関連チェックサムを再計算することで出力を決定的にする。
 */
function fixFontTimestamps(ttf: Buffer): Buffer {
  const buf = Buffer.from(ttf);
  const numTables = buf.readUInt16BE(4);

  for (let i = 0; i < numTables; i++) {
    const dirOffset = 12 + i * 16;
    if (buf.toString('ascii', dirOffset, dirOffset + 4) !== 'head') continue;

    const tableOffset = buf.readUInt32BE(dirOffset + 8);
    const tableLength = buf.readUInt32BE(dirOffset + 12);

    // created (head +20, 8 bytes) と modified (head +28, 8 bytes) を 0 に固定
    buf.fill(0, tableOffset + 20, tableOffset + 36);
    // font-wide チェックサム計算の前提として checkSumAdjustment をいったん 0 に
    buf.writeUInt32BE(0, tableOffset + 8);

    // head テーブルの directory entry チェックサムを再計算
    buf.writeUInt32BE(computeChecksum(buf, tableOffset, tableLength), dirOffset + 4);

    // font-wide checkSumAdjustment を再計算
    const fontCs = computeChecksum(buf, 0, buf.length);
    buf.writeUInt32BE((0xb1b0afba - fontCs) >>> 0, tableOffset + 8);

    break;
  }

  return buf;
}

function computeChecksum(buf: Buffer, offset: number, length: number): number {
  let sum = 0;
  const end = Math.min(offset + ((length + 3) & ~3), buf.length - 3);
  for (let i = offset; i < end; i += 4) {
    sum = (sum + buf.readUInt32BE(i)) >>> 0;
  }
  return sum;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const fontsourceDir = resolve(projectRoot, 'node_modules/@fontsource/m-plus-2/files');
const outputDir = resolve(projectRoot, 'src/assets/fonts');

type FontEntry = {
  woff: string;
  output: string;
  subfamily: string;
  postScriptName: string;
};

const FONT_MAP: FontEntry[] = [
  {
    woff: 'm-plus-2-japanese-400-normal.woff',
    output: 'MPLUS2-Regular.ttf',
    subfamily: 'Regular',
    postScriptName: 'MPLUS2-Regular',
  },
  {
    woff: 'm-plus-2-japanese-500-normal.woff',
    output: 'MPLUS2-Medium.ttf',
    subfamily: 'Medium',
    postScriptName: 'MPLUS2-Medium',
  },
  {
    woff: 'm-plus-2-japanese-700-normal.woff',
    output: 'MPLUS2-Bold.ttf',
    subfamily: 'Bold',
    postScriptName: 'MPLUS2-Bold',
  },
  {
    woff: 'm-plus-2-japanese-800-normal.woff',
    output: 'MPLUS2-ExtraBold.ttf',
    subfamily: 'ExtraBold',
    postScriptName: 'MPLUS2-ExtraBold',
  },
  {
    woff: 'm-plus-2-japanese-900-normal.woff',
    output: 'MPLUS2-Black.ttf',
    subfamily: 'Black',
    postScriptName: 'MPLUS2-Black',
  },
];

async function convertFont(entry: FontEntry): Promise<void> {
  const inputPath = resolve(fontsourceDir, entry.woff);
  const outputPath = resolve(outputDir, entry.output);

  try {
    await access(outputPath);
    console.log(`Skipped ${entry.output} (already exists)`);
    return;
  } catch {
    // ファイルが存在しない場合は生成を続行
  }

  const woffBuf = await readFile(inputPath);
  const font = opentype.parse(woffBuf.buffer);

  // Fontsource の woff サブセットは family 名に weight 名が混入している（例: "M PLUS 2 Thin"）
  // typst が font: "M PLUS 2" で検索できるよう標準的な名前に修正する
  font.names.fontFamily = { en: 'M PLUS 2' };
  font.names.fontSubfamily = { en: entry.subfamily };
  font.names.fullName = { en: `M PLUS 2 ${entry.subfamily}` };
  font.names.postScriptName = { en: entry.postScriptName };

  const outBuf = fixFontTimestamps(Buffer.from(font.toArrayBuffer()));
  await writeFile(outputPath, outBuf);
  console.log(`Generated ${entry.output} (${outBuf.length.toLocaleString()} bytes)`);
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  await Promise.all(FONT_MAP.map(convertFont));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
