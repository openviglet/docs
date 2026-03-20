#!/usr/bin/env node
/**
 * gen-pdf.js — Generates a single PDF from the Turing ES documentation.
 *
 * Uses puppeteer (already installed via @mermaid-js/mermaid-cli) to crawl
 * all pages starting from --startUrl, following the pagination selector, then
 * prints each page to PDF and merges the results with pdf-lib.
 *
 * Usage:
 *   node scripts/gen-pdf.js \
 *     --startUrl http://localhost:3000/turing/getting-started/intro \
 *     --output turing-es-2026.1-documentation.pdf
 */

const puppeteer = require("puppeteer");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

// ── CLI args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const get = (flag, def) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : def;
};

const START_URL       = get("--startUrl", "http://localhost:3000/turing/getting-started/intro");
const OUTPUT_FILENAME = get("--output",   "turing-es-2026.1-documentation.pdf");
const NEXT_SELECTOR   = "a.pagination-nav__link--next";
const CONTENT_SEL     = "article";

// ── Helpers ──────────────────────────────────────────────────────────────────
async function collectUrls(page) {
  const urls = [];
  let current = START_URL;
  while (current) {
    urls.push(current);
    await page.goto(current, { waitUntil: "networkidle0", timeout: 60000 });
    const next = await page
      .$eval(NEXT_SELECTOR, (el) => el.href)
      .catch(() => null);
    // Stop if we loop back or leave the /turing/ section
    if (!next || urls.includes(next) || !new URL(next).pathname.startsWith("/turing")) {
      break;
    }
    current = next;
  }
  return urls;
}

async function printPage(page, url) {
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

  // Hide chrome elements before printing
  await page.addStyleTag({
    content: `
      .theme-doc-sidebar-container, .navbar, .footer,
      .theme-doc-footer, .pagination-nav, .table-of-contents,
      .breadcrumbs, .docSidebarContainer_YfHR,
      [class*="sidebarContainer"], [class*="tocCollapsible"],
      button, .theme-doc-footer-edit-this-page { display: none !important; }
      article { max-width: 100% !important; padding: 2rem 3rem !important; }
      .markdown img[src*="/img/diagrams/"] { max-width: 100% !important; filter: none !important; }
    `,
  });

  // Wait for any SVG images to load
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images, (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => { img.onload = res; img.onerror = res; })
      )
    )
  );

  return page.pdf({
    format: "A4",
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    printBackground: true,
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log("Launching browser…");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // 1. Discover all page URLs
  console.log("Collecting page URLs from", START_URL);
  const urls = await collectUrls(page);
  console.log(`Found ${urls.length} pages.`);

  // 2. Print each page to a PDF buffer
  const pdfBuffers = [];
  for (let i = 0; i < urls.length; i++) {
    console.log(`  [${i + 1}/${urls.length}] ${urls[i]}`);
    const buf = await printPage(page, urls[i]);
    pdfBuffers.push(buf);
  }

  await browser.close();

  // 3. Merge all PDF buffers into one document
  console.log("Merging PDFs…");
  const merged = await PDFDocument.create();
  for (const buf of pdfBuffers) {
    const doc = await PDFDocument.load(buf);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }

  const outputBytes = await merged.save();
  fs.writeFileSync(OUTPUT_FILENAME, outputBytes);

  const sizeKB = Math.round(outputBytes.byteLength / 1024);
  console.log(`\n✅ PDF saved: ${OUTPUT_FILENAME} (${sizeKB} KB, ${merged.getPageCount()} pages)`);
})().catch((err) => {
  console.error("PDF generation failed:", err.message);
  process.exit(1);
});
