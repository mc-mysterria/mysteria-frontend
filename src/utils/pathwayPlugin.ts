import type MarkdownIt from 'markdown-it';

export const PATHWAYS = [
  'abyss', 'chained', 'darkness', 'death', 'demoness', 'door',
  'emperor', 'error', 'fool', 'fortune', 'giant', 'hanged',
  'hermit', 'justiciar', 'moon', 'mother', 'paragon', 'priest',
  'sun', 'tower', 'tyrant', 'visionary',
  'eternalaeon', 'sublunary', 'patriarch',
] as const;

// Maps alternate emoji codes to canonical pathway names
const EMOJI_ALIASES: Record<string, string> = {
  'hanged_man': 'hanged',
  'white_tower': 'tower',
};

// Maps emoji codes to plain Unicode characters
const UNICODE_EMOJIS: Record<string, string> = {
  'heart': '❤️',
};

export function getPathwayImageUrl(name: string): string {
  return new URL(`../assets/images/pathways/${name}.webp`, import.meta.url).href;
}

export function pathwayEmojiPlugin(md: MarkdownIt): void {
  const pathwaySet = new Set<string>(PATHWAYS);

  md.core.ruler.push('pathway_emoji', (state) => {
    for (const blockToken of state.tokens) {
      if (blockToken.type !== 'inline' || !blockToken.children) continue;

      const newChildren: typeof blockToken.children = [];

      for (const token of blockToken.children) {
        if (token.type !== 'text') {
          newChildren.push(token);
          continue;
        }

        const parts = token.content.split(/(:[\w]+:)/g);

        if (parts.length === 1) {
          newChildren.push(token);
          continue;
        }

        for (const part of parts) {
          if (!part) continue;

          if (part.startsWith(':') && part.endsWith(':') && part.length > 2) {
            const name = part.slice(1, -1).toLowerCase();

            // Unicode emoji shortcodes
            if (UNICODE_EMOJIS[name] !== undefined) {
              const textToken = new state.Token('text', '', 0);
              textToken.content = UNICODE_EMOJIS[name];
              newChildren.push(textToken);
              continue;
            }

            // Resolve alias to canonical name
            const resolved = EMOJI_ALIASES[name] ?? name;

            if (pathwaySet.has(resolved)) {
              const imgToken = new state.Token('html_inline', '', 0);
              const url = getPathwayImageUrl(resolved);
              imgToken.content = `<img src="${url}" alt=":${resolved}:" class="pathway-emoji" title="${resolved}" />`;
              newChildren.push(imgToken);
              continue;
            }
          }

          const textToken = new state.Token('text', '', 0);
          textToken.content = part;
          newChildren.push(textToken);
        }
      }

      blockToken.children = newChildren;
    }
  });
}
