// Smoke-tests the shadstack-table package as a non-aliased consumer would
// see it. Resolves through the workspace symlink so Node honors the package's
// exports field, then asserts the documented subpaths, locale shape, type
// resolution, and the published tarball contents.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join as joinPath, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const here = dirname(fileURLToPath(import.meta.url));
const requireFn = createRequire(import.meta.url);

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

let checkCount = 0;
const counted = (label, fn) => {
  checkCount += 1;
  check(label, fn);
};
const countedAsync = async (label, fn) => {
  checkCount += 1;
  await checkAsync(label, fn);
};

console.log('verifying shadstack-table package exports...');

// --- ESM resolve + import ----------------------------------------------------

counted('resolve shadstack-table (ESM)', () => {
  const url = import.meta.resolve('shadstack-table');
  assert.match(url, /\/dist\/index\.js$/);
  assert.ok(existsSync(fileURLToPath(url)), 'resolved file does not exist');
});

counted('resolve shadstack-table/style.css', () => {
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

  counted(`resolve ${specifier} (ESM)`, () => {
    const url = import.meta.resolve(specifier);
    assert.match(
      url,
      new RegExp(`/dist/locales/${path.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\.js$`),
    );
    assert.ok(existsSync(fileURLToPath(url)), 'resolved file does not exist');
  });

  // oxlint-disable-next-line no-await-in-loop -- sequential awaits keep ok/FAIL output ordered per locale
  await countedAsync(`import ${specifier} (ESM)`, async () => {
    const mod = await import(specifier);
    assert.ok(
      exportName in mod,
      `expected named export ${exportName}, got [${Object.keys(mod).join(', ')}]`,
    );
    const locale = mod[exportName];
    assert.equal(locale.language, language, 'language mismatch');
    assert.ok(
      typeof locale.actions === 'string' && locale.actions.length > 0,
      `expected non-empty 'actions' string`,
    );
  });
}

// --- CJS require -------------------------------------------------------------

const cjsCases = [
  { path: 'en', exportName: 'SST_Localization_EN', language: 'en' },
  { path: 'pt-BR', exportName: 'SST_Localization_PT_BR', language: 'pt-BR' },
];

for (const { path, exportName, language } of cjsCases) {
  const specifier = `shadstack-table/locales/${path}`;
  counted(`require ${specifier} (CJS)`, () => {
    const resolved = requireFn.resolve(specifier);
    assert.match(
      resolved,
      new RegExp(`/dist/locales/${path.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\.cjs$`),
      `expected resolved path to end in /dist/locales/${path}.cjs, got ${resolved}`,
    );
    const mod = requireFn(specifier);
    assert.ok(
      exportName in mod,
      `expected named export ${exportName}, got [${Object.keys(mod).join(', ')}]`,
    );
    assert.equal(mod[exportName].language, language, 'language mismatch');
  });
}

// --- Type resolution ---------------------------------------------------------
// Spawns tsc against types-check.ts so the exports map's `types` condition is
// validated by a real TypeScript compiler, not just file existence.

counted('tsc --noEmit (types condition + bundler resolution)', () => {
  const result = spawnSync('bun', ['x', 'tsc', '--noEmit', '-p', 'tsconfig.json'], {
    cwd: here,
    encoding: 'utf-8',
  });
  if (result.status !== 0) {
    throw new Error(
      `tsc exited ${result.status}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
    );
  }
});

// --- Pack-shape audit --------------------------------------------------------
// Runs npm pack --dry-run against the workspace package and asserts the tarball
// contents match what we promise to consumers.

counted('npm pack --dry-run shape', () => {
  const indexPath = fileURLToPath(import.meta.resolve('shadstack-table'));
  const pkgRoot = indexPath.replace(/\/dist\/index\.js$/, '');

  const result = spawnSync(
    'npm',
    [
      'pack',
      '--dry-run',
      '--json',
      '--cache',
      resolvePath(here, 'node_modules/.cache/npm-pack'),
      pkgRoot,
    ],
    { encoding: 'utf-8' },
  );
  if (result.status !== 0) {
    throw new Error(`npm pack failed: ${result.stderr}`);
  }

  const data = JSON.parse(result.stdout)[0];
  const files = data.files.map((f) => f.path);

  const testFiles = files.filter((f) => f.includes('__tests__'));
  assert.equal(testFiles.length, 0, `${testFiles.length} __tests__ entries in tarball`);

  const hashedChunks = files.filter((f) => /^dist\/src-[^/]+\.(cjs|js)$/.test(f));
  assert.equal(
    hashedChunks.length,
    0,
    `${hashedChunks.length} hashed dist/src-* chunk(s) — multi-entry build regressed`,
  );

  const localeJs = files.filter((f) => /^dist\/locales\/[^/]+\.js$/.test(f));
  const localeCjs = files.filter((f) => /^dist\/locales\/[^/]+\.cjs$/.test(f));
  const localeDts = files.filter((f) => /^dist\/locales\/[^/]+\.d\.ts$/.test(f));
  assert.ok(localeJs.length >= 39, `expected >=39 locale .js files, got ${localeJs.length}`);
  assert.equal(localeJs.length, localeCjs.length, '.js and .cjs counts differ');
  assert.equal(localeJs.length, localeDts.length, '.js and .d.ts counts differ');

  // Tarball-size budget. Current size is ~474 kB; 700 kB gives headroom for
  // a few extra locales or icons before someone has to think about it again.
  const SIZE_BUDGET = 700_000;
  assert.ok(data.size <= SIZE_BUDGET, `tarball is ${data.size} bytes; budget is ${SIZE_BUDGET}`);
});

// --- Size budget -------------------------------------------------------------
// Asserts the built artifacts stay within explicit gzip-size budgets so CI
// catches accidental size regressions. If a check trips here, investigate
// the diff — don't bump the budget. Budgets are also documented in
// packages/shadstack-table/README.md under "API stability → Size budget".

const distRoot = fileURLToPath(import.meta.resolve('shadstack-table')).replace(
  /\/dist\/index\.js$/,
  '/dist',
);

const gzipLen = (path) => gzipSync(readFileSync(path)).length;

const ESM_GZIP_BUDGET = 60_000;
const CJS_GZIP_BUDGET = 62_000;
const CSS_GZIP_BUDGET = 3_000;
const LOCALE_GZIP_BUDGET = 3_000;
const LOCALE_DIR_RAW_BUDGET = 220_000;

counted(`dist/index.js gzip <= ${ESM_GZIP_BUDGET} bytes`, () => {
  const size = gzipLen(joinPath(distRoot, 'index.js'));
  assert.ok(
    size <= ESM_GZIP_BUDGET,
    `dist/index.js is ${size} bytes gzip; budget is ${ESM_GZIP_BUDGET}`,
  );
});

counted(`dist/index.cjs gzip <= ${CJS_GZIP_BUDGET} bytes`, () => {
  const size = gzipLen(joinPath(distRoot, 'index.cjs'));
  assert.ok(
    size <= CJS_GZIP_BUDGET,
    `dist/index.cjs is ${size} bytes gzip; budget is ${CJS_GZIP_BUDGET}`,
  );
});

counted(`dist/style.css gzip <= ${CSS_GZIP_BUDGET} bytes`, () => {
  const size = gzipLen(joinPath(distRoot, 'style.css'));
  assert.ok(
    size <= CSS_GZIP_BUDGET,
    `dist/style.css is ${size} bytes gzip; budget is ${CSS_GZIP_BUDGET}`,
  );
});

counted(`dist/locales/*.js per-file gzip <= ${LOCALE_GZIP_BUDGET} bytes`, () => {
  const localesDir = joinPath(distRoot, 'locales');
  const files = readdirSync(localesDir).filter((f) => f.endsWith('.js'));
  assert.ok(files.length >= 39, `expected >=39 locale .js files, got ${files.length}`);
  let worst = { file: '', size: 0 };
  for (const file of files) {
    const size = gzipLen(joinPath(localesDir, file));
    if (size > worst.size) {
      worst = { file, size };
    }
  }
  assert.ok(
    worst.size <= LOCALE_GZIP_BUDGET,
    `${worst.file} is ${worst.size} bytes gzip; per-locale budget is ${LOCALE_GZIP_BUDGET}`,
  );
});

counted(`dist/locales/*.js total raw size <= ${LOCALE_DIR_RAW_BUDGET} bytes`, () => {
  const localesDir = joinPath(distRoot, 'locales');
  const files = readdirSync(localesDir).filter((f) => f.endsWith('.js'));
  let total = 0;
  for (const file of files) {
    total += statSync(joinPath(localesDir, file)).size;
  }
  assert.ok(
    total <= LOCALE_DIR_RAW_BUDGET,
    `dist/locales/*.js total is ${total} raw bytes; budget is ${LOCALE_DIR_RAW_BUDGET}`,
  );
});

// --- summary -----------------------------------------------------------------

console.log('');
if (failures.length > 0) {
  console.error(`FAILED: ${failures.length} of ${checkCount} check(s) failed`);
  process.exit(1);
}
console.log(`PASSED: ${checkCount} check(s)`);
