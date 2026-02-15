# Dynamic Social Media Meta Tags

This document explains how dynamic meta tags work for social media sharing (Discord, Twitter, Facebook, etc.).

## Overview

The project now supports **dynamic meta tags** that change based on the URL being shared. This ensures that when you share a link to a news article, the preview shows the article's specific image and description instead of the generic site metadata.

## How It Works

### 1. Client-Side Meta Tags (for users & SEO)

We use `@unhead/vue` to dynamically update meta tags as users navigate the site. This provides:
- Better SEO for search engines that execute JavaScript
- Improved user experience with accurate page titles
- Dynamic meta tags for all routes

**Location:** `src/composables/useMeta.ts`

### 2. Server-Side Meta Tags (for social media crawlers)

Social media bots (Discord, Twitter, Facebook, etc.) **don't execute JavaScript**, so they only see the static HTML. To solve this, we use **Vercel Edge Middleware** to:

1. Detect when a crawler visits a news article URL (e.g., `/news/merry-christmas-2025`)
2. Fetch the article data from the API
3. Inject the correct meta tags into the HTML before sending it to the crawler

**Location:** `middleware.ts`

## Supported Crawlers

The middleware detects the following social media crawlers:
- Discord (`Discordbot`)
- Twitter (`Twitterbot`)
- Facebook (`facebookexternalhit`, `Facebot`)
- LinkedIn (`LinkedInBot`)
- Slack (`Slackbot`)
- WhatsApp
- Telegram (`TelegramBot`)
- Skype (`SkypeUriPreview`)
- Pinterest
- Reddit

## Usage

### For News Articles

News articles automatically get dynamic meta tags when the component loads:

```typescript
// In NewsView.vue
watch(article, (newArticle) => {
  if (newArticle) {
    useMeta({
      title: `${newArticle.title} - Mysterria`,
      description: newArticle.shortDescription || newArticle.title,
      image: newArticle.preview,
      url: `https://mysterria.net/news/${newArticle.slug}`,
      type: 'article',
    });
  }
});
```

### For Other Pages

You can use the `useMeta` composable in any component:

```typescript
import { useMeta } from '@/composables/useMeta';

// In your component's setup function
useMeta({
  title: 'Custom Page Title',
  description: 'Custom description for social media',
  image: '/path/to/image.webp',
  url: 'https://mysterria.net/your-page',
  type: 'website', // or 'article'
});
```

## Testing

### Test Client-Side Meta Tags
1. Navigate to a news article in your browser
2. Open DevTools → Elements tab
3. Look for `<meta>` tags in the `<head>` section
4. They should update when you navigate to different articles

### Test Server-Side Meta Tags (Crawler Detection)
1. Deploy to Vercel
2. Use a meta tag debugger:
   - **Discord:** Paste URL in any Discord channel
   - **Facebook:** https://developers.facebook.com/tools/debug/
   - **Twitter:** https://cards-dev.twitter.com/validator
   - **LinkedIn:** https://www.linkedin.com/post-inspector/

Alternatively, test locally with curl:
```bash
curl -A "Discordbot" https://mysterria.net/news/merry-christmas-2025
```

Look for the custom meta tags in the response HTML.

## Architecture

```
User/Crawler Request → Vercel Edge
                          ↓
                    Is Crawler?
                    ↙         ↘
                 Yes           No
                  ↓             ↓
           middleware.ts    Regular SPA
                  ↓             ↓
           Fetch Article   Vue Router
                  ↓             ↓
         Inject Meta Tags  useMeta()
                  ↓             ↓
          Return HTML    Update DOM
```

## Requirements

- **Client-side:** `@unhead/vue` (installed)
- **Server-side:** Vercel Edge Runtime (automatically available on Vercel)
- **API:** News API endpoint at `https://api.mysterria.net/api/news/EN/{slug}`

## Extending to Other Content Types

To add dynamic meta tags for other content (e.g., services, counsel):

1. **Update the middleware** to handle additional routes:
```typescript
// In middleware.ts
if (url.pathname.startsWith('/services/')) {
  const slug = url.pathname.replace('/services/', '').replace(/\/$/, '');
  const apiUrl = `https://api.mysterria.net/api/services/${slug}`;
  // ... fetch and inject meta tags
}
```

2. **Update the component** to use `useMeta()`:
```typescript
// In ServiceView.vue
watch(service, (newService) => {
  if (newService) {
    useMeta({
      title: `${newService.title} - Mysterria`,
      description: newService.description,
      image: newService.image,
      url: `https://mysterria.net/services/${newService.slug}`,
    });
  }
});
```

## Troubleshooting

### Meta tags not updating for crawlers
- Ensure you're deployed to Vercel (middleware only works in production)
- Check Vercel Function Logs for errors
- Verify the API endpoint is accessible and returns correct data

### Meta tags not updating in browser
- Check browser console for errors
- Ensure `@unhead/vue` is properly initialized in `main.ts`
- Verify the component is calling `useMeta()` correctly

### Images not showing in previews
- Ensure image URLs are **absolute** (not relative)
- Images should be publicly accessible (not behind authentication)
- Check image file size (some platforms have limits)
- Verify CORS headers allow the image to be embedded

## Performance

- **Middleware runs only for crawlers** - regular users get the fast SPA experience
- **Caching:** Responses are cached for 1 hour (`max-age=3600`)
- **Edge Runtime:** Runs at the edge for minimal latency

## Future Enhancements

- [ ] Add support for other content types (services, counsel)
- [ ] Implement language detection for multi-language meta tags
- [ ] Add structured data (JSON-LD) for rich snippets
- [ ] Create automated tests for meta tag injection
