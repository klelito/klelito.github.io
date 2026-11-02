// Renders public/og-<locale>.png (1200×630) from scripts/og-template.html and the site's own copy.
// Re-run after changing the name or the hero headline: npm run og
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { SITE } from '../src/config/site.ts';
import { ui } from '../src/i18n/ui.ts';

const template = pathToFileURL(path.resolve('scripts/og-template.html')).href;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

for (const locale of ['pl', 'en']) {
  const s = ui[locale];
  await page.goto(template);
  await page.evaluate(
    (slots) => {
      for (const [slot, text] of Object.entries(slots)) document.querySelector(`[data-slot="${slot}"]`).textContent = text;
    },
    {
      name: SITE.name,
      before: s['hero.titleBefore'],
      accent: s['hero.titleAccent'],
      after: s['hero.titleAfter'],
      eyebrow: s['hero.eyebrow'],
    },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `public/og-${locale}.png` });
  console.log(`wrote public/og-${locale}.png`);
}

await browser.close();
