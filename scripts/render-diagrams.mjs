#!/usr/bin/env node
/**
 * Pre-renders all Mermaid .mmd diagrams to SVG.
 * Scans the diagrams/ directory and outputs to static/img/diagrams/.
 */

import { readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const DIAGRAMS_DIR = join(ROOT, 'diagrams');
const OUTPUT_DIR = join(ROOT, 'static', 'img', 'diagrams');
const CONFIG = join(ROOT, 'puppeteer-config.json');

const files = readdirSync(DIAGRAMS_DIR).filter(f => f.endsWith('.mmd'));

console.log(`\n  Rendering ${files.length} diagrams …\n`);

for (const file of files) {
  const input = join(DIAGRAMS_DIR, file);
  const output = join(OUTPUT_DIR, file.replace('.mmd', '.svg'));
  const name = basename(file, '.mmd');

  process.stdout.write(`    ${name} … `);

  try {
    execSync(
      `npx mmdc -p "${CONFIG}" -w 900 -H 600 -b transparent -i "${input}" -o "${output}"`,
      { stdio: 'pipe' }
    );
    console.log('✓');
  } catch (err) {
    console.log('✗');
    console.error(`    Error: ${err.message}`);
    process.exit(1);
  }
}

console.log(`\n  ✅ All ${files.length} diagrams rendered to ${OUTPUT_DIR}\n`);
