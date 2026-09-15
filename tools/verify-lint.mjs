import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

const directory = mkdtempSync(join(root, '.lint-contract-'));

const timeoutMilliseconds = 60_000;

const lint = (name, source) => {
  const path = join(directory, `${name}.tsx`);
  writeFileSync(path, source);

  const result = spawnSync(join(root, 'node_modules/.bin/oxlint'), ['--format', 'json', path], {
    cwd: root,
    encoding: 'utf8',
    timeout: timeoutMilliseconds,
    maxBuffer: 1_048_576,
  });

  assert.ifError(result.error);
  assert.equal(result.signal, null, `${name}: lint terminated by a signal`);
  assert.ok(result.status === 0 || result.status === 1, result.stderr);

  return JSON.parse(result.stdout).diagnostics;
};

try {
  const buttonImport = "import { Button } from '../packages/shadstack-table/src/_ui/button';\n\n";

  const allowed = lint(
    'allowed',
    `${buttonImport}export const Example = () => <Button className="w-full mt-2" size="sm">Save</Button>;`,
  );

  assert.equal(allowed.length, 0, JSON.stringify(allowed));

  const restyled = lint(
    'restyled',
    `${buttonImport}export const Example = () => <Button className="rounded-none p-8">Save</Button>;`,
  );

  assert.ok(
    restyled.some((finding) => finding.code === 'shadcn(no-restyle)'),
    JSON.stringify(restyled),
  );

  const assertions = lint('assertions', "export const value = 'text' as unknown as number;");
  assert.ok(
    assertions.some((finding) => finding.code === 'anti-slop(no-chained-type-assertions)'),
    JSON.stringify(assertions),
  );
  console.log(
    'Lint contracts pass: allowed Button placement, rejected restyling, rejected double assertion.',
  );
} finally {
  rmSync(directory, { recursive: true, force: true });
}
