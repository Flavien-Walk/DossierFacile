'use strict';

const {
  PDFDocument, rgb, StandardFonts, degrees, PDFName, PDFArray,
} = require('pdf-lib');

// Sharp is optional — graceful degradation if not installed
let sharp;
try { sharp = require('sharp'); } catch (_) { sharp = null; }

// ─── A4 Dimensions (points) ────────────────────────────────────────────────
const PW = 595;
const PH = 842;

// Layout zones
const M_COVER  = 48;  // Cover page margin
const M_INNER  = 42;  // TOC / inner pages margin
const M_DOC    = 20;  // Document pages (tight = maximum content area)
const SEC_H    = 40;  // Section header band height (top of doc pages)
const FOOTER_Y = 15;  // Footer text baseline
const FOOTER_ZONE = 30; // Total reserved height for footer

// ─── Design Palettes ──────────────────────────────────────────────────────
const PALETTES = {
  classic: {
    accent:      rgb(0.20, 0.27, 0.42),   // Deep slate
    accentLight: rgb(0.87, 0.90, 0.94),
    accentMid:   rgb(0.32, 0.41, 0.58),
    textDark:    rgb(0.09, 0.11, 0.15),
    textMid:     rgb(0.36, 0.41, 0.50),
    textLight:   rgb(0.57, 0.62, 0.70),
    pageBg:      rgb(1, 1, 1),
    coverBg:     rgb(0.975, 0.975, 0.980),
    white:       rgb(1, 1, 1),
    bodyFont:    StandardFonts.TimesRoman,
    boldFont:    StandardFonts.TimesRomanBold,
    italicFont:  StandardFonts.TimesRomanItalic,
  },
  modern: {
    accent:      rgb(0.18, 0.33, 0.86),   // Soft indigo
    accentLight: rgb(0.91, 0.93, 0.99),
    accentMid:   rgb(0.30, 0.46, 0.90),
    textDark:    rgb(0.07, 0.09, 0.13),
    textMid:     rgb(0.33, 0.39, 0.50),
    textLight:   rgb(0.55, 0.60, 0.70),
    pageBg:      rgb(1, 1, 1),
    coverBg:     rgb(0.975, 0.976, 0.992),
    white:       rgb(1, 1, 1),
    bodyFont:    StandardFonts.Helvetica,
    boldFont:    StandardFonts.HelveticaBold,
    italicFont:  StandardFonts.HelveticaOblique,
  },
  premium: {
    accent:      rgb(0.07, 0.17, 0.35),   // Deep navy
    accentLight: rgb(0.90, 0.92, 0.96),
    accentMid:   rgb(0.14, 0.28, 0.52),
    textDark:    rgb(0.06, 0.09, 0.14),
    textMid:     rgb(0.31, 0.37, 0.47),
    textLight:   rgb(0.53, 0.58, 0.67),
    pageBg:      rgb(1, 1, 1),
    coverBg:     rgb(0.970, 0.972, 0.978),
    white:       rgb(1, 1, 1),
    bodyFont:    StandardFonts.Helvetica,
    boldFont:    StandardFonts.HelveticaBold,
    italicFont:  StandardFonts.HelveticaOblique,
  },
};

// ─── Text Helpers ─────────────────────────────────────────────────────────
const SITUATION_LABELS = {
  cdi:      'CDI',
  cdd:      'CDD',
  etudiant: 'Etudiant(e)',
  freelance:'Freelance / Independant',
  autre:    'Autre',
};

function fmtRevenue(revenue) {
  const n = Math.round(Number(revenue) || 0);
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' EUR / mois';
}

function fmtDate() {
  const d = new Date();
  const months = [
    'janvier','fevrier','mars','avril','mai','juin',
    'juillet','aout','septembre','octobre','novembre','decembre',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getSituation(userData) {
  return SITUATION_LABELS[userData.situation] || userData.situation || '';
}

function buildDocsList(files) {
  const list = [];
  if (files.identity)              list.push("Piece d'identite");
  if (files.contract)              list.push('Contrat de travail');
  if (files.payslips?.length > 0)  list.push(`Fiches de paie (${files.payslips.length})`);
  if (files.guarantor)             list.push('Garant');
  return list;
}

// ─── Font Loading ─────────────────────────────────────────────────────────
async function loadFonts(doc, p) {
  return {
    r: await doc.embedFont(p.bodyFont),
    b: await doc.embedFont(p.boldFont),
    i: await doc.embedFont(p.italicFont || p.bodyFont),
  };
}

// ─── Drawing Primitives ───────────────────────────────────────────────────

function hRule(page, x, y, w, color, thick = 0.6) {
  page.drawLine({ start: { x, y }, end: { x: x + w, y }, thickness: thick, color });
}

// Footer on every page
function drawFooter(page, fonts, p, pageNum, total) {
  const r = fonts.r;
  const lbl = 'Dossier Locataire';
  const mid = `${pageNum} / ${total}`;
  const rgt = 'DossierFacile.fr';

  hRule(page, M_INNER, FOOTER_Y + 12, PW - 2 * M_INNER, p.accentLight, 0.5);

  page.drawText(lbl, { x: M_INNER, y: FOOTER_Y, size: 7.5, font: r, color: p.textLight });

  const mw = r.widthOfTextAtSize(mid, 7.5);
  page.drawText(mid, { x: (PW - mw) / 2, y: FOOTER_Y, size: 7.5, font: r, color: p.textLight });

  const rw = r.widthOfTextAtSize(rgt, 7.5);
  page.drawText(rgt, { x: PW - M_INNER - rw, y: FOOTER_Y, size: 7.5, font: r, color: p.textLight });
}

// ─── Section Header Band ──────────────────────────────────────────────────
// Drawn ON TOP of the content — full-width accent band at the top of a page
function drawSectionBand(page, title, p, fonts) {
  // Main accent rectangle
  page.drawRectangle({ x: 0, y: PH - SEC_H, width: PW, height: SEC_H, color: p.accent });

  // Left decorative square (slightly darker, creates a "tab" visual)
  page.drawRectangle({ x: 0, y: PH - SEC_H, width: SEC_H, height: SEC_H, color: p.accentMid });

  // Section title
  const fontSize = 9.5;
  const labelY = (PH - SEC_H) + (SEC_H - fontSize) / 2 + 2;
  page.drawText(title.toUpperCase(), {
    x: SEC_H + 12, y: labelY,
    size: fontSize, font: fonts.b,
    color: p.white, characterSpacing: 1.8,
  });
}

// ─── Image Preprocessing (sharp) ─────────────────────────────────────────
// Trims white borders and corrects EXIF orientation for scanned documents
async function trimImage(buffer, mimetype) {
  if (!sharp) return { buf: buffer, jpeg: mimetype !== 'image/png' };
  try {
    const trimmed = await sharp(buffer)
      .rotate()                                                   // correct EXIF orientation
      .trim({ background: { r: 248, g: 248, b: 248 }, threshold: 28 }) // remove white borders
      .jpeg({ quality: 91, mozjpeg: false })
      .toBuffer();
    return { buf: trimmed, jpeg: true };
  } catch {
    return { buf: buffer, jpeg: mimetype !== 'image/png' };
  }
}

// ─── Image Embedding ──────────────────────────────────────────────────────
// Returns the 0-based page index of the newly created page
async function embedImage(doc, file, sectionTitle, p, fonts) {
  const pageIndex = doc.getPageCount();

  const { buf, jpeg } = await trimImage(file.buffer, file.mimetype);

  let image;
  try {
    image = jpeg ? await doc.embedJpg(buf) : await doc.embedPng(buf);
  } catch {
    try { image = await doc.embedJpg(file.buffer); } catch { return pageIndex; }
  }

  const { width: iw, height: ih } = image;

  // Available content zone on this page
  const topPad = (sectionTitle ? SEC_H : 0) + M_DOC;
  const botPad = FOOTER_ZONE + M_DOC;
  const availH = PH - topPad - botPad;
  const availW = PW - 2 * M_DOC;

  // Scale: fill available zone; allow upscale up to 1.8× for small scans
  const scale = Math.min(availW / iw, availH / ih, 1.8);
  const sw = iw * scale;
  const sh = ih * scale;

  // Center in available zone (X centered on page, Y centered in content area)
  const cx = (PW - sw) / 2;
  const cy = botPad + (availH - sh) / 2;

  const page = doc.addPage([PW, PH]);

  // White background
  page.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: p.white });

  // Subtle drop-shadow card effect (grey rectangle under the image)
  page.drawRectangle({
    x: cx - 4, y: cy - 4, width: sw + 8, height: sh + 8,
    color: rgb(0.89, 0.89, 0.91),
  });
  page.drawRectangle({
    x: cx - 1, y: cy - 1, width: sw + 2, height: sh + 2,
    color: p.white,
  });

  // Image
  page.drawImage(image, { x: cx, y: cy, width: sw, height: sh });

  // Section band drawn last = appears on top
  if (sectionTitle) drawSectionBand(page, sectionTitle, p, fonts);

  return pageIndex;
}

// ─── PDF Document Embedding ───────────────────────────────────────────────
// Uses embedPdf + drawPage (XObject) for full placement control.
// Returns the 0-based page index of the first embedded page.
async function embedPDF(doc, file, sectionTitle, p, fonts) {
  const firstPageIndex = doc.getPageCount();

  let srcDoc;
  try {
    srcDoc = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
  } catch {
    return firstPageIndex;
  }

  const pageCount = srcDoc.getPageCount();
  if (pageCount === 0) return firstPageIndex;

  // Embed all source pages as XObjects (one embedPdf call for efficiency)
  let embedded;
  try {
    embedded = await doc.embedPdf(srcDoc, srcDoc.getPageIndices());
  } catch {
    // Fallback: direct page copy (no layout control, but content preserved)
    try {
      const copied = await doc.copyPages(srcDoc, srcDoc.getPageIndices());
      copied.forEach(cp => doc.addPage(cp));
    } catch { /* skip entirely */ }
    return firstPageIndex;
  }

  for (let i = 0; i < embedded.length; i++) {
    const ep      = embedded[i];
    const isFirst = i === 0;

    const { width: epW, height: epH } = ep;
    if (!epW || !epH) continue; // malformed page — skip

    // Content zone for this page
    const topPad = (isFirst && sectionTitle ? SEC_H : 0) + M_DOC;
    const botPad = FOOTER_ZONE + M_DOC;
    const availH = PH - topPad - botPad;
    const availW = PW - 2 * M_DOC;

    // Scale to fill available zone (no upscale for PDFs — they are already high-res)
    const scale = Math.min(availW / epW, availH / epH);
    const sw    = epW * scale;
    const sh    = epH * scale;
    const cx    = (PW - sw) / 2;
    const cy    = botPad + (availH - sh) / 2;

    const page = doc.addPage([PW, PH]);

    // White background
    page.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: p.white });

    // Draw the embedded page (XObject)
    page.drawPage(ep, { x: cx, y: cy, width: sw, height: sh });

    // Section band on first page — drawn after drawPage so it is on top
    if (isFirst && sectionTitle) {
      drawSectionBand(page, sectionTitle, p, fonts);
    }
  }

  return firstPageIndex;
}

// ─── Embed Router ─────────────────────────────────────────────────────────
async function embedDoc(doc, file, sectionTitle, p, fonts) {
  if (file.mimetype === 'application/pdf') {
    return embedPDF(doc, file, sectionTitle, p, fonts);
  }
  return embedImage(doc, file, sectionTitle, p, fonts);
}

// ─── PDF Link Annotations (for TOC) ──────────────────────────────────────
// Adds a GoTo link annotation that jumps to targetPageIndex when clicked.
function addGoToLink(doc, sourcePage, rect, targetPageIndex) {
  try {
    const targetPage = doc.getPage(targetPageIndex);
    const annot = doc.context.obj({
      Type:    PDFName.of('Annot'),
      Subtype: PDFName.of('Link'),
      Rect:    doc.context.obj(rect),             // [x1, y1, x2, y2]
      Border:  doc.context.obj([0, 0, 0]),
      Dest:    doc.context.obj([targetPage.ref, PDFName.of('Fit')]),
    });
    const ref = doc.context.register(annot);

    const annotsKey = PDFName.of('Annots');
    const existing  = sourcePage.node.lookupMaybe(annotsKey, PDFArray);
    if (existing) {
      existing.push(ref);
    } else {
      sourcePage.node.set(annotsKey, doc.context.obj([ref]));
    }
  } catch (_) {
    // Link annotations are decorative — never crash for this
  }
}

// ─── Table of Contents ────────────────────────────────────────────────────
// Called AFTER all sections are built, so page indices are final.
function drawTOC(tocPage, entries, doc, p, fonts) {
  const { r, b } = fonts;
  const x  = M_INNER;
  const cw = PW - 2 * M_INNER;

  // Background + top bar
  tocPage.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: p.pageBg });
  tocPage.drawRectangle({ x: 0, y: PH - 4, width: PW, height: 4, color: p.accent });

  let y = PH - 4 - M_INNER - 6;

  // TOC title
  tocPage.drawText('SOMMAIRE', {
    x, y, size: 8.5, font: b, color: p.accent, characterSpacing: 3,
  });
  y -= 10;
  hRule(tocPage, x, y, cw, p.accentLight, 0.8);
  y -= 32;

  const ROW_H = 30;

  for (const entry of entries) {
    const labelY = y - ROW_H / 2 + 5;

    // Entry label
    tocPage.drawText(entry.label, {
      x: x + 12, y: labelY, size: 11, font: r, color: p.textDark,
    });

    // Page number (right-aligned, bold, accent color)
    const pgStr = String(entry.displayPage);
    const pgW   = b.widthOfTextAtSize(pgStr, 11);
    tocPage.drawText(pgStr, {
      x: x + cw - pgW, y: labelY, size: 11, font: b, color: p.accent,
    });

    // Dot leader between label and page number
    const dotStart = x + 12 + r.widthOfTextAtSize(entry.label, 11) + 10;
    const dotEnd   = x + cw - pgW - 12;
    for (let lx = dotStart; lx < dotEnd; lx += 5) {
      tocPage.drawRectangle({
        x: lx, y: labelY + 3, width: 1.5, height: 1.5, color: p.accentLight,
      });
    }

    // Bottom separator
    hRule(tocPage, x, y - ROW_H, cw, p.accentLight, 0.4);

    // Clickable link — covers the full row rectangle
    addGoToLink(doc, tocPage,
      [x, y - ROW_H, x + cw, y + 2],
      entry.pageIndex,
    );

    y -= ROW_H + 6;
  }
}

// ─── Cover Page ───────────────────────────────────────────────────────────
async function buildCoverPage(doc, userData, files, p, fonts) {
  const page = doc.addPage([PW, PH]);
  const { r, b, i } = fonts;

  const x  = M_COVER;
  const cw = PW - 2 * M_COVER;

  // Background (slightly warm off-white)
  page.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: p.coverBg });

  // Top accent bar
  page.drawRectangle({ x: 0, y: PH - 5, width: PW, height: 5, color: p.accent });

  // Left thin accent strip
  page.drawRectangle({ x: 0, y: 0, width: 3, height: PH - 5, color: p.accentLight });

  let y = PH - 5 - M_COVER - 8;

  // ── Header row: label + date ──────────────────────────────────────────
  page.drawText('DOSSIER LOCATAIRE', {
    x, y, size: 9, font: b, color: p.accent, characterSpacing: 3,
  });
  const dt  = fmtDate();
  const dtw = r.widthOfTextAtSize(dt, 9);
  page.drawText(dt, { x: x + cw - dtw, y, size: 9, font: r, color: p.textLight });
  y -= 10;
  hRule(page, x, y, cw, p.accentLight, 0.7);
  y -= 42;

  // ── Hero: full name ───────────────────────────────────────────────────
  const fullName = `${userData.firstName} ${userData.lastName}`;
  page.drawText(fullName, { x, y, size: 32, font: b, color: p.textDark });
  y -= 17;

  // Accent underline below name
  page.drawLine({ start: { x, y }, end: { x: x + 62, y }, thickness: 3, color: p.accent });
  y -= 18;

  // Situation + revenue subtitle
  const situation = getSituation(userData);
  const subtitle  = `${situation}  —  ${fmtRevenue(userData.revenue)}`;
  page.drawText(subtitle, { x, y, size: 12, font: r, color: p.textMid });
  y -= 36;

  hRule(page, x, y, cw, p.accentLight, 0.7);
  y -= 40;

  // ── Two-column info block ─────────────────────────────────────────────
  const colW = (cw - 32) / 2;
  const col2 = x + colW + 32;

  // Left col: PROFIL
  page.drawText('PROFIL', { x, y, size: 7.5, font: b, color: p.accent, characterSpacing: 2 });
  page.drawLine({ start: { x, y: y - 8 }, end: { x: x + 24, y: y - 8 }, thickness: 2, color: p.accent });

  // Right col: CONTACT
  page.drawText('CONTACT', { x: col2, y, size: 7.5, font: b, color: p.accent, characterSpacing: 2 });
  page.drawLine({ start: { x: col2, y: y - 8 }, end: { x: col2 + 24, y: y - 8 }, thickness: 2, color: p.accent });

  let ly = y - 28;
  let ry = y - 28;

  for (const [label, val] of [
    ['SITUATION',    situation],
    ['REVENUS NETS', fmtRevenue(userData.revenue)],
  ]) {
    page.drawText(label, { x, y: ly, size: 7, font: b, color: p.textLight, characterSpacing: 0.5 });
    page.drawText(val,   { x, y: ly - 14, size: 11, font: r, color: p.textDark });
    ly -= 40;
  }

  for (const [label, val] of [
    ['EMAIL',     userData.email],
    ['TELEPHONE', userData.phone],
  ]) {
    page.drawText(label, { x: col2, y: ry, size: 7, font: b, color: p.textLight, characterSpacing: 0.5 });
    page.drawText(val,   { x: col2, y: ry - 14, size: 11, font: r, color: p.textDark });
    ry -= 40;
  }

  y = Math.min(ly, ry) - 16;
  hRule(page, x, y, cw, p.accentLight, 0.7);
  y -= 36;

  // ── Documents list ────────────────────────────────────────────────────
  page.drawText('CONTENU DU DOSSIER', {
    x, y, size: 7.5, font: b, color: p.accent, characterSpacing: 2,
  });
  page.drawLine({ start: { x, y: y - 8 }, end: { x: x + 24, y: y - 8 }, thickness: 2, color: p.accent });
  y -= 28;

  for (const name of buildDocsList(files)) {
    page.drawRectangle({ x, y: y + 2.5, width: 4, height: 4, color: p.accent });
    page.drawText(name, { x: x + 14, y, size: 11, font: r, color: p.textDark });
    y -= 23;
  }

  y -= 18;
  hRule(page, x, y, cw, p.accentLight, 0.7);
  y -= 22;

  // Closing note
  page.drawText(
    'Dossier constitue avec soin. Tous les documents fournis sont authentiques.',
    { x, y, size: 8.5, font: i, color: p.textLight },
  );
}

// ─── Watermark ────────────────────────────────────────────────────────────
// Moderate grid pattern — visible but non-aggressive, does not obscure content
function applyWatermark(page, font) {
  const { width, height } = page.getSize();
  const text = 'APERCU';

  // 4×5 grid, rotated 35°, very low opacity
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 4; col++) {
      page.drawText(text, {
        x:       (col * width  / 3) - 25,
        y:       (row * height / 4) + 35,
        size:    38,
        font,
        color:   rgb(0.62, 0.62, 0.62),
        opacity: 0.07,
        rotate:  degrees(35),
      });
    }
  }
}

// ─── Main Generator ───────────────────────────────────────────────────────

/**
 * Generate a dossier locataire PDF.
 *
 * @param {object}  userData      { firstName, lastName, email, phone, situation, revenue }
 * @param {object}  files         { identity, contract, payslips[], guarantor }
 * @param {string}  styleName     'classic' | 'modern' | 'premium'
 * @param {boolean} withWatermark true for preview, false for paid final
 * @returns {Promise<Buffer>}
 */
async function generateDossierPDF(userData, files, styleName, withWatermark) {
  const p   = PALETTES[styleName] || PALETTES.modern;
  const doc = await PDFDocument.create();
  const f   = await loadFonts(doc, p);

  // ── 1. Cover page (index 0) ──────────────────────────────────────────
  await buildCoverPage(doc, userData, files, p, f);

  // ── 2. TOC placeholder page (index 1) ───────────────────────────────
  // We add it now as a blank page and populate it AFTER all sections are
  // appended, because we need to know each section's final page index.
  const tocPage = doc.addPage([PW, PH]);

  // Fixed TOC entries for cover + TOC itself
  const tocEntries = [
    { label: 'Couverture', pageIndex: 0, displayPage: 1 },
    { label: 'Sommaire',   pageIndex: 1, displayPage: 2 },
  ];

  // ── 3. Sections ──────────────────────────────────────────────────────

  // Identity (required)
  if (files.identity) {
    const idx = await embedDoc(doc, files.identity, "Piece d'identite", p, f);
    tocEntries.push({ label: "Piece d'identite", pageIndex: idx, displayPage: idx + 1 });
  }

  // Work contract (optional)
  if (files.contract) {
    const idx = await embedDoc(doc, files.contract, 'Contrat de travail', p, f);
    tocEntries.push({ label: 'Contrat de travail', pageIndex: idx, displayPage: idx + 1 });
  }

  // Payslips (optional, multiple) — only the first gets a section header + TOC entry
  if (files.payslips?.length > 0) {
    const idx = await embedDoc(doc, files.payslips[0], 'Fiches de paie', p, f);
    tocEntries.push({ label: 'Fiches de paie', pageIndex: idx, displayPage: idx + 1 });

    for (let i = 1; i < files.payslips.length; i++) {
      await embedDoc(doc, files.payslips[i], null, p, f); // continuation — no section band
    }
  }

  // Guarantor (optional)
  if (files.guarantor) {
    const idx = await embedDoc(doc, files.guarantor, 'Garant', p, f);
    tocEntries.push({ label: 'Garant', pageIndex: idx, displayPage: idx + 1 });
  }

  const totalPages = doc.getPageCount();

  // ── 4. Populate TOC (2nd pass — all page indices are now known) ──────
  drawTOC(tocPage, tocEntries, doc, p, f);

  // ── 5. Footers on every page ─────────────────────────────────────────
  doc.getPages().forEach((pg, i) => drawFooter(pg, f, p, i + 1, totalPages));

  // ── 6. Watermark (preview only) ───────────────────────────────────────
  if (withWatermark) {
    for (const pg of doc.getPages()) applyWatermark(pg, f.b);
  }

  return Buffer.from(await doc.save());
}

module.exports = { generateDossierPDF };
