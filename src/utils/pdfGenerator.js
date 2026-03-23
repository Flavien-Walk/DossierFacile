'use strict';

const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');

// ─────────────────────────────────────────────
// Style definitions
// ─────────────────────────────────────────────

const STYLES = {
  classic: {
    headerBg: rgb(0.94, 0.94, 0.94),
    headerText: rgb(0.15, 0.15, 0.15),
    accentLine: rgb(0.6, 0.6, 0.6),
    nameColor: rgb(0.05, 0.05, 0.05),
    labelColor: rgb(0.5, 0.5, 0.5),
    valueColor: rgb(0.1, 0.1, 0.1),
    sectionBg: rgb(0.96, 0.96, 0.96),
    sectionText: rgb(0.25, 0.25, 0.25),
    bodyFont: StandardFonts.TimesRoman,
    boldFont: StandardFonts.TimesRomanBold,
  },
  modern: {
    headerBg: rgb(0.23, 0.51, 0.96),
    headerText: rgb(1, 1, 1),
    accentLine: rgb(0.23, 0.51, 0.96),
    nameColor: rgb(0.05, 0.05, 0.05),
    labelColor: rgb(0.23, 0.51, 0.96),
    valueColor: rgb(0.1, 0.1, 0.1),
    sectionBg: rgb(0.23, 0.51, 0.96),
    sectionText: rgb(1, 1, 1),
    bodyFont: StandardFonts.Helvetica,
    boldFont: StandardFonts.HelveticaBold,
  },
  premium: {
    headerBg: rgb(0.08, 0.22, 0.42),
    headerText: rgb(1, 1, 1),
    accentLine: rgb(0.08, 0.22, 0.42),
    nameColor: rgb(0.05, 0.05, 0.05),
    labelColor: rgb(0.08, 0.22, 0.42),
    valueColor: rgb(0.1, 0.1, 0.1),
    sectionBg: rgb(0.08, 0.22, 0.42),
    sectionText: rgb(1, 1, 1),
    bodyFont: StandardFonts.Helvetica,
    boldFont: StandardFonts.HelveticaBold,
  },
};

const SITUATION_LABELS = {
  cdi: 'CDI',
  cdd: 'CDD',
  etudiant: 'Étudiant(e)',
  freelance: 'Freelance / Indépendant',
  autre: 'Autre',
};

function formatRevenue(revenue) {
  return `${Number(revenue).toLocaleString('fr-FR')} €/mois`;
}

function formatDate() {
  return new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─────────────────────────────────────────────
// Cover page builders
// ─────────────────────────────────────────────

async function drawClassicCover(doc, userData) {
  const s = STYLES.classic;
  const regularFont = await doc.embedFont(s.bodyFont);
  const boldFont = await doc.embedFont(s.boldFont);
  const page = doc.addPage([595, 842]);

  // Header band
  page.drawRectangle({ x: 0, y: 762, width: 595, height: 80, color: s.headerBg });

  // Title
  page.drawText('DOSSIER LOCATAIRE', {
    x: 50, y: 803, size: 18, font: boldFont, color: s.headerText,
  });

  // Date (right)
  const date = formatDate();
  page.drawText(date, {
    x: 595 - 50 - boldFont.widthOfTextAtSize(date, 10), y: 803,
    size: 10, font: regularFont, color: rgb(0.6, 0.6, 0.6),
  });

  // Separator line
  page.drawLine({ start: { x: 50, y: 752 }, end: { x: 545, y: 752 }, thickness: 1, color: s.accentLine });

  // Full name
  const fullName = `${userData.firstName} ${userData.lastName}`;
  page.drawText(fullName, { x: 50, y: 695, size: 30, font: boldFont, color: s.nameColor });

  // Short underline accent
  page.drawLine({ start: { x: 50, y: 680 }, end: { x: 130, y: 680 }, thickness: 2, color: rgb(0.3, 0.3, 0.3) });

  // Fields
  const fields = [
    { label: 'SITUATION PROFESSIONNELLE', value: SITUATION_LABELS[userData.situation] || userData.situation },
    { label: 'REVENUS MENSUELS', value: formatRevenue(userData.revenue) },
    { label: 'EMAIL', value: userData.email },
    { label: 'TÉLÉPHONE', value: userData.phone },
  ];

  let y = 640;
  for (const { label, value } of fields) {
    page.drawText(label, { x: 50, y, size: 8, font: boldFont, color: s.labelColor });
    page.drawText(value, { x: 50, y: y - 17, size: 13, font: regularFont, color: s.valueColor });
    y -= 55;
  }
}

async function drawModernCover(doc, userData) {
  const s = STYLES.modern;
  const regularFont = await doc.embedFont(s.bodyFont);
  const boldFont = await doc.embedFont(s.boldFont);
  const page = doc.addPage([595, 842]);

  // Blue header (top 38%)
  const headerHeight = 320;
  page.drawRectangle({ x: 0, y: 842 - headerHeight, width: 595, height: headerHeight, color: s.headerBg });

  // Label on header
  page.drawText('DOSSIER LOCATAIRE', {
    x: 50, y: 800, size: 10, font: boldFont, color: rgb(0.7, 0.85, 1),
    characterSpacing: 1.5,
  });

  // Name on header
  const fullName = `${userData.firstName} ${userData.lastName}`;
  page.drawText(fullName, { x: 50, y: 765, size: 28, font: boldFont, color: s.headerText });

  // Subtitle
  const subtitle = `${SITUATION_LABELS[userData.situation] || userData.situation}  ·  ${formatRevenue(userData.revenue)}`;
  page.drawText(subtitle, { x: 50, y: 740, size: 12, font: regularFont, color: rgb(0.8, 0.9, 1) });

  // Date
  page.drawText(formatDate(), { x: 50, y: 550, size: 10, font: regularFont, color: rgb(0.5, 0.5, 0.5) });

  // Separator
  page.drawLine({ start: { x: 50, y: 540 }, end: { x: 545, y: 540 }, thickness: 1, color: rgb(0.88, 0.88, 0.88) });

  // Contact fields (2 columns)
  const left = [
    { label: 'EMAIL', value: userData.email },
    { label: 'TÉLÉPHONE', value: userData.phone },
  ];
  let y = 500;
  for (const { label, value } of left) {
    page.drawText(label, { x: 50, y, size: 8, font: boldFont, color: s.labelColor });
    page.drawText(value, { x: 50, y: y - 16, size: 13, font: regularFont, color: s.valueColor });
    y -= 55;
  }
}

async function drawPremiumCover(doc, userData) {
  const s = STYLES.premium;
  const regularFont = await doc.embedFont(s.bodyFont);
  const boldFont = await doc.embedFont(s.boldFont);
  const page = doc.addPage([595, 842]);

  // Navy sidebar
  const sidebarWidth = 185;
  page.drawRectangle({ x: 0, y: 0, width: sidebarWidth, height: 842, color: s.headerBg });

  // Sidebar text — rotated label
  page.drawText('DOSSIER', {
    x: 50, y: 500, size: 13, font: boldFont, color: rgb(1, 1, 1),
    rotate: degrees(90),
  });
  page.drawText('LOCATAIRE', {
    x: 67, y: 500, size: 13, font: boldFont, color: rgb(0.6, 0.75, 0.95),
    rotate: degrees(90),
  });

  // Initials circle on sidebar
  const initials = `${userData.firstName[0] || ''}${userData.lastName[0] || ''}`.toUpperCase();
  page.drawCircle({ x: sidebarWidth / 2, y: 720, size: 36, color: rgb(0.15, 0.35, 0.6) });
  const initialsWidth = boldFont.widthOfTextAtSize(initials, 18);
  page.drawText(initials, {
    x: sidebarWidth / 2 - initialsWidth / 2, y: 711,
    size: 18, font: boldFont, color: rgb(1, 1, 1),
  });

  // Main content area
  const contentX = sidebarWidth + 30;
  const contentWidth = 595 - contentX - 30;

  // Title
  page.drawText('Dossier Locataire', { x: contentX, y: 790, size: 11, font: boldFont, color: rgb(0.6, 0.6, 0.6), characterSpacing: 0.5 });

  // Name
  const fullName = `${userData.firstName} ${userData.lastName}`;
  page.drawText(fullName, { x: contentX, y: 755, size: 26, font: boldFont, color: s.nameColor });

  // Accent line
  page.drawLine({ start: { x: contentX, y: 742 }, end: { x: contentX + 100, y: 742 }, thickness: 2, color: s.accentLine });

  // Date
  page.drawText(formatDate(), { x: contentX, y: 720, size: 10, font: regularFont, color: rgb(0.6, 0.6, 0.6) });

  // Fields
  const fields = [
    { label: 'SITUATION', value: SITUATION_LABELS[userData.situation] || userData.situation },
    { label: 'REVENUS MENSUELS', value: formatRevenue(userData.revenue) },
    { label: 'EMAIL', value: userData.email },
    { label: 'TÉLÉPHONE', value: userData.phone },
  ];

  let y = 665;
  for (const { label, value } of fields) {
    page.drawRectangle({ x: contentX, y: y + 2, width: 3, height: 30, color: s.accentLine });
    page.drawText(label, { x: contentX + 12, y: y + 22, size: 7.5, font: boldFont, color: s.labelColor, characterSpacing: 0.8 });
    page.drawText(value, { x: contentX + 12, y: y + 5, size: 13, font: regularFont, color: s.valueColor });
    y -= 55;
  }
}

// ─────────────────────────────────────────────
// Section divider page
// ─────────────────────────────────────────────

async function addSectionPage(doc, title, styleName) {
  const s = STYLES[styleName];
  const boldFont = await doc.embedFont(s.boldFont);
  const page = doc.addPage([595, 842]);

  // Accent bar on left
  page.drawRectangle({ x: 0, y: 0, width: 6, height: 842, color: s.sectionBg });

  // Section title
  page.drawText(title, { x: 50, y: 430, size: 22, font: boldFont, color: s.sectionBg });

  // Thin line below
  page.drawLine({
    start: { x: 50, y: 415 }, end: { x: 200, y: 415 },
    thickness: 1.5, color: s.accentLine,
  });
}

// ─────────────────────────────────────────────
// Embed uploaded documents
// ─────────────────────────────────────────────

async function embedDocument(doc, file) {
  const { buffer, mimetype } = file;

  if (mimetype === 'application/pdf') {
    try {
      const srcDoc = await PDFDocument.load(buffer);
      const pages = await doc.copyPages(srcDoc, srcDoc.getPageIndices());
      pages.forEach((p) => doc.addPage(p));
    } catch {
      // Corrupted PDF — skip silently
    }
    return;
  }

  // Image (jpg/png)
  let image;
  try {
    if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') {
      image = await doc.embedJpg(buffer);
    } else if (mimetype === 'image/png') {
      image = await doc.embedPng(buffer);
    } else {
      return; // Unsupported
    }
  } catch {
    return;
  }

  const page = doc.addPage([595, 842]);
  const { width, height } = image;
  const scale = Math.min((595 - 60) / width, (842 - 60) / height, 1);
  const scaledW = width * scale;
  const scaledH = height * scale;

  page.drawImage(image, {
    x: (595 - scaledW) / 2,
    y: (842 - scaledH) / 2,
    width: scaledW,
    height: scaledH,
  });
}

// ─────────────────────────────────────────────
// Watermark
// ─────────────────────────────────────────────

async function addWatermarkToPage(page, font) {
  const { width, height } = page.getSize();
  const text = 'APERÇU — VERSION NON PAYÉE';
  const fontSize = 26;

  for (let y = 80; y < height; y += 170) {
    page.drawText(text, {
      x: 30,
      y,
      size: fontSize,
      font,
      color: rgb(0.6, 0.6, 0.6),
      opacity: 0.25,
      rotate: degrees(38),
    });
  }
}

// ─────────────────────────────────────────────
// Main generator
// ─────────────────────────────────────────────

/**
 * Generate a dossier PDF.
 * @param {object} userData - { firstName, lastName, email, phone, situation, revenue }
 * @param {object} files    - { identity, contract, payslips[], guarantor }
 * @param {string} styleName - 'classic' | 'modern' | 'premium'
 * @param {boolean} withWatermark
 * @returns {Promise<Buffer>}
 */
async function generateDossierPDF(userData, files, styleName, withWatermark) {
  const style = STYLES[styleName] || STYLES.modern;
  const doc = await PDFDocument.create();

  // 1. Cover page
  if (styleName === 'classic') await drawClassicCover(doc, userData);
  else if (styleName === 'premium') await drawPremiumCover(doc, userData);
  else await drawModernCover(doc, userData);

  // 2. Identity
  if (files.identity) {
    await addSectionPage(doc, "PIÈCE D'IDENTITÉ", styleName);
    await embedDocument(doc, files.identity);
  }

  // 3. Contract
  if (files.contract) {
    await addSectionPage(doc, 'CONTRAT DE TRAVAIL', styleName);
    await embedDocument(doc, files.contract);
  }

  // 4. Payslips
  if (files.payslips && files.payslips.length > 0) {
    await addSectionPage(doc, 'FICHES DE PAIE', styleName);
    for (const f of files.payslips) {
      await embedDocument(doc, f);
    }
  }

  // 5. Guarantor
  if (files.guarantor) {
    await addSectionPage(doc, 'GARANT', styleName);
    await embedDocument(doc, files.guarantor);
  }

  // 6. Watermark (preview only)
  if (withWatermark) {
    const boldFont = await doc.embedFont(style.boldFont);
    const pages = doc.getPages();
    for (const page of pages) {
      await addWatermarkToPage(page, boldFont);
    }
  }

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}

module.exports = { generateDossierPDF };
