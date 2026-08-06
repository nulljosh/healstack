import Stripe from 'stripe';

let stripe;
const getStripe = (env) => stripe || (stripe = new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() }));

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const sig = request.headers.get('stripe-signature');
  const body = await request.text();

  let event;
  try {
    event = await getStripe(env).webhooks.constructEventAsync(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[WEBHOOK] Signature verification failed:', err.message);
    return json(400, { error: 'Webhook signature verification failed' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;
    if (userId) {
      await env.DOSE_KV.put(`pro:${userId}`, 'true');
      console.log('[WEBHOOK] Pro unlocked:', userId);
    }
  }

  return json(200, { received: true });
}
