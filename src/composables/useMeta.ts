import { useHead } from '@unhead/vue';

export interface MetaOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

export function useMeta(options: MetaOptions = {}) {
  const baseUrl = 'https://mysterria.net';
  const defaultTitle = 'Mysterria - Lord of The Mysteries Minecraft Server';
  const defaultDescription = 'Mysterria — A unique Minecraft server inspired by the Lord of the Mysteries web novel. Explore mystical Pathways, brew Potions, advance through Sequences, and immerse yourself in a world of gods and churches. English and Ukrainian support.';
  const defaultImage = `${baseUrl}/banner.webp`;

  const title = options.title || defaultTitle;
  const description = options.description || defaultDescription;
  const image = options.image || defaultImage;
  const url = options.url || baseUrl;
  const type = options.type || 'website';

  // Ensure image URL is absolute
  const absoluteImage = image.startsWith('http') ? image : `${baseUrl}${image}`;

  useHead({
    title,
    meta: [
      // Primary Meta Tags
      { name: 'title', content: title },
      { name: 'description', content: description },

      // Open Graph / Facebook
      { property: 'og:type', content: type },
      { property: 'og:url', content: url },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: absoluteImage },

      // Twitter
      { property: 'twitter:card', content: 'summary_large_image' },
      { property: 'twitter:url', content: url },
      { property: 'twitter:title', content: title },
      { property: 'twitter:description', content: description },
      { property: 'twitter:image', content: absoluteImage },
    ],
  });

  return {
    title,
    description,
    image: absoluteImage,
    url,
    type,
  };
}
