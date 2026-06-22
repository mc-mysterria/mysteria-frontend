import type { VercelRequest, VercelResponse } from '@vercel/node';

const CATWALK_BASE_URL = 'https://catwalk.mysterria.net';
const MAIN_API_BASE_URL = 'https://api.mysterria.net';

interface UserProfileDto {
  nickname?: string;
  verified: boolean;
}

// Resolves the caller's own beyonder data. The nickname is derived server-side
// from the verified session (main API), never taken from client input, so the
// browser cannot request another player's pathway/sequence by changing a param.
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
    if (!profile.verified || !profile.nickname) {
      return res.status(200).json({ success: false, message: 'Account not verified' });
    }

    const catwalkHeaders: Record<string, string> = { Accept: 'application/json' };
    const token = process.env.CATWALK_API_TOKEN;
    if (token) {
      catwalkHeaders.Authorization = `Bearer ${token}`;
    }

    const catwalkResponse = await fetch(
        `${CATWALK_BASE_URL}/pathway/single/${encodeURIComponent(profile.nickname)}`,
        { headers: catwalkHeaders },
    );

    const contentType = catwalkResponse.headers.get('content-type') || 'application/json';
    const text = await catwalkResponse.text();

    res.status(catwalkResponse.status);
    res.setHeader('Content-Type', contentType);
    return res.send(text);
  } catch (error) {
    console.error('Error in beyonder-self:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(502).json({ success: false, message: 'Failed to reach upstream service', details: errorMessage });
  }
}
