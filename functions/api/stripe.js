import Stripe from 'stripe';

let stripe;
function getStripe(env) {
  if (!stripe) {
    stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  return stripe;
}

const ALLOWED_ORIGIN = 'https://healstack.heyitsmejosh.com';

function json(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...extraHeaders,
    },
  });
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (request.method === 'GET' && action === 'status') {
    const userId = url.searchParams.get('userId');
    if (!userId) return json(400, { error: 'userId required' });
    const isPro = await env.DOSE_KV.get(`pro:${userId}`);
    return json(200, { isPro: Boolean(isPro) });
  }

  if (request.method === 'POST' && action === 'checkout') {
    try {
      let body;
      try {
        body = await request.json();
      } catch {
        return json(400, { error: 'invalid body' });
      }

      const { userId } = body;
      if (!userId) return json(400, { error: 'userId required' });

      const session = await getStripe(env).checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
        success_url: `${ALLOWED_ORIGIN}/journal?pro=1`,
        cancel_url: `${ALLOWED_ORIGIN}/journal`,
        client_reference_id: userId,
        customer_creation: 'always',
      });

      return json(200, { url: session.url });
    } catch (err) {
      console.error('[STRIPE/checkout] Error:', err.message);
      return json(500, { error: 'Checkout session creation failed' });
    }
  }

  return json(400, { error: 'Unknown action' });
}
