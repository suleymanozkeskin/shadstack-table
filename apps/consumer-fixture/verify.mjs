// Smoke-tests the shadstack-table package as a non-aliased consumer would
// see it. Resolves through the workspace symlink so Node honors the package's
// exports field, then asserts the documented subpaths and locale shape.

import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const failures = [];
const check = (label, fn) => {
  try {
    fn();
    console.log(`  ok  ${label}`);
  } catch (err) {
    failures.push({ label, err });
    console.log(`  FAIL ${label} — ${err.message}`);
  }
};

const checkAsync = async (label, fn) => {
  try {
    await fn();
    console.log(`  ok  ${label}`);
  } catch (err) {
    failures.push({ label, err });
    console.log(`  FAIL ${label} — ${err.message}`);
  }
};

console.log('verifying shadstack-table package exports...');

// Exports map: the package name and documented subpaths must resolve.
check('resolve shadstack-table', () => {
  const url = import.meta.resolve('shadstack-table');
  assert.match(url, /\/dist\/index\.js$/);
  assert.ok(existsSync(fileURLToPath(url)), 'resolved file does not exist');
});

check('resolve shadstack-table/style.css', () => {
  const url = import.meta.resolve('shadstack-table/style.css');
  assert.match(url, /\/dist\/style\.css$/);
  assert.ok(existsSync(fileURLToPath(url)), 'resolved file does not exist');
});

// Locale subpaths — including codes with hyphens and regional suffixes that
// would break naive wildcard handling.
const localeCases = [
  { path: 'en', exportName: 'SST_Localization_EN', language: 'en' },
  { path: 'pt-BR', exportName: 'SST_Localization_PT_BR', language: 'pt-BR' },
  { path: 'zh-Hans', exportName: 'SST_Localization_ZH_HANS', language: 'zh-Hans' },
  { path: 'sr-Latn-RS', exportName: 'SST_Localization_SR_LATN_RS', language: 'sr-Latn-RS' },
  { path: 'fr', exportName: 'SST_Localization_FR', language: 'fr' },
];

for (const { path, exportName, language } of localeCases) {
  const specifier = `shadstack-table/locales/${path}`;

  check(`resolve ${specifier}`, () => {
    const url = import.meta.resolve(specifier);
    assert.match(
      url,
      new RegExp(`/dist/locales/${path.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\.js$`),
    );
    assert.ok(existsSync(fileURLToPath(url)), 'resolved file does not exist');
  });

  // oxlint-disable-next-line no-await-in-loop -- sequential awaits keep ok/FAIL output ordered per locale
  await checkAsync(`import ${specifier} (ESM)`, async () => {
    const mod = await import(specifier);
    assert.ok(
      exportName in mod,
      `expected named export ${exportName}, got [${Object.keys(mod).join(', ')}]`,
    );
    const locale = mod[exportName];
    assert.equal(locale.language, language, `language mismatch`);
    assert.ok(
      typeof locale.actions === 'string' && locale.actions.length > 0,
      `expected non-empty 'actions' string`,
    );
  });
}

// dist/__tests__ must NOT be in the package — if it is, the dts exclude
// regressed.
check('no test declarations shipped', () => {
  const indexUrl = fileURLToPath(import.meta.resolve('shadstack-table'));
  const pkgRoot = indexUrl.replace(/\/dist\/index\.js$/, '');
  assert.ok(
    !existsSync(`${pkgRoot}/dist/__tests__`),
    `dist/__tests__ should not be present in the published package`,
  );
});

console.log('');
if (failures.length > 0) {
  console.error(`FAILED: ${failures.length} check(s) failed`);
  process.exit(1);
}
console.log(`PASSED: ${localeCases.length * 2 + 3} check(s)`);
