const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
  const { priceId } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        { price: priceId, quantity: 1 }
      ],
      mode: 'subscription',
      success_url: 'http://localhost:5173/pricing?success=true',
      cancel_url: 'http://localhost:5173/pricing?canceled=true',
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 