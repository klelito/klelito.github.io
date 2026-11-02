import { test, expect, type Page } from '@playwright/test';
import { projects, projectPath } from './content';

// axe cannot judge text over gradients and blend modes, so sample the real pixels behind the text:
// freeze the aurora at full bloom (reduced motion = the brightest frame), hide the text, screenshot its box,
// and compute the WCAG contrast of the text colour against every background pixel.
const AA_NORMAL = 4.5;

async function worstContrast(page: Page, selector: string): Promise<number> {
  const el = page.locator(selector).first();
  const color = await el.evaluate((e) => getComputedStyle(e).color);
  await page.addStyleTag({ content: `${selector}, ${selector} * { color: transparent !important; }` });
  const png = await page.screenshot({ clip: (await el.boundingBox())! });
  return page.evaluate(
    async ({ b64, color }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const channel = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      const lum = (r: number, g: number, b: number) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      const [tr, tg, tb] = color.match(/\d+(\.\d+)?/g)!.map(Number);
      const lt = lum(tr, tg, tb);
      const ratios: number[] = [];
      for (let i = 0; i < data.length; i += 4) {
        const lb = lum(data[i], data[i + 1], data[i + 2]);
        ratios.push((Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05));
      }
      ratios.sort((a, b) => a - b);
      return ratios[Math.floor(ratios.length * 0.02)]; // 2nd percentile: ignores isolated grain specks
    },
    { b64: png.toString('base64'), color },
  );
}

const CASES: { path: () => string; selector: string }[] = [
  { path: () => '/', selector: '.hero-subtitle' },
  { path: () => '/', selector: '.eyebrow' },
  { path: () => '/en/', selector: '.hero-subtitle' },
  { path: () => projectPath('pl', projects('pl')[0].slug), selector: '.cs-lead' },
  { path: () => projectPath('pl', projects('pl')[0].slug), selector: '.crumbs' },
];

for (const { path, selector } of CASES) {
  test(`text over the aurora meets WCAG AA: ${selector} on ${path()}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path());
    const ratio = await worstContrast(page, selector);
    expect(ratio, `contrast ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL);
  });
}
