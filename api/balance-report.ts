import type { VercelRequest, VercelResponse } from '@vercel/node';

const CATWALK_BASE_URL = 'https://catwalk.mysterria.net';
const MAIN_API_BASE_URL = 'https://api.mysterria.net';

interface UserProfileDto {
  permissions?: string[];
}

// Gated proxy for the CoI balance report. Catwalk's /balance/report is
// API-key-protected, so it must not ride the open catwalk-proxy (which would
// hand the report to any visitor). The session is verified against the main
// API and the caller must hold ADMIN or BALANCE:MANAGE — the same gate as the
// /tools/balance route itself.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const profileResponse = await fetch(`${MAIN_API_BASE_URL}/api/user/profile`, {
      headers: { Authorization: authHeader, Accept: 'application/json' },
    });

    if (!profileResponse.ok) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session' });
    }

    const profile: UserProfileDto = await profileResponse.json();
    // Backend may return permissions with or without the PERM_ prefix (see stores/auth.ts)
    const permissions = (profile.permissions || []).map((p) => p.replace(/^PERM_/, ''));
    if (!permissions.includes('ADMIN') && !permissions.includes('BALANCE:MANAGE')) {
      return res.status(403).json({ success: false, message: 'Missing BALANCE:MANAGE permission' });
    }

    const headers: Record<string, string> = { Accept: 'application/json' };
    const token = process.env.CATWALK_API_TOKEN;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const upstreamResponse = await fetch(`${CATWALK_BASE_URL}/balance/report`, { headers });
    const contentType = upstreamResponse.headers.get('content-type') || 'application/json';
    const text = await upstreamResponse.text();

    res.status(upstreamResponse.status);
    res.setHeader('Content-Type', contentType);
    return res.send(text);
  } catch (error) {
    console.error('Error in balance-report:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(502).json({ success: false, message: 'Failed to reach upstream service', details: errorMessage });
  }
}
