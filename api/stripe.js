import { kv } from '@vercel/kv';
import Stripe from 'stripe';

let stripe;
function getStripe() {
  if (!stripe) stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe;
}

const ALLOWED_ORIGIN = 'https://healstack.heyitsmejosh.com';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  if (req.method === 'GET' && action === 'status') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const isPro = Boolean(await kv.get(`pro:${userId}`));
    return res.status(200).json({ isPro });
  }

  if (req.method === 'POST' && action === 'checkout') {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: 'userId required' });

      const session = await getStripe().checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
        success_url: `${ALLOWED_ORIGIN}/journal?pro=1`,
        cancel_url: `${ALLOWED_ORIGIN}/journal`,
        client_reference_id: userId,
        customer_creation: 'always',
      });

      return res.status(200).json({ url: session.url });
    } catch (err) {
      console.error('[STRIPE/checkout] Error:', err.message);
      return res.status(500).json({ error: 'Checkout session creation failed' });
    }
  }

  return res.status(400).json({ error: 'Unknown action' });
}
