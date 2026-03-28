import type MarkdownIt from 'markdown-it';

export const PATHWAYS = [
  'abyss', 'chained', 'darkness', 'death', 'demoness', 'door',
  'emperor', 'error', 'fool', 'fortune', 'giant', 'hanged',
  'hermit', 'justiciar', 'moon', 'mother', 'paragon', 'priest',
  'sun', 'tower', 'tyrant', 'visionary',
] as const;

export type PathwayName = typeof PATHWAYS[number];

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
            if (pathwaySet.has(name)) {
              const imgToken = new state.Token('html_inline', '', 0);
              const url = getPathwayImageUrl(name);
              imgToken.content = `<img src="${url}" alt=":${name}:" class="pathway-emoji" title="${name}" />`;
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
