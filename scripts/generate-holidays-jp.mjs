import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const sourcePath = resolve(projectRoot, 'node_modules/date-holidays/data/holidays.json');
const outputPath = resolve(projectRoot, 'src/data/holidays-jp.json');

async function main() {
  const sourceRaw = await readFile(sourcePath, 'utf8');
  const source = JSON.parse(sourceRaw);

  if (!source?.holidays?.JP || !source?.names) {
    throw new Error('JP holiday data is missing in date-holidays data source.');
  }

  const output = {
    version: source.version,
    license: source.license,
    holidays: { JP: source.holidays.JP },
    names: source.names,
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(output)}\n`, 'utf8');
  console.log(`Generated ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
