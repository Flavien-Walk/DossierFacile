'use strict';

const express = require('express');
const Stripe = require('stripe');
const { generateDossierPDF } = require('../utils/pdfGenerator');
const fileStore = require('../utils/fileStore');

const router = express.Router();

router.post('/generate-final', async (req, res) => {
  const { sessionId, sessionToken } = req.body;

  if (!sessionId || !sessionToken) {
    return res.status(400).json({ error: 'Paramètres manquants.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // 1. Verify Stripe payment
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (stripeSession.payment_status !== 'paid') {
      return res.status(403).json({ error: 'Paiement non confirmé.' });
    }

    // 2. Verify session token matches Stripe metadata
    if (stripeSession.metadata?.sessionToken !== sessionToken) {
      return res.status(403).json({ error: 'Session invalide.' });
    }

    // 3. Retrieve files from memory store
    const stored = fileStore.get(sessionToken);
    if (!stored) {
      return res.status(410).json({
        error: 'Session expirée. Vos fichiers ont été supprimés automatiquement. Veuillez recommencer.',
      });
    }

    const { userData, files, style } = stored;

    // 4. Generate final PDF without watermark
    const pdfBuffer = await generateDossierPDF(userData, files, style, false);

    // 5. Delete files from memory immediately
    fileStore.del(sessionToken);

    // 6. Send PDF
    const filename = `DossierLocataire_${userData.lastName}_${userData.firstName}.pdf`
      .replace(/[^a-zA-Z0-9_.-]/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('[final]', err);
    return res.status(500).json({ error: 'Erreur lors de la génération du PDF final.' });
  }
});

module.exports = router;
