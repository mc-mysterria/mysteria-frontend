import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pathwayData = require('../src/assets/sources/pathway-abilities.json') as {
  pathways: Array<{
    id: string;
    sequences: Array<{
      sequence: number;
      name: { en: string; uk: string };
      abilities: unknown[];
    }>;
  }>;
};

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

function stripMarkdown(markdown: string, maxLength: number = 200): string {
  const plainText = markdown
    .replace(/!\[[^\]]*]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)]\([^)]*\)/g, '$1') // links -> text
    .replace(/^#{1,6}\s+/gm, '') // headings
    .replace(/^[-*+]\s+/gm, '') // list bullets
    .replace(/^>\s+/gm, '') // blockquotes
    .replace(/[*_~`]/g, '') // remaining formatting characters
    .replace(/\r?\n+/g, ' ') // newlines
    .replace(/\s+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return `${plainText.slice(0, maxLength).trim()}...`;
}

interface PageMeta {
  title: string;
  description: string;
  image: string;
}

const PATHWAY_NAMES: Record<string, string> = {
  abyss: 'Abyss', chained: 'Chained', darkness: 'Darkness', death: 'Death', demoness: 'Demoness', door: 'Door',
  emperor: 'Black Emperor', error: 'Error', fool: 'Fool', fortune: 'Wheel of Fortune', giant: 'Twilight Giant',
  hanged: 'Hanged Man', hermit: 'Hermit', justiciar: 'Justiciar', moon: 'Moon', mother: 'Mother', paragon: 'Paragon',
  priest: 'Red Priest', sun: 'Sun', tower: 'White Tower', tyrant: 'Tyrant', visionary: 'Visionary', aeon: 'Eternal Aeon',
  chaos: 'Chaos', chaosmist: 'Chaos Mist', condenser: 'Condenser', devouring: 'Devouring', edict: 'Edict',
  everlasting: 'Everlasting', patriarch: 'Patriarch', secondlaw: 'Second Law', sublunary: 'Sublunary',
};
const PATHWAY_IMAGE_ALIASES: Record<string, string> = { aeon: 'eternalaeon' };

function generatePathwayHTML(pathwayId: string | undefined, baseUrl: string): string | null {
  const pathway = pathwayId ? pathwayData.pathways.find((item) => item.id === pathwayId) : undefined;
  if (pathwayId && !pathway) return null;

  const name = pathwayId ? (PATHWAY_NAMES[pathwayId] || pathwayId) : '';
  const abilityCount = pathway?.sequences.reduce((total, sequence) => total + sequence.abilities.length, 0) || 0;
  const firstSequence = pathway?.sequences[0]?.name.en;
  const finalSequence = pathway?.sequences[pathway.sequences.length - 1]?.name.en;
  const title = pathway
    ? `${name} Pathway – Sequences & Abilities | Mysterria`
    : 'Pathways & Sequences – Beyonder Archive | Mysterria';
  const description = pathway
    ? `Explore the ${name} Pathway from Sequence ${pathway.sequences[0]?.sequence} ${firstSequence} to Sequence ${pathway.sequences[pathway.sequences.length - 1]?.sequence} ${finalSequence}. Discover ${abilityCount} abilities available on Mysterria.`
    : `Explore all ${pathwayData.pathways.length} Beyonder Pathways, their Sequence names, and every ability available on Mysterria.`;
  const pageUrl = `${baseUrl}/pathways${pathwayId ? `/${pathwayId}` : ''}`;
  const imageName = pathwayId ? (PATHWAY_IMAGE_ALIASES[pathwayId] || pathwayId) : '';
  const hasImage = imageName && ['abyss','chained','darkness','death','demoness','door','emperor','error','eternalaeon','fool','fortune','giant','hanged','hermit','justiciar','moon','mother','paragon','patriarch','priest','sublunary','sun','tower','tyrant','visionary'].includes(imageName);
  const imageUrl = hasImage ? `${baseUrl}/pathways/${imageName}.webp` : `${baseUrl}/banner.webp`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title><meta name="title" content="${escapeHtml(title)}"><meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${pageUrl}"><meta property="og:type" content="website"><meta property="og:site_name" content="Mysterria"><meta property="og:url" content="${pageUrl}"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:image" content="${imageUrl}"><meta property="og:image:alt" content="${escapeHtml(pathway ? `${name} Pathway symbol` : 'Mysterria Beyonder Pathways')}">
    <meta name="twitter:card" content="summary_large_image"><meta name="twitter:url" content="${pageUrl}"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${imageUrl}">
    <meta http-equiv="refresh" content="0;url=${pageUrl}"><script>window.location.href=${JSON.stringify(pageUrl)}</script></head><body><a href="${pageUrl}">${escapeHtml(title)}</a></body></html>`;
}

const STATIC_PAGES: Record<string, PageMeta> = {
  rules: {
    title: 'Server Rules - Mysterria',
    description: 'Read the rules and guidelines for playing on Mysterria, the Lord of the Mysteries inspired Minecraft server. Learn about our community standards and gameplay policies.',
    image: '/banner.webp',
  },
  store: {
    title: 'Store - Mysterria',
    description: 'Support Mysterria and unlock exclusive perks! Browse our store for ranks, items, and special features for the Lord of the Mysteries Minecraft server.',
    image: '/banner.webp',
  },
  guide: {
    title: 'Getting Started Guide - Mysterria',
    description: 'New to Mysterria? Learn how to get started on our Lord of the Mysteries inspired server. Discover Pathways, Sequences, and mystical adventures.',
    image: '/klein.webp',
  },
  profile: {
    title: 'Your Profile - Mysterria',
    description: 'View and manage your Mysterria profile. Track your progress through Sequences and Pathways on our Lord of the Mysteries Minecraft server.',
    image: '/klein.webp',
  },
};

function generateStaticPageHTML(pageName: string, baseUrl: string): string {
  const meta = STATIC_PAGES[pageName] || {
    title: 'Mysterria - Lord of The Mysteries Minecraft Server',
    description: 'Mysterria – A unique Minecraft server inspired by the Lord of the Mysteries web novel. Explore mystical Pathways, brew Potions, advance through Sequences, and immerse yourself in a world of gods and churches.',
    image: '/banner.webp',
  };

  const pageUrl = `${baseUrl}/${pageName}`;
  const imageUrl = meta.image.startsWith('http') ? meta.image : `${baseUrl}${meta.image}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Primary Meta Tags -->
    <title>${escapeHtml(meta.title)}</title>
    <meta name="title" content="${escapeHtml(meta.title)}" />
    <meta name="description" content="${escapeHtml(meta.description)}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:image" content="${imageUrl}" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${pageUrl}" />
    <meta property="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta property="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta property="twitter:image" content="${imageUrl}" />

    <!-- Redirect to actual page for real users -->
    <meta http-equiv="refresh" content="0;url=${pageUrl}" />
    <script>window.location.href = '${pageUrl}';</script>
</head>
<body>
    <p>Redirecting to <a href="${pageUrl}">${escapeHtml(meta.title)}</a>...</p>
</body>
</html>`;
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
    const baseUrl = 'https://mysterria.net';

    if (path === 'pathways' || path.startsWith('pathways/')) {
      const pathwayId = path.split('/')[1];
      const html = generatePathwayHTML(pathwayId, baseUrl);
      if (!html) return res.status(404).send('Pathway not found');
      return res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600').send(html);
    }

    // Handle static pages (single path segment like "rules", "store", etc.)
    if (!path.includes('/')) {
      console.log('Generating meta tags for static page:', path);
      const html = generateStaticPageHTML(path, baseUrl);
      return res
        .status(200)
        .setHeader('Content-Type', 'text/html; charset=utf-8')
        .setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
        .send(html);
    }

    // Parse path to determine content type and slug
    const pathParts = path.split('/').filter(Boolean);

    if (pathParts.length < 2) {
      console.error('Invalid path format:', path);
      return res.status(400).json({ error: 'Invalid path', details: 'Expected format: type/slug or pagename' });
    }

    const SUPPORTED_LOCALES = new Set(['en', 'uk']);
    const [type, second, third] = pathParts;
    const locale = third && SUPPORTED_LOCALES.has(second) ? second : 'en';
    const slug = third && SUPPORTED_LOCALES.has(second) ? third : second;
    console.log('Type:', type, 'Locale:', locale, 'Slug:', slug);

    if (type === 'news') {
      const apiUrl = `${baseUrl}/api/news/${locale}/article/${slug}`;
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
      const articleUrl = locale !== 'en'
        ? `${baseUrl}/news/${locale}/${article.slug}`
        : `${baseUrl}/news/${article.slug}`;
      const title = `${escapeHtml(article.title)} - Mysterria`;
      const description = escapeHtml(article.shortDescription || article.title);
      const htmlLang = locale === 'uk' ? 'uk' : 'en';

      // Generate complete HTML with meta tags and redirect
      const html = `<!DOCTYPE html>
<html lang="${htmlLang}">
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
    } else if (type === 'services') {
      const apiUrl = `${baseUrl}/api/shop/services/${slug}/content?lang=${locale}`;
      console.log('Fetching service from:', apiUrl);

      const serviceResponse = await fetch(apiUrl, {
        headers: { 'Accept': 'application/json' },
      });

      if (!serviceResponse.ok) {
        console.error('Service fetch failed:', serviceResponse.status, serviceResponse.statusText);
        throw new Error(`Service not found: ${serviceResponse.status}`);
      }

      const service = await serviceResponse.json();
      console.log('Service fetched:', service.name);
      const imageUrl = service.imageUrl?.startsWith('http')
        ? service.imageUrl
        : `${baseUrl}${service.imageUrl || '/banner.webp'}`;
      const serviceUrl = `${baseUrl}/services/${slug}`;
      const title = `${escapeHtml(service.name)} - Mysterria`;
      const rawDescription = service.markdownContent || service.markdownContentEn || service.markdownContentUk || service.name;
      const description = escapeHtml(stripMarkdown(rawDescription));
      const htmlLang = locale === 'uk' ? 'uk' : 'en';

      const html = `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Primary Meta Tags -->
    <title>${title}</title>
    <meta name="title" content="${title}" />
    <meta name="description" content="${description}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="product" />
    <meta property="og:url" content="${serviceUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${serviceUrl}" />
    <meta property="twitter:title" content="${title}" />
    <meta property="twitter:description" content="${description}" />
    <meta property="twitter:image" content="${imageUrl}" />

    <!-- Redirect to actual page for real users -->
    <meta http-equiv="refresh" content="0;url=${serviceUrl}" />
    <script>window.location.href = '${serviceUrl}';</script>
</head>
<body>
    <p>Redirecting to <a href="${serviceUrl}">${escapeHtml(service.name)}</a>...</p>
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
