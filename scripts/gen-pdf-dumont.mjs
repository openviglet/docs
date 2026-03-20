#!/usr/bin/env node
/**
 * Dumont DEP Documentation — PDF Generator
 *
 * Pipeline:
 *   1. Render branded cover (HTML → PDF)
 *   2. Crawl doc pages, collect titles & print each to PDF
 *   3. Generate a Table of Contents page from collected titles
 *   4. Merge: cover + TOC + docs
 *   5. Rewrite internal links as in-PDF GoTo hyperlinks
 *   6. Stamp page numbers (skipping cover + TOC)
 *
 * Prerequisites: Docusaurus serve on localhost:3000, puppeteer, pdf-lib
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PDFDocument, PDFName, PDFDict, PDFString, PDFHexString, PDFArray, StandardFonts, rgb } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = join(__dirname, '..');

const COVER_HTML = join(__dirname, 'pdf-cover-dumont.html');
const STYLE_CSS  = join(__dirname, 'pdf-style.css');
const FAVICON    = join(ROOT, 'static', 'img', 'favicon.png');
const OUTPUT_PDF = join(ROOT, 'dumont-dep-2026.1-documentation.pdf');
const BASE_URL   = process.env.PDF_BASE_URL || 'http://localhost:3000';
const PROD_URL   = process.env.PDF_PROD_URL || 'https://docs.viglet.com';
const ENTRY_PATH = '/dumont/getting-started/intro';

const HEADER_HTML = [
  '<div style="width:100%;padding:0 15mm;font-family:system-ui,sans-serif;',
  'font-size:8px;display:flex;justify-content:space-between;align-items:center;',
  'border-bottom:0.5px solid #FED7AA;padding-bottom:3px;margin-bottom:4px;">',
  '<span style="color:#C2410C;font-weight:700;letter-spacing:0.08em;">DUMONT DEP</span>',
  '<span style="color:#94a3b8;">Documentation</span>',
  '</div>',
].join('');

const FOOTER_HTML = [
  '<div style="width:100%;padding:0 15mm;font-family:system-ui,sans-serif;',
  'font-size:7px;display:flex;justify-content:space-between;align-items:center;',
  'border-top:0.5px solid #e2e8f0;padding-top:3px;margin-top:4px;">',
  '<span style="color:#94a3b8;">viglet.com</span>',
  '<span style="color:#64748b;">&nbsp;</span>',
  '</div>',
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
  console.log('  [1/6]  Rendering cover pages …');
  const page = await browser.newPage();

  const faviconB64 = readFileSync(FAVICON).toString('base64');
  const faviconDataUri = `data:image/png;base64,${faviconB64}`;
  const html = readFileSync(COVER_HTML, 'utf-8').replaceAll('FAVICON_DATA_URI', faviconDataUri);

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');

  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: false });
  await page.close();
  console.log('         Cover rendered ✓');
  return pdfBuffer;
}

/* ──────────────────────────────────────────────────────
   Stage 2 — Crawl doc pages & print each to PDF
   ────────────────────────────────────────────────────── */
async function crawlDocs() {
  console.log('  [2/6]  Crawling documentation pages …');

  const cssContent = readFileSync(STYLE_CSS, 'utf-8');
  const page = await browser.newPage();
  const buffers = [];
  const entries = [];
  let url = `${BASE_URL}${ENTRY_PATH}`;
  const visited = new Set();

  while (url) {
    const normalized = url.replace(/\/+$/, '');
    if (visited.has(normalized)) break;
    visited.add(normalized);

    const path = normalized.replace(BASE_URL, '');
    process.stdout.write(`         [${visited.size}] ${path} … `);

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 });

    const { nextUrl, title } = await page.evaluate(() => {
      const next = document.querySelector('a.pagination-nav__link--next');
      const h1 = document.querySelector('article h1, article h2, header h1');
      return {
        nextUrl: next?.href ?? null,
        title: h1?.textContent?.trim() ?? document.title.replace(/ \|.*$/, '').trim(),
      };
    });

    await page.addStyleTag({ content: cssContent });

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

    const pdfBuf = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: HEADER_HTML,
      footerTemplate: FOOTER_HTML,
      margin: { top: '25mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });

    const tmpDoc = await PDFDocument.load(pdfBuf);
    const pageCount = tmpDoc.getPageCount();

    buffers.push(pdfBuf);
    entries.push({ path, title, pageCount });
    console.log(`✓  (${pageCount}p)`);

    url = nextUrl;
  }

  await page.close();
  console.log(`         ${entries.length} sections crawled ✓`);
  return { buffers, entries };
}

/* ──────────────────────────────────────────────────────
   Stage 3 — Generate Table of Contents HTML → PDF
   ────────────────────────────────────────────────────── */
function buildTocHtml(entries, tocStartPage) {
  let currentPage = tocStartPage;

  const rows = entries.map((e) => {
    const pg = currentPage;
    currentPage += e.pageCount;
    return `
      <tr>
        <td style="padding:7px 0;border-bottom:1px solid #f1f5f9;">
          <span style="font-weight:600;color:#1e293b;font-size:10.5pt;">${e.title}</span>
        </td>
        <td style="padding:7px 0;border-bottom:1px solid #f1f5f9;text-align:right;
                    font-family:'JetBrains Mono',monospace;font-size:9pt;color:#94a3b8;
                    white-space:nowrap;width:40px;">
          ${pg}
        </td>
      </tr>`;
  });

  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 210mm; min-height: 297mm;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    color: #0f172a; padding: 30mm 25mm 25mm 25mm;
  }

  .toc-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 8mm;
  }
  .toc-bar {
    width: 5px; height: 28px; border-radius: 3px;
    background: linear-gradient(180deg, #C2410C, #F97316);
  }
  .toc-title {
    font-size: 22pt; font-weight: 800; color: #0f172a;
    letter-spacing: -0.02em;
  }
  .toc-divider {
    height: 2px; margin-bottom: 6mm;
    background: linear-gradient(90deg, #C2410C 0%, #FED7AA 50%, transparent 100%);
    border-radius: 1px;
  }

  table { width: 100%; border-collapse: collapse; }
</style>
</head><body>
  <div class="toc-header">
    <div class="toc-bar"></div>
    <div class="toc-title">Table of Contents</div>
  </div>
  <div class="toc-divider"></div>
  <table>${rows.join('')}</table>
</body></html>`;
}

async function generateToc(entries, firstDocPage) {
  console.log('  [3/6]  Generating Table of Contents …');

  const page = await browser.newPage();
  const html = buildTocHtml(entries, firstDocPage);

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');

  const pdfBuf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
  });

  await page.close();

  const tocDoc = await PDFDocument.load(pdfBuf);
  const tocPageCount = tocDoc.getPageCount();
  console.log(`         TOC rendered (${tocPageCount}p) ✓`);
  return { pdfBuf, tocPageCount };
}

/* ──────────────────────────────────────────────────────
   Add clickable GoTo links on TOC pages
   ────────────────────────────────────────────────────── */
function addTocGoToLinks(merged, entries, coverPageCount, tocPageCount, pageMap) {
  const context = merged.context;
  const PAGE_H  = 841.89;
  const LEFT    = 30;
  const RIGHT   = 565;
  const ROW_H   = 22;

  const FIRST_PAGE_START = PAGE_H - 56.7 - 85 - 66;
  const NEXT_PAGE_START  = PAGE_H - 56.7 - 85;
  const PAGE_BOTTOM      = 56.7 + 71;

  let y = FIRST_PAGE_START;
  let tocPageIdx = 0;

  for (const entry of entries) {
    if (y - ROW_H < PAGE_BOTTOM && tocPageIdx + 1 < tocPageCount) {
      tocPageIdx++;
      y = NEXT_PAGE_START;
    }

    const targetDocPageIdx = pageMap.get(entry.path);
    if (targetDocPageIdx === undefined) { y -= ROW_H; continue; }

    const tocPdfPageIdx = coverPageCount + tocPageIdx;
    const page = merged.getPage(tocPdfPageIdx);
    const targetRef = merged.getPage(targetDocPageIdx).ref;

    const action = context.obj({
      S: PDFName.of('GoTo'),
      D: [targetRef, PDFName.of('Fit')],
    });

    const annot = context.register(context.obj({
      Type: PDFName.of('Annot'),
      Subtype: PDFName.of('Link'),
      Rect: [LEFT, y - ROW_H, RIGHT, y],
      Border: [0, 0, 0],
      A: action,
    }));

    const existingAnnots = page.node.get(PDFName.of('Annots'));
    if (existingAnnots) {
      const arr = context.lookup(existingAnnots);
      if (arr instanceof PDFArray) arr.push(annot);
    } else {
      page.node.set(PDFName.of('Annots'), context.obj([annot]));
    }

    y -= ROW_H;
  }
}

/* ──────────────────────────────────────────────────────
   Stage 4 — Merge: cover + TOC + docs
   ────────────────────────────────────────────────────── */
async function mergePDFs(coverBuf, tocBuf, docBuffers, entries, coverPageCount, tocPageCount) {
  console.log('  [4/6]  Merging PDFs …');

  const merged = await PDFDocument.create();

  const coverDoc   = await PDFDocument.load(coverBuf);
  const coverPages = await merged.copyPages(coverDoc, coverDoc.getPageIndices());
  coverPages.forEach((p) => merged.addPage(p));

  const tocDoc   = await PDFDocument.load(tocBuf);
  const tocPages = await merged.copyPages(tocDoc, tocDoc.getPageIndices());
  tocPages.forEach((p) => merged.addPage(p));

  const pageMap = new Map();
  let cumulative = coverPageCount + tocPageCount;

  for (let i = 0; i < docBuffers.length; i++) {
    pageMap.set(entries[i].path, cumulative);

    const doc   = await PDFDocument.load(docBuffers[i]);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
    cumulative += entries[i].pageCount;
  }

  merged.setTitle('Dumont DEP Documentation');
  merged.setSubject('Data Extraction Platform — v2026.1');
  merged.setAuthor('Viglet');
  merged.setCreator('Viglet PDF Generator');
  merged.setProducer('pdf-lib + Puppeteer');
  merged.setCreationDate(new Date());

  return { merged, pageMap };
}

/* ──────────────────────────────────────────────────────
   Stage 5 — Rewrite internal links as in-PDF GoTo
   ────────────────────────────────────────────────────── */

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

function resolveInternalPath(uri) {
  let path = null;
  if (uri.startsWith(BASE_URL))  path = uri.slice(BASE_URL.length);
  else if (uri.startsWith(PROD_URL)) path = uri.slice(PROD_URL.length);
  if (!path) return null;
  const hashIdx = path.indexOf('#');
  return (hashIdx >= 0 ? path.slice(0, hashIdx) : path).replace(/\/+$/, '');
}

async function rewriteInternalLinks(merged, pageMap) {
  console.log('  [5/6]  Rewriting internal links …');

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
   Stage 6 — Stamp page numbers (skip cover + TOC)
   ────────────────────────────────────────────────────── */
async function stampPageNumbers(merged, skipPages) {
  console.log('  [6/6]  Stamping page numbers …');

  const font = await merged.embedFont(StandardFonts.Helvetica);
  const fontSize = 8;
  const totalDocPages = merged.getPageCount() - skipPages;

  for (let i = skipPages; i < merged.getPageCount(); i++) {
    const page = merged.getPage(i);
    const { width } = page.getSize();
    const docPageNum = i - skipPages + 1;
    const text = `${docPageNum} / ${totalDocPages}`;
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    page.drawText(text, {
      x: width - 15 * 2.835 - textWidth,
      y: 12 * 2.835,
      size: fontSize,
      font,
      color: rgb(0.39, 0.45, 0.51),
    });
  }

  console.log(`         ${totalDocPages} pages numbered ✓`);
}

/* ──────────────────────────────────────────────────────
   Main
   ────────────────────────────────────────────────────── */
async function main() {
  console.log();
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║  Dumont DEP — PDF Documentation Builder  ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log();

  await launchBrowser();

  const coverBuf = await generateCover();
  const coverDoc = await PDFDocument.load(coverBuf);
  const coverPageCount = coverDoc.getPageCount();

  const { buffers, entries } = await crawlDocs();

  let tocPageCount = 1;
  let tocBuf;

  for (let pass = 0; pass < 3; pass++) {
    const firstDocPage = coverPageCount + tocPageCount + 1;
    const result = await generateToc(entries, firstDocPage - (coverPageCount + tocPageCount));
    tocBuf = result.pdfBuf;
    if (result.tocPageCount === tocPageCount) break;
    tocPageCount = result.tocPageCount;
  }

  const { merged, pageMap } = await mergePDFs(
    coverBuf, tocBuf, buffers, entries, coverPageCount, tocPageCount,
  );

  addTocGoToLinks(merged, entries, coverPageCount, tocPageCount, pageMap);

  await rewriteInternalLinks(merged, pageMap);

  const skipPages = coverPageCount + tocPageCount;
  await stampPageNumbers(merged, skipPages);

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
