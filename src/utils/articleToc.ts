import type MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';

export interface TocEntry {
    id: string;
    text: string;
    level: 2 | 3;
}

/**
 * Turn a heading's text into a URL-safe fragment id.
 *
 * Unicode letters and digits are kept rather than stripped, so a Ukrainian heading
 * produces a readable Ukrainian anchor instead of a string of dashes.
 */
const slugify = (text: string): string =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '') || 'section';

/** Plain text of an inline token, ignoring emphasis, links and emoji spans. */
const plainText = (inline: Token | undefined): string => {
    if (!inline) return '';
    if (!inline.children?.length) return inline.content ?? '';
    return inline.children
        .filter(child => child.type === 'text' || child.type === 'code_inline')
        .map(child => child.content)
        .join('')
        .trim();
};

/**
 * Teach a MarkdownIt instance to stamp an id on every h2/h3 and collect them.
 *
 * Headings are given ids during rendering rather than by re-parsing the HTML
 * afterwards: the token stream already knows the heading text, and nothing here
 * then depends on a DOM being available.
 *
 * Call `md.render(markdown, env)` with an env object; the entries land on
 * `env.toc`. Ids are made unique within a single render, so two sections called
 * "The seven" do not fight over the same anchor.
 */
export const tocPlugin = (md: MarkdownIt): void => {
    const defaultRender = md.renderer.rules.heading_open
        ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

    md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
        const token = tokens[idx];

        if (token.tag === 'h2' || token.tag === 'h3') {
            const entries: TocEntry[] = (env.toc ??= []);
            const used: Record<string, number> = (env.tocSlugs ??= {});

            const text = plainText(tokens[idx + 1]);
            const base = slugify(text);
            const seen = used[base] ?? 0;
            used[base] = seen + 1;
            const id = seen === 0 ? base : `${base}-${seen + 1}`;

            token.attrSet('id', id);
            entries.push({id, text, level: token.tag === 'h2' ? 2 : 3});
        }

        return defaultRender(tokens, idx, options, env, self);
    };
};
