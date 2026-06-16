import { kv } from '@vercel/kv';
import crypto from 'crypto';

const ALLOWED_ORIGIN = 'https://dose.heyitsmejosh.com';

function unauthorized(res) {
  return res.status(401).json({ error: 'unauthorized' });
}

function timingSafeCompare(a, b) {
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

function authenticate(req) {
  const token = process.env.DOSE_SYNC_TOKEN;
  if (!token) return { ok: false, tokenHash: null };
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return { ok: false, tokenHash: null };
  const provided = auth.slice(7);
  if (!timingSafeCompare(provided, token)) return { ok: false, tokenHash: null };
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex').slice(0, 16);
  return { ok: true, tokenHash };
}

function validateBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
  if (body.log !== undefined && !Array.isArray(body.log)) return false;
  if (body.substances !== undefined && !Array.isArray(body.substances)) return false;
  if (body.biometrics !== undefined && !Array.isArray(body.biometrics)) return false;
  if (body.medications !== undefined && !Array.isArray(body.medications)) return false;
  if (body.profile !== undefined && (typeof body.profile !== 'object' || Array.isArray(body.profile))) return false;
  return true;
}

const rateLimitStore = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 10;

function checkRateLimit(tokenHash) {
  const now = Date.now();
  const entry = rateLimitStore.get(tokenHash);
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    rateLimitStore.set(tokenHash, { start: now, count: 1 });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { ok, tokenHash } = authenticate(req);
  if (!ok) return unauthorized(res);

  if (!checkRateLimit(tokenHash)) {
    return res.status(429).json({ error: 'rate limit exceeded' });
  }

  const DATA_KEY = `dose:${tokenHash}`;

  if (req.method === 'GET') {
    const data = await kv.get(DATA_KEY);
    return res.status(200).json(data || { log: [], substances: [], biometrics: [], profile: {}, medications: [] });
  }

  if (req.method === 'PUT') {
    const body = req.body;
    if (!validateBody(body)) {
      return res.status(400).json({ error: 'invalid body' });
    }

    if (JSON.stringify(body).length > 1_000_000) {
      return res.status(413).json({ error: 'payload too large' });
    }

    const payload = {
      log: body.log || [],
      substances: body.substances || [],
      biometrics: body.biometrics || [],
      profile: body.profile || {},
      medications: body.medications || [],
      updatedAt: new Date().toISOString(),
    };

    await kv.set(DATA_KEY, payload);
    return res.status(200).json({ ok: true, updatedAt: payload.updatedAt });
  }

  return res.status(405).json({ error: 'method not allowed' });
}
