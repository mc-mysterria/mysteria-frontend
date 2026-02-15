import type { VercelRequest, VercelResponse } from '@vercel/node';

const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'Slackbot',
  'Discordbot',
  'WhatsApp',
  'TelegramBot',
  'SkypeUriPreview',
  'pinterest',
  'reddit',
];

function isCrawler(userAgent: string): boolean {
  const lowerUA = userAgent.toLowerCase();
  return CRAWLER_USER_AGENTS.some(bot => lowerUA.includes(bot.toLowerCase()));
}

function escapeHtml(text: string): string {
  if (!text) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userAgent = req.headers['user-agent'] || '';
  const { path } = req.query;

  // Only process crawler requests
  if (!isCrawler(userAgent) || typeof path !== 'string') {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    // Parse path to determine content type and slug
    const pathParts = path.split('/').filter(Boolean);

    if (pathParts.length < 2) {
      return res.status(400).json({ error: 'Invalid path' });
    }

    const [type, slug] = pathParts;
    let apiUrl = '';
    let metaTags = '';
    const baseUrl = 'https://mysterria.net';

    if (type === 'news') {
      // Fetch news article
      apiUrl = `https://api.mysterria.net/api/news/EN/${slug}`;

      const articleResponse = await fetch(apiUrl, {
        headers: { 'Accept': 'application/json' },
      });

      if (!articleResponse.ok) {
        throw new Error('Article not found');
      }

      const article = await articleResponse.json();
      const imageUrl = article.preview?.startsWith('http')
        ? article.preview
        : `${baseUrl}${article.preview || '/banner.webp'}`;
      const articleUrl = `${baseUrl}/news/${article.slug}`;

      metaTags = `
    <meta name="title" content="${escapeHtml(article.title)} - Mysterria" />
    <meta name="description" content="${escapeHtml(article.shortDescription || article.title)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${articleUrl}" />
    <meta property="og:title" content="${escapeHtml(article.title)} - Mysterria" />
    <meta property="og:description" content="${escapeHtml(article.shortDescription || article.title)}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${articleUrl}" />
    <meta property="twitter:title" content="${escapeHtml(article.title)} - Mysterria" />
    <meta property="twitter:description" content="${escapeHtml(article.shortDescription || article.title)}" />
    <meta property="twitter:image" content="${imageUrl}" />
    <meta property="article:published_time" content="${article.publishedAt || article.createdAt}" />
    ${article.updatedAt ? `<meta property="article:modified_time" content="${article.updatedAt}" />` : ''}
    <title>${escapeHtml(article.title)} - Mysterria</title>`;
    } else {
      return res.status(400).json({ error: 'Unsupported content type' });
    }

    // Fetch base HTML
    const htmlResponse = await fetch(`${baseUrl}/`);
    let html = await htmlResponse.text();

    // Replace or inject meta tags
    const headCloseIndex = html.indexOf('</head>');
    if (headCloseIndex !== -1) {
      // Remove existing meta tags that we're replacing
      html = html.replace(/<meta\s+name="title"[^>]*>/gi, '');
      html = html.replace(/<meta\s+name="description"[^>]*>/gi, '');
      html = html.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '');
      html = html.replace(/<meta\s+property="twitter:[^"]*"[^>]*>/gi, '');
      html = html.replace(/<meta\s+property="article:[^"]*"[^>]*>/gi, '');
      html = html.replace(/<title>[^<]*<\/title>/i, '');

      // Inject new meta tags
      html = html.slice(0, headCloseIndex) + metaTags + html.slice(headCloseIndex);
    }

    return res
      .status(200)
      .setHeader('Content-Type', 'text/html; charset=utf-8')
      .setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
      .send(html);
  } catch (error) {
    console.error('Error in meta-proxy:', error);
    return res.status(500).json({ error: 'Failed to generate meta tags' });
  }
}
