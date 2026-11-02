import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ALL_ROUTES } from './routes';

const INTERNAL_HREF_END = /(\/|#[\w-]*|\.[a-z0-9]+)$/;

for (const route of ALL_ROUTES) {
  test.describe(route, () => {
    test('no horizontal overflow', async ({ page }) => {
      await page.goto(route);
      // Compare against the configured viewport, not window.innerWidth: with isMobile emulation Chrome
      // widens the visual viewport to fit overflowing content, so innerWidth hides the overflow.
      // body has overflow-x: clip, so scrollWidth alone would also hide clipped text — check every text run.
      const limit = page.viewportSize()!.width;
      const offenders = await page.evaluate((limit) => {
        // Skip text the user cannot see (closed <details>, display:none, sr-only clip) and
        // text inside deliberately scrollable containers (mobile TOC, diagram).
        const exempt = (el: Element | null): boolean => {
          if (!el || !el.checkVisibility({ visibilityProperty: true, contentVisibilityAuto: true })) return true;
          for (; el && el !== document.body; el = el.parentElement) {
            const cs = getComputedStyle(el);
            if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') return true;
            if (cs.clip !== 'auto' || cs.clipPath !== 'none') return true;
          }
          return false;
        };
        const out: string[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.textContent?.trim() || exempt(node.parentElement)) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const rect of range.getClientRects()) {
            if (rect.width > 1 && (rect.right > limit + 1 || rect.left < -1)) {
              out.push(node.textContent.trim().slice(0, 40));
              break;
            }
          }
        }
        return { offenders: out, scrollWidth: document.documentElement.scrollWidth };
      }, limit);
      expect(offenders.offenders).toEqual([]);
      expect(offenders.scrollWidth).toBeLessThanOrEqual(limit);
    });

    test('internal links end with a slash, hash or file extension', async ({ page }) => {
      await page.goto(route);
      const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) => links.map((a) => a.getAttribute('href')!));
      expect(hrefs.length).toBeGreaterThan(0);
      for (const href of hrefs) expect(href, href).toMatch(INTERNAL_HREF_END);
    });

    test('no serious or critical accessibility violations', async ({ page }) => {
      await page.goto(route);
      const { violations } = await new AxeBuilder({ page }).analyze();
      const blocking = violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`);
      expect(blocking).toEqual([]);
    });

    test('no leaked placeholders in text', async ({ page }) => {
      await page.goto(route);
      const text = await page.locator('body').innerText();
      expect(text).not.toContain('undefined');
      expect(text).not.toContain('[object Object]');
      expect(text).not.toContain('NaN');
    });
  });
}

test('every internal link resolves, including its anchor', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'link graph is identical on both viewports');
  test.setTimeout(120_000);
  const checked = new Map<string, Set<string>>(); // page path → ids present on it

  async function idsOn(pathname: string): Promise<Set<string>> {
    if (!checked.has(pathname)) {
      const res = await request.get(pathname);
      expect(res.status(), `GET ${pathname}`).toBe(200);
      const html = await res.text();
      checked.set(pathname, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
    }
    return checked.get(pathname)!;
  }

  for (const route of ALL_ROUTES) {
    await page.goto(route);
    const hrefs = await page.locator('a[href]').evaluateAll((links) => links.map((a) => a.getAttribute('href')!));
    for (const href of hrefs) {
      if (/^(https?:|mailto:)/.test(href)) continue;
      const url = new URL(href, `http://localhost${route}`);
      const target = href.startsWith('#') ? route : url.pathname;
      const ids = await idsOn(target);
      if (url.hash) expect(ids.has(decodeURIComponent(url.hash.slice(1))), `${route} → ${href}`).toBe(true);
    }
  }
});
