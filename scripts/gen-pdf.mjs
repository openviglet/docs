#!/usr/bin/env node
/**
 * Turing ES Documentation — PDF Generator
 *
 * Uses a single Puppeteer browser instance to:
 *   1. Render the branded cover (HTML → PDF)
 *   2. Crawl every documentation page following "next" links, printing each to PDF
 *   3. Merge everything into a single PDF with pdf-lib
 *
 * Prerequisites:
 *   - Docusaurus serve running on localhost:3000
 *   - npm dependencies installed (puppeteer, pdf-lib)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PDFDocument } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = join(__dirname, '..');

const COVER_HTML = join(__dirname, 'pdf-cover.html');
const STYLE_CSS  = join(__dirname, 'pdf-style.css');
const OUTPUT_PDF = join(ROOT, 'turing-es-2026.1-documentation.pdf');
const BASE_URL   = process.env.PDF_BASE_URL || 'http://localhost:3000';
const ENTRY_PATH = '/turing/getting-started/intro';

const HEADER_HTML = [
  '<div style="width:100%;padding:0 15mm;font-family:system-ui,sans-serif;',
  'font-size:8px;display:flex;justify-content:space-between;align-items:center;',
  'border-bottom:0.5px solid #FED7AA;padding-bottom:3px;margin-bottom:4px;">',
  '<span style="color:#C2410C;font-weight:700;letter-spacing:0.08em;">TURING ES</span>',
  '<span style="color:#94a3b8;">Documentation</span>',
  '</div>',
].join('');

const FOOTER_HTML = [
  '<div style="width:100%;padding:0 15mm;font-family:system-ui,sans-serif;',
  'font-size:7px;display:flex;justify-content:space-between;align-items:center;',
  'border-top:0.5px solid #e2e8f0;padding-top:3px;margin-top:4px;">',
  '<span style="color:#94a3b8;">viglet.com</span>',
  '<span style="color:#64748b;">',
  '<span class="pageNumber"></span> / <span class="totalPages"></span>',
  '</span></div>',
].join('');

let browser;

async function launchBrowser() {
  const puppeteer = await import('puppeteer');
  browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
}

/* ──────────────────────────────────────────────────────
   Stage 1 — Cover (HTML → PDF)
   ────────────────────────────────────────────────────── */
async function generateCover() {
  console.log('  [1/3]  Rendering cover pages …');

  const page = await browser.newPage();
  const html = readFileSync(COVER_HTML, 'utf-8');

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: false,
  });

  await page.close();
  console.log('         Cover rendered ✓');
  return pdfBuffer;
}

/* ──────────────────────────────────────────────────────
   Stage 2 — Crawl doc pages & print each to PDF
   ────────────────────────────────────────────────────── */
async function generateDocs() {
  console.log('  [2/3]  Generating documentation pages …');

  const cssContent = readFileSync(STYLE_CSS, 'utf-8');
  const page = await browser.newPage();
  const pagePDFs = [];
  let url = `${BASE_URL}${ENTRY_PATH}`;
  const visited = new Set();

  while (url) {
    // Normalise to avoid revisiting with trailing slashes etc.
    const normalized = url.replace(/\/+$/, '');
    if (visited.has(normalized)) break;
    visited.add(normalized);

    const pageNum = visited.size;
    process.stdout.write(`         [${pageNum}] ${normalized.replace(BASE_URL, '')} … `);

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 });

    // Inject our PDF stylesheet
    await page.addStyleTag({ content: cssContent });

    // Small delay for styles to apply
    await new Promise((r) => setTimeout(r, 300));

    // Print this page to PDF
    const pdfBuf = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: HEADER_HTML,
      footerTemplate: FOOTER_HTML,
      margin: { top: '25mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });

    pagePDFs.push(pdfBuf);
    console.log('✓');

    // Find the "next" pagination link
    url = await page.evaluate(() => {
      const next = document.querySelector('a.pagination-nav__link--next');
      return next ? next.href : null;
    });
  }

  await page.close();
  console.log(`         ${pagePDFs.length} pages generated ✓`);
  return pagePDFs;
}

/* ──────────────────────────────────────────────────────
   Stage 3 — Merge all PDFs (pdf-lib)
   ────────────────────────────────────────────────────── */
async function mergePDFs(coverBuf, docBuffers) {
  console.log('  [3/3]  Merging PDFs …');

  const merged = await PDFDocument.create();

  // Cover pages
  const coverDoc   = await PDFDocument.load(coverBuf);
  const coverPages = await merged.copyPages(coverDoc, coverDoc.getPageIndices());
  coverPages.forEach((p) => merged.addPage(p));

  // Documentation pages
  for (const buf of docBuffers) {
    const doc   = await PDFDocument.load(buf);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }

  // Metadata
  merged.setTitle('Turing ES Documentation');
  merged.setSubject('Enterprise Search Platform — v2026.1');
  merged.setAuthor('Viglet');
  merged.setCreator('Viglet PDF Generator');
  merged.setProducer('pdf-lib + Puppeteer');
  merged.setCreationDate(new Date());

  const mergedBytes = await merged.save();
  writeFileSync(OUTPUT_PDF, mergedBytes);

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

  await launchBrowser();

  const coverBuf  = await generateCover();
  const docBufs   = await generateDocs();
  await mergePDFs(coverBuf, docBufs);

  await browser.close();

  console.log();
  console.log(`  ✅  ${OUTPUT_PDF}`);
  console.log();
}

main().catch(async (err) => {
  console.error('\n  ❌  PDF generation failed:\n');
  console.error(err);
  if (browser) await browser.close().catch(() => {});
  process.exit(1);
});
