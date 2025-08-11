// scripts/build_share_cards.mjs
import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dataPath = join(root, 'data', 'projects.json');
const outDir = join(root, 'share');
mkdirSync(outDir, { recursive: true });

const projects = JSON.parse(readFileSync(dataPath, 'utf-8'));
const serverRoot = 'file://' + root + '/';

const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

for (const p of projects) {
  const name = encodeURIComponent((p.name||'').slice(0,60));
  const desc = encodeURIComponent((p.description||'').slice(0,120));
  const cur = encodeURIComponent(+p.currentAmount||0);
  const goal = encodeURIComponent(+p.goalAmount||1);
  const img = encodeURIComponent((p.images&&p.images[0]) || 'images/login_cat2.jpg');
  const url = `${serverRoot}scripts/share_template.html?name=${name}&desc=${desc}&cur=${cur}&goal=${goal}&img=${img}`;
  await page.goto(url, { waitUntil: 'networkidle0' });
  // Wait for title change
  await page.waitForFunction(() => document.title === 'ready', { timeout: 5000 }).catch(()=>{});
  const buf = await page.screenshot({ type: 'png' });
  writeFileSync(join(outDir, `${p.id}.png`), buf);
  console.log('Wrote share image for', p.id);
}
await browser.close();
