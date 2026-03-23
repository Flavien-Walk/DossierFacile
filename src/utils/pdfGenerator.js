'use strict';

const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');

// ─── Layout constants ────────────────────────────────────────────────────────
const PW = 595;    // A4 width  (pt)
const PH = 842;    // A4 height (pt)
const M  = 42;     // outer margin
const CW = PW - 2 * M;   // 511 — content width

// ─── Style definitions ────────────────────────────────────────────────────────
const STYLES = {
  classic: {
    accent:      rgb(0.28, 0.34, 0.46),   // muted blue-grey
    accentLight: rgb(0.88, 0.90, 0.94),
    textDark:    rgb(0.10, 0.12, 0.16),
    textMid:     rgb(0.38, 0.42, 0.50),
    textLight:   rgb(0.60, 0.63, 0.70),
    white:       rgb(1, 1, 1),
    bodyFont:    StandardFonts.TimesRoman,
    boldFont:    StandardFonts.TimesRomanBold,
  },
  modern: {
    accent:      rgb(0.29, 0.42, 0.97),   // soft indigo
    accentLight: rgb(0.92, 0.94, 0.99),
    textDark:    rgb(0.08, 0.10, 0.14),
    textMid:     rgb(0.35, 0.40, 0.50),
    textLight:   rgb(0.58, 0.62, 0.70),
    white:       rgb(1, 1, 1),
    bodyFont:    StandardFonts.Helvetica,
    boldFont:    StandardFonts.HelveticaBold,
  },
  premium: {
    accent:      rgb(0.08, 0.20, 0.38),   // deep navy
    accentLight: rgb(0.90, 0.93, 0.97),
    textDark:    rgb(0.07, 0.10, 0.14),
    textMid:     rgb(0.33, 0.38, 0.47),
    textLight:   rgb(0.55, 0.60, 0.68),
    white:       rgb(1, 1, 1),
    bodyFont:    StandardFonts.Helvetica,
    boldFont:    StandardFonts.HelveticaBold,
  },
};

// ─── Text helpers ─────────────────────────────────────────────────────────────

const SITUATION_LABELS = {
  cdi:      'CDI',
  cdd:      'CDD',
  etudiant: 'Etudiant(e)',
  freelance:'Freelance / Independant',
  autre:    'Autre',
};

function formatRevenue(revenue) {
  // Regex-based thousands separator — avoids U+202F from toLocaleString (not in WinAnsi)
  const n = Math.round(Number(revenue) || 0);
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' EUR/mois';
}

function formatDate() {
  const d = new Date();
  const months = [
    'janvier','fevrier','mars','avril','mai','juin',
    'juillet','aout','septembre','octobre','novembre','decembre',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function buildDocsList(files) {
  const docs = [];
  if (files.identity) docs.push("Piece d'identite");
  if (files.contract) docs.push('Contrat de travail');
  if (files.payslips && files.payslips.length > 0) {
    const n = files.payslips.length;
    docs.push(`Fiches de paie (${n} document${n > 1 ? 's' : ''})`);
  }
  if (files.guarantor) docs.push('Garant');
  return docs;
}

// ─── Drawing primitives ───────────────────────────────────────────────────────

function hLine(page, x, y, w, color, thickness) {
  page.drawLine({ start: { x, y }, end: { x: x + w, y }, thickness: thickness || 0.6, color });
}

function accentUnderline(page, x, y, s) {
  page.drawLine({ start: { x, y }, end: { x: x + 22, y }, thickness: 2, color: s.accent });
}

function pageChrome(page, s, rf) {
  // Top accent bar
  page.drawRectangle({ x: 0, y: PH - 6, width: PW, height: 6, color: s.accent });
  // Left thin strip
  page.drawRectangle({ x: 0, y: 0, width: 3, height: PH - 6, color: s.accentLight });
  // Footer text
  const ftxt = 'Document confidentiel - DossierFacile';
  const fw = rf.widthOfTextAtSize(ftxt, 8);
  page.drawText(ftxt, { x: (PW - fw) / 2, y: M / 2, size: 8, font: rf, color: s.textLight });
}

// ─── Cover page ───────────────────────────────────────────────────────────────

async function drawCoverPage(doc, userData, files, styleName) {
  const s  = STYLES[styleName] || STYLES.modern;
  const rf = await doc.embedFont(s.bodyFont);
  const bf = await doc.embedFont(s.boldFont);
  const page = doc.addPage([PW, PH]);

  // White base
  page.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: s.white });
  pageChrome(page, s, rf);

  const x = M;
  let y = PH - 6 - M - 4;

  // ── Header row: label + date ──────────────────────────────────────────────
  page.drawText('DOSSIER LOCATAIRE', {
    x, y, size: 8.5, font: bf, color: s.textLight, characterSpacing: 2,
  });
  const dateStr = formatDate();
  const dw = rf.widthOfTextAtSize(dateStr, 8.5);
  page.drawText(dateStr, { x: x + CW - dw, y, size: 8.5, font: rf, color: s.textLight });
  y -= 6;
  hLine(page, x, y, CW, s.accentLight, 0.8);
  y -= 26;

  // ── Hero: full name ───────────────────────────────────────────────────────
  const fullName = `${userData.firstName} ${userData.lastName}`;
  page.drawText(fullName, { x, y, size: 30, font: bf, color: s.textDark });
  y -= 14;

  // Short accent underline below name
  page.drawLine({ start: { x, y }, end: { x: x + 48, y }, thickness: 2.5, color: s.accent });
  y -= 14;

  // Subtitle: situation + revenus
  const sit      = SITUATION_LABELS[userData.situation] || userData.situation;
  const subtitle = sit + '  -  ' + formatRevenue(userData.revenue);
  page.drawText(subtitle, { x, y, size: 11, font: rf, color: s.textMid });
  y -= 26;

  hLine(page, x, y, CW, s.accentLight, 0.8);
  y -= 30;

  // ── Two-column info block ─────────────────────────────────────────────────
  const colGap = 30;
  const colW   = (CW - colGap) / 2;
  const col2   = x + colW + colGap;

  // Left: PROFIL
  page.drawText('PROFIL', { x, y, size: 7.5, font: bf, color: s.accent, characterSpacing: 1.5 });
  accentUnderline(page, x, y - 7, s);
  let ly = y - 23;
  for (const [label, value] of [
    ['SITUATION',    sit],
    ['REVENUS NETS', formatRevenue(userData.revenue)],
  ]) {
    page.drawText(label, { x, y: ly,      size: 7.5, font: bf, color: s.textLight, characterSpacing: 0.5 });
    page.drawText(value, { x, y: ly - 14, size: 11,  font: rf, color: s.textDark });
    ly -= 40;
  }

  // Right: COORDONNEES
  page.drawText('COORDONNEES', { x: col2, y, size: 7.5, font: bf, color: s.accent, characterSpacing: 1.5 });
  accentUnderline(page, col2, y - 7, s);
  let ry = y - 23;
  for (const [label, value] of [
    ['EMAIL',     userData.email],
    ['TELEPHONE', userData.phone],
  ]) {
    page.drawText(label, { x: col2, y: ry,      size: 7.5, font: bf, color: s.textLight, characterSpacing: 0.5 });
    page.drawText(value, { x: col2, y: ry - 14, size: 11,  font: rf, color: s.textDark });
    ry -= 40;
  }

  y = Math.min(ly, ry) - 18;
  hLine(page, x, y, CW, s.accentLight, 0.8);
  y -= 30;

  // ── Documents inclus ──────────────────────────────────────────────────────
  page.drawText('CONTENU DU DOSSIER', { x, y, size: 7.5, font: bf, color: s.accent, characterSpacing: 1.5 });
  accentUnderline(page, x, y - 7, s);
  y -= 22;

  for (const docName of buildDocsList(files)) {
    // Bullet square
    page.drawRectangle({ x, y: y + 2.5, width: 3.5, height: 3.5, color: s.accent });
    page.drawText(docName, { x: x + 12, y, size: 11, font: rf, color: s.textDark });
    y -= 20;
  }

  y -= 14;
  hLine(page, x, y, CW, s.accentLight, 0.8);
}

// ─── Section divider page ─────────────────────────────────────────────────────

async function addSectionPage(doc, title, styleName) {
  const s  = STYLES[styleName] || STYLES.modern;
  const rf = await doc.embedFont(s.bodyFont);
  const bf = await doc.embedFont(s.boldFont);
  const page = doc.addPage([PW, PH]);

  page.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: s.white });
  pageChrome(page, s, rf);

  // Title at visual center (golden ratio: ~48% from bottom)
  const cy = Math.round(PH * 0.48);

  page.drawText(title.toUpperCase(), {
    x: M, y: cy,
    size: 26, font: bf, color: s.textDark, characterSpacing: 1,
  });

  // Accent underline
  page.drawLine({
    start: { x: M, y: cy - 12 }, end: { x: M + 50, y: cy - 12 },
    thickness: 2.5, color: s.accent,
  });

  // Hint line
  page.drawText('Documents de la section ci-apres', {
    x: M, y: cy - 32,
    size: 10, font: rf, color: s.textLight,
  });
}

// ─── Document embedding ───────────────────────────────────────────────────────

async function embedDocument(doc, file) {
  const { buffer, mimetype } = file;

  // ── PDF: copy pages at their native size ──────────────────────────────────
  if (mimetype === 'application/pdf') {
    try {
      const src = await PDFDocument.load(buffer);
      const pages = await doc.copyPages(src, src.getPageIndices());
      pages.forEach(p => doc.addPage(p));
    } catch {
      // Corrupted PDF — skip silently
    }
    return;
  }

  // ── Image: scale to fill, centered ───────────────────────────────────────
  let image;
  try {
    if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') {
      image = await doc.embedJpg(buffer);
    } else if (mimetype === 'image/png') {
      image = await doc.embedPng(buffer);
    } else {
      return; // Unsupported type
    }
  } catch {
    return;
  }

  const { width, height } = image;

  // Scale to fill available content area — NOTE: no artificial cap of 1,
  // so small images are scaled UP to maximise readability.
  const maxW  = PW - 2 * M;
  const maxH  = PH - 2 * M;
  const scale = Math.min(maxW / width, maxH / height);
  const sw    = width  * scale;
  const sh    = height * scale;

  const cx = (PW - sw) / 2;
  const cy = (PH - sh) / 2;

  const page = doc.addPage([PW, PH]);

  // Subtle warm grey background
  page.drawRectangle({ x: 0, y: 0, width: PW, height: PH, color: rgb(0.95, 0.95, 0.96) });

  // White backing card (shadow illusion)
  const pad = 10;
  page.drawRectangle({
    x: cx - pad, y: cy - pad,
    width: sw + 2 * pad, height: sh + 2 * pad,
    color: rgb(1, 1, 1),
  });

  // Image
  page.drawImage(image, { x: cx, y: cy, width: sw, height: sh });
}

// ─── Watermark ────────────────────────────────────────────────────────────────

function applyWatermark(page, font) {
  const { width, height } = page.getSize();
  const text = 'APERCU - NON PAYEE';

  for (let y = 60; y < height + 300; y += 200) {
    page.drawText(text, {
      x: 25, y,
      size: 22, font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.15,
      rotate: degrees(35),
    });
  }
}

// ─── Main generator ───────────────────────────────────────────────────────────

/**
 * Generate a dossier PDF.
 * @param {object}  userData      - { firstName, lastName, email, phone, situation, revenue }
 * @param {object}  files         - { identity, contract, payslips[], guarantor }
 * @param {string}  styleName     - 'classic' | 'modern' | 'premium'
 * @param {boolean} withWatermark
 * @returns {Promise<Buffer>}
 */
async function generateDossierPDF(userData, files, styleName, withWatermark) {
  const s   = STYLES[styleName] || STYLES.modern;
  const doc = await PDFDocument.create();

  // 1. Cover page
  await drawCoverPage(doc, userData, files, styleName);

  // 2. Identity
  if (files.identity) {
    await addSectionPage(doc, "Piece d'identite", styleName);
    await embedDocument(doc, files.identity);
  }

  // 3. Contract
  if (files.contract) {
    await addSectionPage(doc, 'Contrat de travail', styleName);
    await embedDocument(doc, files.contract);
  }

  // 4. Payslips
  if (files.payslips && files.payslips.length > 0) {
    await addSectionPage(doc, 'Fiches de paie', styleName);
    for (const f of files.payslips) {
      await embedDocument(doc, f);
    }
  }

  // 5. Guarantor
  if (files.guarantor) {
    await addSectionPage(doc, 'Garant', styleName);
    await embedDocument(doc, files.guarantor);
  }

  // 6. Watermark on preview only
  if (withWatermark) {
    const boldFont = await doc.embedFont(s.boldFont);
    for (const page of doc.getPages()) {
      applyWatermark(page, boldFont);
    }
  }

  return Buffer.from(await doc.save());
}

module.exports = { generateDossierPDF };
