import { readFileSync, existsSync } from 'fs';

const BASE_PATH = process.env.BASE_PATH ?? '/website';
let failed = false;

function check(label, file, test) {
  if (!existsSync(file)) {
    console.error(`FAIL [${label}]: file not found: ${file}`);
    failed = true;
    return;
  }
  const content = readFileSync(file, 'utf8');
  const result = test(content);
  if (result === true) {
    console.log(`PASS [${label}]`);
  } else {
    console.error(`FAIL [${label}]: ${result}`);
    failed = true;
  }
}

// Redirect check
check(
  'root redirect points to base/de',
  'dist/index.html',
  c => c.includes(`url=${BASE_PATH}/de`) || `expected url=${BASE_PATH}/de, got: ${c.match(/url=[^\s"<]*/)?.[0] ?? '(not found)'}`
);

// No old /woic/ paths
for (const page of ['dist/de/index.html', 'dist/en/index.html']) {
  check(
    `no /woic/ paths in ${page}`,
    page,
    c => !c.includes('/woic/') || 'still contains /woic/ paths'
  );
}

// Nav links use correct base
check(
  'nav links use correct base path',
  'dist/de/index.html',
  c => c.includes(`href="${BASE_PATH}/de"`) || `expected href="${BASE_PATH}/de" in nav`
);

// Images use correct base
check(
  'favicon uses correct base path',
  'dist/de/index.html',
  c => c.includes(`${BASE_PATH}/assets/images/`) || `expected ${BASE_PATH}/assets/images/ in img src`
);

// No concatenated paths (e.g. /websitede, /websiteassets)
check(
  'no incorrectly concatenated paths',
  'dist/de/index.html',
  c => {
    const bad = c.match(/href="\/website[a-z]/g) ?? [];
    return bad.length === 0 || `found bad paths: ${[...new Set(bad)].join(', ')}`;
  }
);

if (failed) {
  console.error('\nBuild verification FAILED');
  process.exit(1);
} else {
  console.log('\nBuild verification passed');
}
