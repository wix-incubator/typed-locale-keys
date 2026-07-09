#!/usr/bin/env node
// Copies template files (src/**/*.template.*) into dist/, preserving the
// directory structure relative to src/. Replaces the previous `cpx` dependency,
// which pulled in a vulnerable chokidar@2 -> micromatch@3 -> braces chain
// (GHSA-grv7-fg5c-xmjg) with no patch available for the 1.x/2.x line.
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '..', 'src');
const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const TEMPLATE_RE = /\.template\.[^.]+$/;

function collectTemplates(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectTemplates(fullPath);
    return TEMPLATE_RE.test(entry.name) ? [fullPath] : [];
  });
}

const templates = collectTemplates(SRC_DIR);

for (const srcPath of templates) {
  const relPath = path.relative(SRC_DIR, srcPath);
  const destPath = path.join(DIST_DIR, relPath);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(srcPath, destPath);
}

console.log(`copy-templates: ${templates.length} file(s) copied to dist/`);
