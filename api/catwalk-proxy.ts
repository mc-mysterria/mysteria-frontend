import type { VercelRequest, VercelResponse } from '@vercel/node';

const CATWALK_BASE_URL = 'https://catwalk.mysterria.net';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path, ...restQuery } = req.query;

  if (typeof path !== 'string' || !path) {
    console.error('Invalid path parameter:', path);
    return res.status(400).json({ error: 'Invalid request', details: 'Path parameter missing or invalid' });
  }

  if (path === 'pathway/everyone' || path.startsWith('pathway/single/')) {
    return res.status(403).json({
      error: 'Forbidden',
      details: 'Use /api/beyonder-stats or /api/beyonder-self instead.',
    });
  }

  if (path === 'balance/report' || path.startsWith('balance/')) {
    return res.status(403).json({
      error: 'Forbidden',
      details: 'Use /api/balance-report instead.',
    });
  }

  const queryString = new URLSearchParams(
    Object.entries(restQuery).flatMap(([key, value]) =>
      Array.isArray(value) ? value.map((v) => [key, v]) : value !== undefined ? [[key, value]] : [],
    ),
  ).toString();

  const upstreamUrl = `${CATWALK_BASE_URL}/${path}${queryString ? `?${queryString}` : ''}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  // The /stats/ endpoints are public on catwalk; everything else requires the bearer token.
  // The token is kept here (server-side only) and is never exposed to the client bundle.
  const token = process.env.CATWALK_API_TOKEN;
  if (token && !path.startsWith('stats/')) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      body:
        req.method && req.method !== 'GET' && req.method !== 'HEAD'
          ? JSON.stringify(req.body)
          : undefined,
    });

    const contentType = upstreamResponse.headers.get('content-type') || 'application/json';
    const text = await upstreamResponse.text();

    res.status(upstreamResponse.status);
    res.setHeader('Content-Type', contentType);
    return res.send(text);
  } catch (error) {
    console.error('Error in catwalk-proxy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(502).json({ error: 'Failed to reach catwalk service', details: errorMessage });
  }
}
