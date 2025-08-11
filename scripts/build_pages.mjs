// scripts/build_pages.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dataPath = join(root, 'data', 'projects.json');
const outDir = join(root, 'p');
mkdirSync(outDir, { recursive: true });

const tpl = readFileSync(join(__dirname, 'p_template.html'), 'utf-8');
const projects = JSON.parse(readFileSync(dataPath, 'utf-8'));

for (const p of projects) {
  const html = tpl
    .replaceAll('{{TITLE}}', (p.name||'').slice(0,70))
    .replaceAll('{{DESC}}', (p.description||'').slice(0,140))
    .replaceAll('{{ID}}', String(p.id));
  writeFileSync(join(outDir, `${p.id}.html`), html, 'utf-8');
}
console.log(`Generated ${projects.length} per-project pages in /p`);
