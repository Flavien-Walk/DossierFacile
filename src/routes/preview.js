'use strict';

const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { generateDossierPDF } = require('../utils/pdfGenerator');
const fileStore = require('../utils/fileStore');

const router = express.Router();

// multer: memory storage only — no disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error(`Type de fichier non supporté: ${file.mimetype}`));
  },
});

const uploadFields = upload.fields([
  { name: 'identity',       maxCount: 1  },
  { name: 'domicile',       maxCount: 1  },
  { name: 'contract',       maxCount: 1  },
  { name: 'payslips',       maxCount: 10 },
  { name: 'taxNotice',      maxCount: 1  },
  { name: 'businessDocs',   maxCount: 10 },
  { name: 'guarantorFiles', maxCount: 20 },
]);

router.post('/generate-preview', uploadFields, async (req, res) => {
  try {
    const userData = JSON.parse(req.body.userData || '{}');
    const style = req.body.style || 'modern';

    if (!userData.firstName || !userData.lastName || !userData.email) {
      return res.status(400).json({ error: 'Données utilisateur incomplètes.' });
    }

    const reqFiles = req.files || {};
    const files = {
      identity:       reqFiles.identity?.[0]       || null,
      domicile:       reqFiles.domicile?.[0]        || null,
      contract:       reqFiles.contract?.[0]        || null,
      payslips:       reqFiles.payslips              || [],
      taxNotice:      reqFiles.taxNotice?.[0]        || null,
      businessDocs:   reqFiles.businessDocs          || [],
      guarantorFiles: reqFiles.guarantorFiles        || [],
    };

    if (!files.identity) {
      return res.status(400).json({ error: "La pièce d'identité est obligatoire." });
    }

    // Generate preview PDF with watermark
    const pdfBuffer = await generateDossierPDF(userData, files, style, true);

    // Store files in memory for later final generation
    const sessionToken = uuidv4();
    fileStore.set(sessionToken, { userData, files, style });

    return res.json({
      pdfBase64: pdfBuffer.toString('base64'),
      sessionToken,
    });
  } catch (err) {
    console.error('[preview]', err);
    return res.status(500).json({ error: "Erreur lors de la génération de l'aperçu." });
  }
});

module.exports = router;
