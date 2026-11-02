// One-off: writes placeholder CV PDFs so the site builds before the owner supplies real ones (spec §9).
// Usage: node scripts/make-placeholder-cv.mjs
import fs from 'node:fs';
import { chromium } from '@playwright/test';

const LABELS = { pl: 'CV — wersja robocza (PL)', en: 'CV — draft (EN)' };

fs.mkdirSync('public/cv', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [locale, label] of Object.entries(LABELS)) {
  await page.setContent(`<html lang="${locale}"><body style="font-family: sans-serif"><h1>${label}</h1></body></html>`);
  await page.pdf({ path: `public/cv/cv-${locale}.pdf`, format: 'A4' });
  console.log(`wrote public/cv/cv-${locale}.pdf`);
}
await browser.close();
