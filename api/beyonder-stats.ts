import type {VercelRequest, VercelResponse} from '@vercel/node';
import {loadBeyonderStats} from '../server/beyonderAggregate';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const result = await loadBeyonderStats(process.env.CATWALK_API_TOKEN);
        if (result.body.success) {
            res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
        }
        return res.status(result.status).json(result.body);
    } catch (error) {
        console.error('Error in beyonder-stats:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(502).json({
            success: false,
            message: 'Failed to reach catwalk service',
            details: errorMessage
        });
    }
}
