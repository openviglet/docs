#!/usr/bin/env node
/**
 * Turing ES Documentation — PDF Generator
 *
 * Orchestrates three stages:
 *   1. Render the branded cover (HTML → PDF via Puppeteer)
 *   2. Generate documentation pages (mr-pdf)
 *   3. Merge cover + docs into a single PDF (pdf-lib)
 *
 * Prerequisites:
 *   - Docusaurus dev/serve running on localhost:3000
 *   - npm dependencies installed (puppeteer, mr-pdf, pdf-lib, wait-on)
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PDFDocument } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = join(__dirname, '..');

const COVER_HTML  = join(__dirname, 'pdf-cover.html');
const STYLE_CSS   = join(__dirname, 'pdf-style.css');
const COVER_PDF   = join(ROOT, '.cover-tmp.pdf');
const DOCS_PDF    = join(ROOT, '.docs-tmp.pdf');
const OUTPUT_PDF  = join(ROOT, 'turing-es-2026.1-documentation.pdf');
const BASE_URL    = process.env.PDF_BASE_URL || 'http://localhost:3000';
const ENTRY_PATH  = '/turing/getting-started/intro';

/* ──────────────────────────────────────────────────────
   Stage 1 — Cover (Puppeteer)
   ────────────────────────────────────────────────────── */
async function generateCover() {
  console.log('  [1/3]  Rendering cover pages …');

  // Dynamic import so the script still parses even if puppeteer
  // is only available through the mermaid-cli transitive dep.
  const puppeteer = await import('puppeteer');
  const browser   = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const html = readFileSync(COVER_HTML, 'utf-8');

  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Wait for Google Fonts to load
  await page.evaluateHandle('document.fonts.ready');

  await page.pdf({
    path: COVER_PDF,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: false,
  });

  await browser.close();
  console.log('         Cover rendered ✓');
}

/* ──────────────────────────────────────────────────────
   Stage 2 — Documentation pages (mr-pdf)
   ────────────────────────────────────────────────────── */
function generateDocs() {
  console.log('  [2/3]  Generating documentation pages …');

  const cssContent = readFileSync(STYLE_CSS, 'utf-8');

  const headerHtml = [
    '<div style="width:100%;padding:0 15mm;font-family:system-ui,sans-serif;',
    'font-size:8px;display:flex;justify-content:space-between;align-items:center;',
    'border-bottom:0.5px solid #FED7AA;padding-bottom:3px;margin-bottom:4px;">',
    '<span style="color:#C2410C;font-weight:700;letter-spacing:0.08em;">TURING ES</span>',
    '<span style="color:#94a3b8;">Documentation</span>',
    '</div>',
  ].join('');

  const footerHtml = [
    '<div style="width:100%;padding:0 15mm;font-family:system-ui,sans-serif;',
    'font-size:7px;display:flex;justify-content:space-between;align-items:center;',
    'border-top:0.5px solid #e2e8f0;padding-top:3px;margin-top:4px;">',
    '<span style="color:#94a3b8;">viglet.com</span>',
    '<span style="color:#64748b;">',
    '<span class="pageNumber"></span> / <span class="totalPages"></span>',
    '</span></div>',
  ].join('');

  const args = [
    'mr-pdf',
    '--initialDocURLs',    `${BASE_URL}${ENTRY_PATH}`,
    '--contentSelector',   'article',
    '--paginationSelector','a.pagination-nav__link--next',
    '--pdfFormat',         'A4',
    '--pdfMargin',         '25,15,20,15',
    '--cssStyle',          cssContent,
    '--headerTemplate',    headerHtml,
    '--footerTemplate',    footerHtml,
    '--disableTOC',
    '--outputPDFFilename', DOCS_PDF,
  ];

  execFileSync('npx', args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
    timeout: 300_000, // 5 min max
  });

  console.log('         Documentation pages generated ✓');
}

/* ──────────────────────────────────────────────────────
   Stage 3 — Merge (pdf-lib)
   ────────────────────────────────────────────────────── */
async function mergePDFs() {
  console.log('  [3/3]  Merging cover + documentation …');

  const coverBytes = readFileSync(COVER_PDF);
  const docsBytes  = readFileSync(DOCS_PDF);

  const merged  = await PDFDocument.create();

  // Copy cover pages (cover + inner title)
  const coverDoc   = await PDFDocument.load(coverBytes);
  const coverPages = await merged.copyPages(coverDoc, coverDoc.getPageIndices());
  coverPages.forEach((p) => merged.addPage(p));

  // Copy documentation pages
  const docsDoc   = await PDFDocument.load(docsBytes);
  const docsPages = await merged.copyPages(docsDoc, docsDoc.getPageIndices());
  docsPages.forEach((p) => merged.addPage(p));

  // Metadata
  merged.setTitle('Turing ES Documentation');
  merged.setSubject('Enterprise Search Platform — v2026.1');
  merged.setAuthor('Viglet');
  merged.setCreator('Viglet PDF Generator');
  merged.setProducer('pdf-lib + Puppeteer + mr-pdf');
  merged.setCreationDate(new Date());

  const mergedBytes = await merged.save();
  writeFileSync(OUTPUT_PDF, mergedBytes);

  // Clean up temp files
  try { unlinkSync(COVER_PDF); } catch { /* ignore */ }
  try { unlinkSync(DOCS_PDF);  } catch { /* ignore */ }

  const sizeMB = (mergedBytes.length / 1_048_576).toFixed(2);
  console.log(`         Merged PDF saved (${sizeMB} MB) ✓`);
}

/* ──────────────────────────────────────────────────────
   Main
   ────────────────────────────────────────────────────── */
async function main() {
  console.log();
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║   Turing ES — PDF Documentation Builder  ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log();

  await generateCover();
  generateDocs();
  await mergePDFs();

  console.log();
  console.log(`  ✅  ${OUTPUT_PDF}`);
  console.log();
}

main().catch((err) => {
  console.error('\n  ❌  PDF generation failed:\n');
  console.error(err);
  process.exit(1);
});
