#!/usr/bin/env node
/**
 * Turing ES Documentation — PDF Generator
 *
 * Uses a single Puppeteer browser instance to:
 *   1. Render the branded cover (HTML → PDF)
 *   2. Crawl every documentation page following "next" links, printing each to PDF
 *   3. Merge everything into a single PDF with pdf-lib
 *   4. Rewrite internal links as in-PDF GoTo hyperlinks
 *
 * Prerequisites:
 *   - Docusaurus serve running on localhost:3000
 *   - npm dependencies installed (puppeteer, pdf-lib)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PDFDocument, PDFName, PDFDict, PDFString, PDFHexString, PDFArray } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = join(__dirname, '..');

const COVER_HTML = join(__dirname, 'pdf-cover.html');
const STYLE_CSS  = join(__dirname, 'pdf-style.css');
const FAVICON    = join(ROOT, 'static', 'img', 'favicon.png');
const OUTPUT_PDF = join(ROOT, 'turing-es-2026.1-documentation.pdf');
const BASE_URL   = process.env.PDF_BASE_URL || 'http://localhost:3000';
const PROD_URL   = process.env.PDF_PROD_URL || 'https://docs.viglet.com';
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
  console.log('  [1/4]  Rendering cover pages …');

  const page = await browser.newPage();

  // Embed favicon as base64 data URI in the cover HTML
  const faviconB64 = readFileSync(FAVICON).toString('base64');
  const faviconDataUri = `data:image/png;base64,${faviconB64}`;
  const html = readFileSync(COVER_HTML, 'utf-8')
    .replaceAll('FAVICON_DATA_URI', faviconDataUri);

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
   Returns { buffers: Buffer[], pageMap: Map<string, number> }
   pageMap maps URL path → starting page index in merged PDF
   ────────────────────────────────────────────────────── */
async function generateDocs(coverPageCount) {
  console.log('  [2/4]  Generating documentation pages …');

  const cssContent = readFileSync(STYLE_CSS, 'utf-8');
  const page = await browser.newPage();
  const buffers = [];
  const pageMap = new Map();   // path → page index in final PDF
  let url = `${BASE_URL}${ENTRY_PATH}`;
  const visited = new Set();
  let cumulativePages = coverPageCount;

  while (url) {
    const normalized = url.replace(/\/+$/, '');
    if (visited.has(normalized)) break;
    visited.add(normalized);

    const docNum = visited.size;
    const path = normalized.replace(BASE_URL, '');
    process.stdout.write(`         [${docNum}] ${path} … `);

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 });

    // Capture next URL BEFORE modifying the DOM
    const nextUrl = await page.evaluate(() => {
      const next = document.querySelector('a.pagination-nav__link--next');
      return next?.href ?? null;
    });

    // Inject our PDF stylesheet
    await page.addStyleTag({ content: cssContent });

    // Remove chrome elements from the DOM
    await page.evaluate(() => {
      const remove = [
        '.navbar', '.nav-root', 'nav.navbar',
        'footer', '.footer',
        '.pagination-nav',
        '.theme-doc-sidebar-container',
        '.theme-doc-breadcrumbs',
        '.theme-doc-toc-mobile',
        '.theme-doc-toc-desktop',
        '.theme-doc-footer',
        '.theme-doc-version-banner',
        '.theme-doc-version-badge',
        '.col--3',
      ];
      for (const sel of remove) {
        document.querySelectorAll(sel).forEach((el) => el.remove());
      }
    });

    // Record page mapping BEFORE printing
    pageMap.set(path, cumulativePages);

    // Print this page to PDF
    const pdfBuf = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: HEADER_HTML,
      footerTemplate: FOOTER_HTML,
      margin: { top: '25mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });

    // Count how many PDF pages this doc produced
    const tmpDoc = await PDFDocument.load(pdfBuf);
    const pageCount = tmpDoc.getPageCount();
    cumulativePages += pageCount;

    buffers.push(pdfBuf);
    console.log(`✓  (${pageCount}p)`);

    url = nextUrl;
  }

  await page.close();
  console.log(`         ${buffers.length} sections generated ✓`);
  return { buffers, pageMap };
}

/* ──────────────────────────────────────────────────────
   Stage 3 — Merge all PDFs (pdf-lib)
   ────────────────────────────────────────────────────── */
async function mergePDFs(coverBuf, docBuffers) {
  console.log('  [3/4]  Merging PDFs …');

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

  return merged;
}

/* ──────────────────────────────────────────────────────
   Stage 4 — Rewrite internal links as in-PDF GoTo
   ────────────────────────────────────────────────────── */

/** Build lookup table: URL path → page index in merged PDF */
function buildPathLookup(pageMap) {
  const lookup = new Map();
  for (const [path, pageIdx] of pageMap) {
    const clean = path.replace(/\/+$/, '');
    lookup.set(clean, pageIdx);
    if (clean.endsWith('/intro')) {
      lookup.set(clean.replace(/\/intro$/, ''), pageIdx);
    }
  }
  return lookup;
}

/** Extract URI string from a PDF annotation's action dict, or null */
function extractAnnotUri(annot, context) {
  const aRef = annot.get(PDFName.of('A'));
  if (!aRef) return null;
  const aDict = context.lookup(aRef);
  if (!(aDict instanceof PDFDict)) return null;

  const sName = aDict.get(PDFName.of('S'));
  if (!sName || sName.toString() !== '/URI') return null;

  const uriObj = aDict.get(PDFName.of('URI'));
  if (!uriObj) return null;
  if (uriObj instanceof PDFString || uriObj instanceof PDFHexString) {
    return { uri: uriObj.decodeText(), aDict };
  }
  return null;
}

/** Resolve a URI to an internal doc path, or null */
function resolveInternalPath(uri) {
  let path = null;
  if (uri.startsWith(BASE_URL))  path = uri.slice(BASE_URL.length);
  else if (uri.startsWith(PROD_URL)) path = uri.slice(PROD_URL.length);
  if (!path) return null;
  const hashIdx = path.indexOf('#');
  return (hashIdx >= 0 ? path.slice(0, hashIdx) : path).replace(/\/+$/, '');
}

async function rewriteInternalLinks(merged, pageMap) {
  console.log('  [4/4]  Rewriting internal links …');

  const context = merged.context;
  const pathToPage = buildPathLookup(pageMap);
  let rewritten = 0;

  for (let i = 0; i < merged.getPageCount(); i++) {
    const annotsRef = merged.getPage(i).node.get(PDFName.of('Annots'));
    if (!annotsRef) continue;

    const annots = context.lookup(annotsRef);
    if (!(annots instanceof PDFArray)) continue;

    for (let j = 0; j < annots.size(); j++) {
      const annot = context.lookup(annots.get(j));
      if (!(annot instanceof PDFDict)) continue;

      const result = extractAnnotUri(annot, context);
      if (!result) continue;

      const pathOnly = resolveInternalPath(result.uri);
      if (!pathOnly) continue;

      const targetIdx = pathToPage.get(pathOnly);
      if (targetIdx === undefined) continue;

      // Rewrite URI action → GoTo action
      const targetRef = merged.getPage(targetIdx).ref;
      result.aDict.set(PDFName.of('S'), PDFName.of('GoTo'));
      result.aDict.delete(PDFName.of('URI'));
      result.aDict.set(PDFName.of('D'), context.obj([targetRef, PDFName.of('Fit')]));
      rewritten++;
    }
  }

  console.log(`         ${rewritten} links rewritten as in-PDF navigation ✓`);
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

  // Stage 1 — Cover
  const coverBuf = await generateCover();
  const coverDoc = await PDFDocument.load(coverBuf);
  const coverPageCount = coverDoc.getPageCount();

  // Stage 2 — Crawl & print docs
  const { buffers, pageMap } = await generateDocs(coverPageCount);

  // Stage 3 — Merge
  const merged = await mergePDFs(coverBuf, buffers);

  // Stage 4 — Rewrite internal links
  await rewriteInternalLinks(merged, pageMap);

  // Save final PDF
  const mergedBytes = await merged.save();
  writeFileSync(OUTPUT_PDF, mergedBytes);

  await browser.close();

  const sizeMB = (mergedBytes.length / 1_048_576).toFixed(2);
  console.log();
  console.log(`  ✅  ${OUTPUT_PDF}  (${sizeMB} MB)`);
  console.log();
}

main().catch(async (err) => {
  console.error('\n  ❌  PDF generation failed:\n');
  console.error(err);
  if (browser) await browser.close().catch(() => {});
  process.exit(1);
});
