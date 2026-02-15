import { NextRequest, NextResponse } from 'next/server';

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

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);

  // Only process crawler requests for news articles
  if (!isCrawler(userAgent) || !url.pathname.startsWith('/news/')) {
    return NextResponse.next();
  }

  try {
    const slug = url.pathname.replace('/news/', '').replace(/\/$/, '');

    if (!slug) {
      return NextResponse.next();
    }

    // Fetch article data
    const apiUrl = `https://api.mysterria.net/api/news/EN/${slug}`;
    const articleResponse = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (!articleResponse.ok) {
      return NextResponse.next();
    }

    const article = await articleResponse.json();

    // Fetch base HTML
    const baseUrl = url.origin;
    const htmlResponse = await fetch(`${baseUrl}/`);
    let html = await htmlResponse.text();

    // Prepare meta tags
    const imageUrl = article.preview?.startsWith('http')
      ? article.preview
      : `${baseUrl}${article.preview || '/banner.webp'}`;
    const articleUrl = `${baseUrl}/news/${article.slug}`;

    const metaTags = `
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

    // Remove old meta tags and inject new ones
    html = html.replace(/<meta\s+name="title"[^>]*>/gi, '');
    html = html.replace(/<meta\s+name="description"[^>]*>/gi, '');
    html = html.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '');
    html = html.replace(/<meta\s+property="twitter:[^"]*"[^>]*>/gi, '');
    html = html.replace(/<title>[^<]*<\/title>/i, '');

    const headCloseIndex = html.indexOf('</head>');
    if (headCloseIndex !== -1) {
      html = html.slice(0, headCloseIndex) + metaTags + '\n' + html.slice(headCloseIndex);
    }

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: '/news/:path*',
};
