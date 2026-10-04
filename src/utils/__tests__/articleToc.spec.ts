import {describe, expect, it} from 'vitest';
import MarkdownIt from 'markdown-it';
import {tocPlugin, type TocEntry} from '@/utils/articleToc';

const render = (markdown: string) => {
    const md = new MarkdownIt({html: true, linkify: true, typographer: true});
    md.use(tocPlugin);
    const env: { toc?: TocEntry[] } = {};
    const html = md.render(markdown, env);
    return {html, toc: env.toc ?? []};
};

describe('tocPlugin', () => {
    it('collects h2 and h3 headings and stamps matching ids', () => {
        const {html, toc} = render('# Title\n\n## Daily Tides\n\ntext\n\n### The seven\n\ntext\n');

        expect(toc).toEqual([
            {id: 'daily-tides', text: 'Daily Tides', level: 2},
            {id: 'the-seven', text: 'The seven', level: 3},
        ]);
        expect(html).toContain('<h2 id="daily-tides">');
        expect(html).toContain('<h3 id="the-seven">');
    });

    it('ignores h1 and h4, so the rail only ever nests two levels', () => {
        const {toc} = render('# One\n\n#### Four\n\n## Two\n');

        expect(toc.map(entry => entry.text)).toEqual(['Two']);
    });

    it('strips markup from the label but keeps it in the heading', () => {
        const {html, toc} = render('## The **rite** itself\n');

        expect(toc[0].text).toBe('The rite itself');
        expect(html).toContain('<strong>rite</strong>');
    });

    it('keeps non-latin headings readable rather than collapsing them to dashes', () => {
        const {toc} = render('## Приплив Старанності\n');

        expect(toc[0].id).toBe('приплив-старанності');
    });

    it('disambiguates repeated headings so two sections never share an anchor', () => {
        const {toc} = render('## What you get\n\n## What you get\n\n## What you get\n');

        expect(toc.map(entry => entry.id)).toEqual([
            'what-you-get',
            'what-you-get-2',
            'what-you-get-3',
        ]);
    });

    it('starts a fresh numbering for each render, so reopening an article is stable', () => {
        const first = render('## Contents\n');
        const second = render('## Contents\n');

        expect(first.toc[0].id).toBe('contents');
        expect(second.toc[0].id).toBe('contents');
    });
});
