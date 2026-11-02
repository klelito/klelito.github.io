// Fails when a CV PDF linked from the site is missing or is not a PDF (spec §4.3).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const CV_FILES = ['cv/cv-pl.pdf', 'cv/cv-en.pdf'];
const PDF_MAGIC = '%PDF-';

export function checkCv(publicDir) {
  const errors = [];
  for (const rel of CV_FILES) {
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
  const errors = checkCv('public');
  for (const e of errors) console.error(`check-cv: public/${e}`);
  process.exit(errors.length ? 1 : 0);
}
