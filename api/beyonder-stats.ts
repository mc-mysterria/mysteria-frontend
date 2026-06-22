import type { VercelRequest, VercelResponse } from '@vercel/node';

const CATWALK_BASE_URL = 'https://catwalk.mysterria.net';

interface UpstreamBeyonderData {
  playerName: string;
  beyonder: boolean;
  pathway: string;
  sequence: string;
  acting: number;
}

interface UpstreamBeyonderResponse {
  success: boolean;
  message: string;
  data: {
    amount: number;
    beyonder: UpstreamBeyonderData[];
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = process.env.CATWALK_API_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const upstreamResponse = await fetch(`${CATWALK_BASE_URL}/pathway/everyone`, { headers });

    if (!upstreamResponse.ok) {
      return res.status(upstreamResponse.status).json({ success: false, message: 'Failed to fetch beyonder data' });
    }

    const result: UpstreamBeyonderResponse = await upstreamResponse.json();
    const beyonders = result.data?.beyonder ?? [];

    const pathwayCounts = new Map<string, number>();
    const sequenceCounts = new Map<string, number>();
    let sequenceSum = 0;
    let advancedBeyonders = 0;

    for (const b of beyonders) {
      pathwayCounts.set(b.pathway, (pathwayCounts.get(b.pathway) || 0) + 1);

      const seq = parseInt(b.sequence, 10);
      if (Number.isNaN(seq)) continue;

      sequenceSum += seq;
      if (seq >= 0 && seq <= 3) advancedBeyonders++;
      if (seq >= 1 && seq <= 9) {
        const key = seq.toString();
        sequenceCounts.set(key, (sequenceCounts.get(key) || 0) + 1);
      }
    }

    const topPathways = Array.from(pathwayCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    const sequenceDistribution = Array.from(sequenceCounts.entries())
        .map(([sequence, count]) => ({ sequence, count }))
        .sort((a, b) => parseInt(a.sequence, 10) - parseInt(b.sequence, 10));

    const averageSequence = beyonders.length > 0 ? (sequenceSum / beyonders.length).toFixed(1) : '0';

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      success: true,
      data: {
        totalBeyonders: beyonders.length,
        uniquePathways: pathwayCounts.size,
        advancedBeyonders,
        averageSequence,
        topPathways,
        sequenceDistribution,
      },
    });
  } catch (error) {
    console.error('Error in beyonder-stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(502).json({ success: false, message: 'Failed to reach catwalk service', details: errorMessage });
  }
}
