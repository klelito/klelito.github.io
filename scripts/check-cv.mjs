// Fails when a CV PDF linked from the site is missing or is not a PDF (spec §4.3).
// Which files are linked comes from SITE.cv; `cv: null` disables CV downloads and this check.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const PDF_MAGIC = '%PDF-';

/** Public-dir-relative CV paths configured in SITE (empty when CV download is disabled). */
export function cvFilesFromSite(site) {
  return site.cv ? [site.cv.pl, site.cv.en].map((p) => p.replace(/^\//, '')) : [];
}

export function checkCv(publicDir, files) {
  const errors = [];
  for (const rel of files) {
    const file = path.join(publicDir, rel);
    if (!fs.existsSync(file)) {
      errors.push(`${rel} is missing`);
      continue;
    }
    const head = fs.readFileSync(file).subarray(0, PDF_MAGIC.length).toString('latin1');
    if (head !== PDF_MAGIC) errors.push(`${rel} is not a PDF`);
  }
  return errors;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { SITE } = await import('../src/config/site.ts');
  const files = cvFilesFromSite(SITE);
  if (files.length === 0) {
    console.log('check-cv: CV download disabled (SITE.cv = null) — nothing to check');
    process.exit(0);
  }
  const errors = checkCv('public', files);
  for (const e of errors) console.error(`check-cv: public/${e}`);
  process.exit(errors.length ? 1 : 0);
}
