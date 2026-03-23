'use strict';

const {
  PDFDocument, rgb, StandardFonts, degrees, PDFName, PDFArray,
} = require('pdf-lib');

// Sharp: optional — graceful fallback if not installed
let sharp;
try { sharp = require('sharp'); } catch (_) { sharp = null; }

// ─── A4 Dimensions ────────────────────────────────────────────────────────
const PW = 595;
const PH = 842;

// ─── Layout constants ─────────────────────────────────────────────────────
const COVER_M   = 48;   // cover page margin
const INNER_M   = 42;   // TOC / inner pages margin
const IMG_M     = 14;   // image doc page margin
const PDF_M     = 8;    // native PDF doc page margin
const SEC_H     = 28;   // section header band height
const FOOTER_H  = 28;   // footer zone height (reserved at bottom)
const FOOTER_Y  = 13;   // footer text baseline

// ─── Palettes ─────────────────────────────────────────────────────────────
const PALETTES = {
  classic: {
    accent:      rgb(0.20, 0.27, 0.42),
    accentLight: rgb(0.87, 0.90, 0.94),
    accentMid:   rgb(0.30, 0.40, 0.57),
    textDark:    rgb(0.09, 0.11, 0.15),
    textMid:     rgb(0.36, 0.41, 0.50),
    textLight:   rgb(0.57, 0.62, 0.70),
    coverBg:     rgb(0.974, 0.974, 0.979),
    pageBg:      rgb(0.984, 0.984, 0.987),
    white:       rgb(1, 1, 1),
    bodyFont:    StandardFonts.TimesRoman,
    boldFont:    StandardFonts.TimesRomanBold,
    italicFont:  StandardFonts.TimesRomanItalic,
  },
  modern: {
    accent:      rgb(0.18, 0.33, 0.86),
    accentLight: rgb(0.91, 0.93, 0.99),
    accentMid:   rgb(0.29, 0.46, 0.90),
    textDark:    rgb(0.07, 0.09, 0.13),
    textMid:     rgb(0.33, 0.39, 0.50),
    textLight:   rgb(0.55, 0.60, 0.70),
    coverBg:     rgb(0.974, 0.975, 0.992),
    pageBg:      rgb(0.984, 0.985, 0.996),
    white:       rgb(1, 1, 1),
    bodyFont:    StandardFonts.Helvetica,
    boldFont:    StandardFonts.HelveticaBold,
    italicFont:  StandardFonts.HelveticaOblique,
  },
  premium: {
    accent:      rgb(0.07, 0.17, 0.35),
    accentLight: rgb(0.90, 0.92, 0.96),
    accentMid:   rgb(0.13, 0.27, 0.51),
    textDark:    rgb(0.06, 0.09, 0.14),
    textMid:     rgb(0.31, 0.37, 0.47),
    textLight:   rgb(0.53, 0.58, 0.67),
    coverBg:     rgb(0.970, 0.971, 0.978),
    pageBg:      rgb(0.982, 0.982, 0.986),
    white:       rgb(1, 1, 1),
    bodyFont:    StandardFonts.Helvetica,
    boldFont:    StandardFonts.HelveticaBold,
    italicFont:  StandardFonts.HelveticaOblique,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────
const SITUATION_LABELS = {
  cdi: 'CDI', cdd: 'CDD', etudiant: 'Etudiant(e)',
  freelance: 'Freelance / Independant', autre: 'Autre',
};

function fmtRevenue(revenue) {
  const n = Math.round(Number(revenue) || 0);
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' EUR / mois';
}

function fmtDate() {
  const d = new Date();
  const M = ['janvier','fevrier','mars','avril','mai','juin',
    'juillet','aout','septembre','octobre','novembre','decembre'];
  return `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`;
}

function getSit(userData) {
  return SITUATION_LABELS[userData.situation] || userData.situation || '';
}

function getDocsList(files) {
  const d = [];
  if (files.identity)             d.push("Piece d'identite");
  if (files.contract)             d.push('Contrat de travail');
  if (files.payslips?.length > 0) d.push(`Fiches de paie (${files.payslips.length})`);
  if (files.guarantor)            d.push('Garant');
  return d;
}

// ─── Font loading ─────────────────────────────────────────────────────────
async function loadFonts(doc, p) {
  return {
    r: await doc.embedFont(p.bodyFont),
    b: await doc.embedFont(p.boldFont),
    i: await doc.embedFont(p.italicFont || p.bodyFont),
  };
}

// ─── Primitives ───────────────────────────────────────────────────────────
function hRule(page, x, y, w, color, t = 0.6) {
  page.drawLine({ start: { x, y }, end: { x: x + w, y }, thickness: t, color });
}

// ─── Footer ───────────────────────────────────────────────────────────────
function drawFooter(page, fonts, p, num, total) {
  const r = fonts.r;
  hRule(page, INNER_M, FOOTER_Y + 11, PW - 2 * INNER_M, p.accentLight, 0.5);
  page.drawText('Dossier Locataire', {
    x: INNER_M, y: FOOTER_Y, size: 7.5, font: r, color: p.textLight,
  });
  const mid = `${num} / ${total}`;
  const mw  = r.widthOfTextAtSize(mid, 7.5);
  page.drawText(mid, { x: (PW - mw) / 2, y: FOOTER_Y, size: 7.5, font: r, color: p.textLight });
  const brand = 'DossierFacile.fr';
  const bw    = r.widthOfTextAtSize(brand, 7.5);
  page.drawText(brand, { x: PW - INNER_M - bw, y: FOOTER_Y, size: 7.5, font: r, color: p.textLight });
}

// ─── Section header band ──────────────────────────────────────────────────
// Drawn ON TOP of the page content so it always overlays the document
function drawSectionBand(page, title, p, fonts) {
  // Full-width accent band
  page.drawRectangle({ x: 0, y: PH - SEC_H, width: PW, height: SEC_H, color: p.accent });
  // Left accent square (slightly darker)
  page.drawRectangle({ x: 0, y: PH - SEC_H, width: SEC_H, height: SEC_H, color: p.accentMid });

  const fs   = 8.5;
  const lblY = (PH - SEC_H) + (SEC_H - fs) / 2 + 1.5;
  page.drawText(title.toUpperCase(), {
    x: SEC_H + 10, y: lblY,
    size: fs, font: fonts.b,
    color: p.white, characterSpacing: 1.8,
  });
}

// ─── computePlacement ─────────────────────────────────────────────────────
// Returns { cx, cy, sw, sh } — centered placement within available zone.
// hasBand: true if the section header band is present on this page.
// isImage: adjusts margins accordingly.
function computePlacement({ srcW, srcH, hasBand, isImage, maxScale = Infinity }) {
  const mSide = isImage ? IMG_M : PDF_M;
  const mTop  = hasBand ? SEC_H + mSide : mSide;
  const mBot  = FOOTER_H + mSide;

  const availW = PW - 2 * mSide;
  const availH = PH - mTop - mBot;

  const scale = Math.min(availW / srcW, availH / srcH, maxScale);
  const sw    = srcW * scale;
  const sh    = srcH * scale;
  const cx    = (PW - sw) / 2;
  const cy    = mBot + (availH - sh) / 2;

  return { cx, cy, sw, sh };
}

// ─── Image preprocessing (sharp) ─────────────────────────────────────────
// Trims white borders and corrects EXIF orientation.
async function trimImage(buffer, mimetype) {
  if (!sharp) return { buf: buffer, jpeg: mimetype !== 'image/png' };
  try {
    const out = await sharp(buffer)
      .rotate()
      .trim({ background: { r: 248, g: 248, b: 248 }, threshold: 30 })
      .jpeg({ quality: 92 })
      .toBuffer();
    return { buf: out, jpeg: true };
  } catch {
    return { buf: buffer, jpeg: mimetype !== 'image/png' };
  }
}

// ─── drawDocumentFrame ───────────────────────────────────────────────────
// Draws a white card with a very thin border around a document region.
// Used for images to give them a framed / presented feel.
function drawDocumentFrame(page, cx, cy, sw, sh, p) {
  // Outer tinted halo
  page.drawRectangle({
    x: cx - 6, y: cy - 6, width: sw + 12, height: sh + 12,
    color: p.accentLight,
  });
  // White card
  page.drawRectangle({
    x: cx - 1, y: cy - 1, width: sw + 2, height: sh + 2,
    color: p.white,
  });
}

// ─── fitImageToCanvas ────────────────────────────────────────────────────
// Embeds an image file on a fresh A4 page with section band and frame.
// Returns the 0-based page index of the new page.
async function fitImageToCanvas(doc, file, sectionTitle, p, fonts) {
  const pageIndex = doc.getPageCount();

  const { buf, jpeg } = await trimImage(file.buffer, file.mimetype);

  let image;
  try {
    image = jpeg ? await doc.embedJpg(buf) : await doc.embedPng(buf);
  } catch {
    try { image = await doc.embedJpg(file.buffer); } catch { return pageIndex; }
  }

  const { width: iw, height: ih } = image;
  const { cx, cy, sw, sh } = computePlacement({
    srcW: iw, srcH: ih,
    hasBand: !!sectionTitle,
    isImage: true,
    maxScale: 1.8, // allow upscale for small scans (ID cards etc.)
  });

  const page = doc.addPage([PW, PH]);
  page.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: p.pageBg });

  drawDocumentFrame(page, cx, cy, sw, sh, p);
  page.drawImage(image, { x: cx, y: cy, width: sw, height: sh });

  if (sectionTitle) drawSectionBand(page, sectionTitle, p, fonts);
  return pageIndex;
}

// ─── fitPdfPageToCanvas ──────────────────────────────────────────────────
// Embeds every page of a PDF source as an XObject on a fresh A4 page.
// Returns the 0-based page index of the first new page.
async function fitPdfPageToCanvas(doc, file, sectionTitle, p, fonts) {
  const firstIdx = doc.getPageCount();

  let srcDoc;
  try {
    srcDoc = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
  } catch {
    return firstIdx;
  }
  if (srcDoc.getPageCount() === 0) return firstIdx;

  let embedded;
  try {
    embedded = await doc.embedPdf(srcDoc, srcDoc.getPageIndices());
  } catch {
    // Fallback: direct page copy (loses placement control, but content is preserved)
    try {
      const copied = await doc.copyPages(srcDoc, srcDoc.getPageIndices());
      copied.forEach(cp => doc.addPage(cp));
    } catch { /* skip */ }
    return firstIdx;
  }

  for (let i = 0; i < embedded.length; i++) {
    const ep      = embedded[i];
    const isFirst = i === 0;
    const { width: epW, height: epH } = ep;
    if (!epW || !epH) continue;

    const { cx, cy, sw, sh } = computePlacement({
      srcW: epW, srcH: epH,
      hasBand: isFirst && !!sectionTitle,
      isImage: false,
    });

    const page = doc.addPage([PW, PH]);
    page.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: p.pageBg });
    page.drawPage(ep, { x: cx, y: cy, width: sw, height: sh });

    // Section band drawn after drawPage — appears on top
    if (isFirst && sectionTitle) drawSectionBand(page, sectionTitle, p, fonts);
  }

  return firstIdx;
}

// ─── embedDoc router ─────────────────────────────────────────────────────
async function embedDoc(doc, file, sectionTitle, p, fonts) {
  if (file.mimetype === 'application/pdf') {
    return fitPdfPageToCanvas(doc, file, sectionTitle, p, fonts);
  }
  return fitImageToCanvas(doc, file, sectionTitle, p, fonts);
}

// ─── buildClickableToc ───────────────────────────────────────────────────
// Draws TOC content on a placeholder page and adds GoTo link annotations.
// Called after all sections are built so page indices are final.
function buildClickableToc(tocPage, entries, doc, p, fonts) {
  const { r, b } = fonts;
  const x  = INNER_M;
  const cw = PW - 2 * INNER_M;

  // Page background + top bar
  tocPage.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: p.white });
  tocPage.drawRectangle({ x: 0, y: PH - 4, width: PW, height: 4, color: p.accent });

  let y = PH - 4 - INNER_M - 6;

  tocPage.drawText('SOMMAIRE', {
    x, y, size: 8.5, font: b, color: p.accent, characterSpacing: 3,
  });
  y -= 9;
  hRule(tocPage, x, y, cw, p.accentLight, 0.8);
  y -= 30;

  const ROW_H = 29;

  for (const entry of entries) {
    const labelY = y - ROW_H / 2 + 5;

    // Entry label
    tocPage.drawText(entry.label, {
      x: x + 10, y: labelY, size: 11, font: r, color: p.textDark,
    });

    // Page number
    const pgStr = String(entry.displayPage);
    const pgW   = b.widthOfTextAtSize(pgStr, 11);
    tocPage.drawText(pgStr, {
      x: x + cw - pgW, y: labelY, size: 11, font: b, color: p.accent,
    });

    // Dot leader
    const dotStart = x + 10 + r.widthOfTextAtSize(entry.label, 11) + 10;
    const dotEnd   = x + cw - pgW - 12;
    for (let lx = dotStart; lx < dotEnd; lx += 5) {
      tocPage.drawRectangle({ x: lx, y: labelY + 3, width: 1.5, height: 1.5, color: p.accentLight });
    }

    hRule(tocPage, x, y - ROW_H, cw, p.accentLight, 0.4);

    // GoTo link annotation
    _addGoToLink(doc, tocPage, [x, y - ROW_H, x + cw, y + 2], entry.pageIndex);

    y -= ROW_H + 6;
  }
}

// ─── Internal PDF link (GoTo annotation) ─────────────────────────────────
function _addGoToLink(doc, srcPage, rect, targetIdx) {
  try {
    const target = doc.getPage(targetIdx);
    const annot  = doc.context.obj({
      Type:    PDFName.of('Annot'),
      Subtype: PDFName.of('Link'),
      Rect:    doc.context.obj(rect),
      Border:  doc.context.obj([0, 0, 0]),
      Dest:    doc.context.obj([target.ref, PDFName.of('Fit')]),
    });
    const ref = doc.context.register(annot);
    const key = PDFName.of('Annots');
    const arr = srcPage.node.lookupMaybe(key, PDFArray);
    if (arr) { arr.push(ref); }
    else      { srcPage.node.set(key, doc.context.obj([ref])); }
  } catch (_) { /* annotations are decorative — never crash */ }
}

// ─── drawCover ────────────────────────────────────────────────────────────
async function drawCover(doc, userData, files, p, fonts) {
  const page = doc.addPage([PW, PH]);
  const { r, b, i } = fonts;
  const x  = COVER_M;
  const cw = PW - 2 * COVER_M;

  // Background
  page.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: p.coverBg });
  // Top accent bar
  page.drawRectangle({ x: 0, y: PH - 5, width: PW, height: 5, color: p.accent });
  // Left thin strip
  page.drawRectangle({ x: 0, y: 0, width: 3, height: PH - 5, color: p.accentLight });

  let y = PH - 5 - COVER_M - 8;

  // ── Label + date ──────────────────────────────────────────────────────
  page.drawText('DOSSIER LOCATAIRE', {
    x, y, size: 9, font: b, color: p.accent, characterSpacing: 3,
  });
  const dt  = fmtDate();
  const dtw = r.widthOfTextAtSize(dt, 9);
  page.drawText(dt, { x: x + cw - dtw, y, size: 9, font: r, color: p.textLight });
  y -= 10;
  hRule(page, x, y, cw, p.accentLight, 0.7);
  y -= 44;

  // ── Full name (hero) ──────────────────────────────────────────────────
  const fullName = `${userData.firstName} ${userData.lastName}`;
  page.drawText(fullName, { x, y, size: 32, font: b, color: p.textDark });
  y -= 16;
  page.drawLine({ start: { x, y }, end: { x: x + 60, y }, thickness: 3, color: p.accent });
  y -= 18;

  const sit = getSit(userData);
  page.drawText(`${sit}  —  ${fmtRevenue(userData.revenue)}`, {
    x, y, size: 12, font: r, color: p.textMid,
  });
  y -= 36;
  hRule(page, x, y, cw, p.accentLight, 0.7);
  y -= 40;

  // ── Two-column info block ─────────────────────────────────────────────
  const colW = (cw - 32) / 2;
  const col2 = x + colW + 32;

  page.drawText('PROFIL', { x, y, size: 7.5, font: b, color: p.accent, characterSpacing: 2 });
  page.drawLine({ start: { x, y: y - 8 }, end: { x: x + 22, y: y - 8 }, thickness: 2, color: p.accent });

  page.drawText('CONTACT', { x: col2, y, size: 7.5, font: b, color: p.accent, characterSpacing: 2 });
  page.drawLine({ start: { x: col2, y: y - 8 }, end: { x: col2 + 22, y: y - 8 }, thickness: 2, color: p.accent });

  let ly = y - 28, ry = y - 28;

  for (const [lbl, val] of [['SITUATION', sit], ['REVENUS NETS', fmtRevenue(userData.revenue)]]) {
    page.drawText(lbl, { x, y: ly,      size: 7,  font: b, color: p.textLight, characterSpacing: 0.5 });
    page.drawText(val, { x, y: ly - 13, size: 11, font: r, color: p.textDark });
    ly -= 40;
  }
  for (const [lbl, val] of [['EMAIL', userData.email], ['TELEPHONE', userData.phone]]) {
    page.drawText(lbl, { x: col2, y: ry,      size: 7,  font: b, color: p.textLight, characterSpacing: 0.5 });
    page.drawText(val, { x: col2, y: ry - 13, size: 11, font: r, color: p.textDark });
    ry -= 40;
  }

  y = Math.min(ly, ry) - 16;
  hRule(page, x, y, cw, p.accentLight, 0.7);
  y -= 36;

  // ── Documents list ────────────────────────────────────────────────────
  page.drawText('CONTENU DU DOSSIER', { x, y, size: 7.5, font: b, color: p.accent, characterSpacing: 2 });
  page.drawLine({ start: { x, y: y - 8 }, end: { x: x + 22, y: y - 8 }, thickness: 2, color: p.accent });
  y -= 28;

  for (const name of getDocsList(files)) {
    page.drawRectangle({ x, y: y + 2.5, width: 4, height: 4, color: p.accent });
    page.drawText(name, { x: x + 14, y, size: 11, font: r, color: p.textDark });
    y -= 23;
  }

  y -= 18;
  hRule(page, x, y, cw, p.accentLight, 0.7);
  y -= 22;

  page.drawText(
    'Dossier constitue avec soin. Tous les documents fournis sont authentiques.',
    { x, y, size: 8.5, font: i, color: p.textLight },
  );
}

// ─── applyPreviewWatermark ────────────────────────────────────────────────
// Moderate grid: visible enough to prevent free use, light enough to read through.
function applyPreviewWatermark(page, font) {
  const { width, height } = page.getSize();
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 4; col++) {
      page.drawText('APERCU', {
        x:       (col * width / 3) - 20,
        y:       (row * height / 4) + 35,
        size:    36,
        font,
        color:   rgb(0.60, 0.60, 0.60),
        opacity: 0.07,
        rotate:  degrees(35),
      });
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────

/**
 * @param {object}  userData      { firstName, lastName, email, phone, situation, revenue }
 * @param {object}  files         { identity, contract, payslips[], guarantor }
 * @param {string}  styleName     'classic' | 'modern' | 'premium'
 * @param {boolean} withWatermark true for preview, false for paid PDF
 * @returns {Promise<Buffer>}
 */
async function generateDossierPDF(userData, files, styleName, withWatermark) {
  const p   = PALETTES[styleName] || PALETTES.modern;
  const doc = await PDFDocument.create();
  const f   = await loadFonts(doc, p);

  // 1. Cover (index 0)
  await drawCover(doc, userData, files, p, f);

  // 2. TOC placeholder (index 1) — populated after all sections are known
  const tocPage = doc.addPage([PW, PH]);

  const tocEntries = [
    { label: 'Couverture', pageIndex: 0, displayPage: 1 },
    { label: 'Sommaire',   pageIndex: 1, displayPage: 2 },
  ];

  // 3. Identity
  if (files.identity) {
    const idx = await embedDoc(doc, files.identity, "Piece d'identite", p, f);
    tocEntries.push({ label: "Piece d'identite", pageIndex: idx, displayPage: idx + 1 });
  }

  // 4. Contract
  if (files.contract) {
    const idx = await embedDoc(doc, files.contract, 'Contrat de travail', p, f);
    tocEntries.push({ label: 'Contrat de travail', pageIndex: idx, displayPage: idx + 1 });
  }

  // 5. Payslips — first page gets section band + TOC entry; rest are continuation
  if (files.payslips?.length > 0) {
    const idx = await embedDoc(doc, files.payslips[0], 'Fiches de paie', p, f);
    tocEntries.push({ label: 'Fiches de paie', pageIndex: idx, displayPage: idx + 1 });
    for (let i = 1; i < files.payslips.length; i++) {
      await embedDoc(doc, files.payslips[i], null, p, f);
    }
  }

  // 6. Guarantor
  if (files.guarantor) {
    const idx = await embedDoc(doc, files.guarantor, 'Garant', p, f);
    tocEntries.push({ label: 'Garant', pageIndex: idx, displayPage: idx + 1 });
  }

  const total = doc.getPageCount();

  // 7. Populate TOC (2nd pass — all indices are now final)
  buildClickableToc(tocPage, tocEntries, doc, p, f);

  // 8. Footer on every page
  doc.getPages().forEach((pg, i) => drawFooter(pg, f, p, i + 1, total));

  // 9. Watermark on preview only
  if (withWatermark) {
    for (const pg of doc.getPages()) applyPreviewWatermark(pg, f.b);
  }

  return Buffer.from(await doc.save());
}

module.exports = { generateDossierPDF };
