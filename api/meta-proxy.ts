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
  const { path } = req.query;

  // Validate path parameter
  if (typeof path !== 'string') {
    console.error('Invalid path parameter:', path);
    return res.status(400).json({ error: 'Invalid request', details: 'Path parameter missing or invalid' });
  }

  try {
    console.log('Processing meta-proxy request for path:', path);

    // Parse path to determine content type and slug
    const pathParts = path.split('/').filter(Boolean);

    if (pathParts.length < 2) {
      console.error('Invalid path format:', path);
      return res.status(400).json({ error: 'Invalid path', details: 'Expected format: type/slug' });
    }

    const [type, slug] = pathParts;
    console.log('Type:', type, 'Slug:', slug);
    const baseUrl = 'https://mysterria.net';

    if (type === 'news') {
      // Use the Vercel proxy (same as frontend) instead of calling API directly
      // This avoids CORS/403 issues since the API might only accept requests from mysterria.net
      const apiUrl = `${baseUrl}/api/news/en/article/${slug}`;
      console.log('Fetching article from:', apiUrl);

      const articleResponse = await fetch(apiUrl, {
        headers: { 'Accept': 'application/json' },
      });

      if (!articleResponse.ok) {
        console.error('Article fetch failed:', articleResponse.status, articleResponse.statusText);
        throw new Error(`Article not found: ${articleResponse.status}`);
      }

      const article = await articleResponse.json();
      console.log('Article fetched:', article.title);
      const imageUrl = article.preview?.startsWith('http')
        ? article.preview
        : `${baseUrl}${article.preview || '/banner.webp'}`;
      const articleUrl = `${baseUrl}/news/${article.slug}`;
      const title = `${escapeHtml(article.title)} - Mysterria`;
      const description = escapeHtml(article.shortDescription || article.title);

      // Generate complete HTML with meta tags and redirect
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Primary Meta Tags -->
    <title>${title}</title>
    <meta name="title" content="${title}" />
    <meta name="description" content="${description}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${articleUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${articleUrl}" />
    <meta property="twitter:title" content="${title}" />
    <meta property="twitter:description" content="${description}" />
    <meta property="twitter:image" content="${imageUrl}" />

    <!-- Article Metadata -->
    <meta property="article:published_time" content="${article.publishedAt || article.createdAt}" />
    ${article.updatedAt ? `<meta property="article:modified_time" content="${article.updatedAt}" />` : ''}

    <!-- Redirect to actual page for real users -->
    <meta http-equiv="refresh" content="0;url=${articleUrl}" />
    <script>window.location.href = '${articleUrl}';</script>
</head>
<body>
    <p>Redirecting to <a href="${articleUrl}">${escapeHtml(article.title)}</a>...</p>
</body>
</html>`;

      console.log('Successfully generated HTML with meta tags');
      return res
        .status(200)
        .setHeader('Content-Type', 'text/html; charset=utf-8')
        .setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
        .send(html);
    } else {
      return res.status(400).json({ error: 'Unsupported content type' });
    }
  } catch (error) {
    console.error('Error in meta-proxy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Failed to generate meta tags',
      details: errorMessage,
      path: req.query.path
    });
  }
}
