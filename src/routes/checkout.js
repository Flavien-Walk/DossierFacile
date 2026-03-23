'use strict';

const express = require('express');
const Stripe = require('stripe');

const router = express.Router();

router.post('/create-checkout-session', async (req, res) => {
  const { email, sessionToken } = req.body;

  if (!sessionToken) {
    return res.status(400).json({ error: 'Session token manquant.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'DossierFacile — Dossier locataire professionnel',
              description: 'PDF final sans filigrane, téléchargement immédiat',
            },
            unit_amount: 500, // 5,00 €
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: { sessionToken },
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/create`,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('[checkout]', err);
    return res.status(500).json({ error: 'Erreur lors de la création de la session de paiement.' });
  }
});

module.exports = router;
