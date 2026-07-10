import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const sourcePath = resolve(projectRoot, 'node_modules/date-holidays/data/holidays.json');
const outputPath = resolve(projectRoot, 'src/data/holidays-jp.json');

type HolidaysSource = {
  version: string;
  license: string;
  holidays: { JP: unknown };
  names: unknown;
};

type JapaneseHolidayNames = Record<string, { name: { ja: string } | {} }>;

function isHolidaysSource(value: unknown): value is HolidaysSource {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const holidays = candidate.holidays;

  return (
    typeof candidate.version === 'string' &&
    typeof candidate.license === 'string' &&
    typeof candidate.names === 'object' &&
    candidate.names !== null &&
    typeof holidays === 'object' &&
    holidays !== null &&
    'JP' in holidays
  );
}

function extractJapaneseNames(names: unknown): JapaneseHolidayNames {
  if (typeof names !== 'object' || names === null) {
    throw new Error('Holiday names data is missing in date-holidays data source.');
  }

  const result: JapaneseHolidayNames = {};
  const namesByCode = names as Record<string, unknown>;

  for (const [holidayCode, holidayNameValue] of Object.entries(namesByCode)) {
    if (typeof holidayNameValue !== 'object' || holidayNameValue === null) {
      continue;
    }

    const holidayNameRecord = holidayNameValue as { name?: unknown };
    if (typeof holidayNameRecord.name !== 'object' || holidayNameRecord.name === null) {
      continue;
    }

    const nameByLocale = holidayNameRecord.name as Record<string, unknown>;

    if (typeof nameByLocale?.jp === 'string') {
      result[holidayCode] = { name: { jp: nameByLocale.jp } };
    }
  }

  return result;
}

async function main() {
  const sourceRaw = await readFile(sourcePath, 'utf8');
  const parsed = JSON.parse(sourceRaw) as unknown;

  if (!isHolidaysSource(parsed)) {
    throw new Error('JP holiday data is missing in date-holidays data source.');
  }

  const source = parsed;
  const output = {
    version: source.version,
    license: source.license,
    holidays: { JP: source.holidays.JP },
    names: extractJapaneseNames(source.names),
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(output)}\n`, 'utf8');
  console.log(`Generated ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
