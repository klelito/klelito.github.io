// Run by `npm install` (prepare): points git at .githooks so the pre-push hook runs the confidentiality guard
// BEFORE anything reaches the public repository. Silently does nothing outside a git checkout.
import { spawnSync } from 'node:child_process';

const inRepo = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { encoding: 'utf8' });
if (inRepo.status === 0 && inRepo.stdout.trim() === 'true') {
  spawnSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'inherit' });
}
