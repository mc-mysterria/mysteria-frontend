import {onScopeDispose, watchEffect} from "vue";
import {useI18n} from "@/composables/useI18n";

export const SITE_URL = "https://mysterria.net";
export const SITE_NAME = "Mysterria";
export const DEFAULT_IMAGE = `${SITE_URL}/banner.webp`;

/** Titles read best as "Page - Mysterria"; the home page owns the bare brand. */
const TITLE_SUFFIX = ` | ${SITE_NAME}`;
const MAX_DESCRIPTION = 160;

export interface SeoInput {
    /** Page title without the site suffix. Pass `null` to use the brand alone. */
    title: string | null;
    description: string;
    /** Canonical path, e.g. "/guide". Defaults to the current location. */
    path?: string;
    /** Absolute URL, or a site-relative path starting with "/". */
    image?: string;
    imageAlt?: string;
    type?: "website" | "article";
    /** Keeps a page out of the index without hiding it from users. */
    noindex?: boolean;
    /** ISO timestamps, article pages only. */
    publishedTime?: string;
    modifiedTime?: string;
    /**
     * Language-specific URLs for this page. Most of the site serves both
     * languages from one URL, so alternates are only correct where the route
     * actually carries a locale (news articles).
     */
    alternates?: Partial<Record<"en" | "uk", string>>;
    /** JSON-LD objects to publish alongside the page. */
    jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const absolute = (value: string) => (value.startsWith("http") ? value : `${SITE_URL}${value}`);

/** Search results truncate hard; do it ourselves so the cut lands on a word. */
const trimDescription = (text: string) => {
    const clean = text.replace(/\s+/g, " ").trim();
    if (clean.length <= MAX_DESCRIPTION) return clean;
    const cut = clean.slice(0, MAX_DESCRIPTION);
    return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
};

function upsertMeta(key: string, attribute: "name" | "property", content: string) {
    const selector = `meta[${attribute}="${key}"]`;
    let tag = document.head.querySelector<HTMLMetaElement>(selector);
    if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attribute, key);
        document.head.appendChild(tag);
    }
    tag.content = content;
}

function removeMeta(key: string, attribute: "name" | "property") {
    document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove();
}

function upsertLink(rel: string, href: string, hreflang?: string) {
    const selector = hreflang
        ? `link[rel="${rel}"][hreflang="${hreflang}"]`
        : `link[rel="${rel}"]:not([hreflang])`;
    let tag = document.head.querySelector<HTMLLinkElement>(selector);
    if (!tag) {
        tag = document.createElement("link");
        tag.rel = rel;
        if (hreflang) tag.hreflang = hreflang;
        document.head.appendChild(tag);
    }
    tag.href = href;
}

const MANAGED_JSON_LD = "data-seo-jsonld";
const MANAGED_ALTERNATE = "data-seo-alternate";

function clearManaged() {
    document.head.querySelectorAll(`[${MANAGED_JSON_LD}]`).forEach(node => node.remove());
    document.head.querySelectorAll(`link[${MANAGED_ALTERNATE}]`).forEach(node => node.remove());
}

/**
 * Applies per-route metadata to <head>.
 *
 * The app is a client-rendered SPA, so every route otherwise inherits the single
 * title and description baked into index.html - which is what search engines
 * index for the whole site. This re-applies the correct set on every navigation
 * and whenever the reader switches language.
 *
 * Pass a getter so the metadata tracks reactive sources (route params, loaded
 * articles, the active locale).
 */
export function useSeo(source: () => SeoInput) {
    const {currentLanguage} = useI18n();

    const stop = watchEffect(() => {
        const seo = source();
        const language = currentLanguage.value;

        const title = seo.title ? `${seo.title}${TITLE_SUFFIX}` : `${SITE_NAME} - Lord of the Mysteries Minecraft Server`;
        const description = trimDescription(seo.description);
        const canonical = absolute(seo.path ?? window.location.pathname);
        const image = absolute(seo.image ?? DEFAULT_IMAGE);
        const type = seo.type ?? "website";

        document.title = title;
        document.documentElement.lang = language;

        upsertMeta("title", "name", title);
        upsertMeta("description", "name", description);
        upsertLink("canonical", canonical);

        upsertMeta("og:type", "property", type);
        upsertMeta("og:site_name", "property", SITE_NAME);
        upsertMeta("og:url", "property", canonical);
        upsertMeta("og:title", "property", title);
        upsertMeta("og:description", "property", description);
        upsertMeta("og:image", "property", image);
        upsertMeta("og:image:alt", "property", seo.imageAlt ?? SITE_NAME);
        upsertMeta("og:locale", "property", language === "uk" ? "uk_UA" : "en_US");

        upsertMeta("twitter:card", "name", "summary_large_image");
        upsertMeta("twitter:url", "name", canonical);
        upsertMeta("twitter:title", "name", title);
        upsertMeta("twitter:description", "name", description);
        upsertMeta("twitter:image", "name", image);

        if (type === "article" && seo.publishedTime) {
            upsertMeta("article:published_time", "property", seo.publishedTime);
        } else {
            removeMeta("article:published_time", "property");
        }
        if (type === "article" && seo.modifiedTime) {
            upsertMeta("article:modified_time", "property", seo.modifiedTime);
        } else {
            removeMeta("article:modified_time", "property");
        }

        // robots: only emitted when a page opts out, so the default stays index,follow
        if (seo.noindex) upsertMeta("robots", "name", "noindex, follow");
        else removeMeta("robots", "name");

        clearManaged();

        // hreflang is only truthful where the URL itself differs by language
        if (seo.alternates) {
            for (const [code, href] of Object.entries(seo.alternates)) {
                if (!href) continue;
                const tag = document.createElement("link");
                tag.rel = "alternate";
                tag.hreflang = code;
                tag.href = absolute(href);
                tag.setAttribute(MANAGED_ALTERNATE, "");
                document.head.appendChild(tag);
            }
            const fallback = seo.alternates.en;
            if (fallback) {
                const tag = document.createElement("link");
                tag.rel = "alternate";
                tag.hreflang = "x-default";
                tag.href = absolute(fallback);
                tag.setAttribute(MANAGED_ALTERNATE, "");
                document.head.appendChild(tag);
            }
        }

        const blocks = seo.jsonLd ? (Array.isArray(seo.jsonLd) ? seo.jsonLd : [seo.jsonLd]) : [];
        for (const block of blocks) {
            const script = document.createElement("script");
            script.type = "application/ld+json";
            script.setAttribute(MANAGED_JSON_LD, "");
            script.textContent = JSON.stringify(block);
            document.head.appendChild(script);
        }
    });

    onScopeDispose(() => {
        stop();
        clearManaged();
        removeMeta("robots", "name");
    });
}

/* ------------------------------------------------------------------ *
 * Structured-data builders
 * ------------------------------------------------------------------ */

export const organizationLd = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.webp`,
    description:
        "Mysterria is a Lord of the Mysteries inspired Minecraft server with a custom Beyonder system: 22 Pathways, potions, rituals and a Sequence 9 to 0 climb.",
    sameAs: [
        "https://discord.com/invite/jc7GSxBWgb",
        "https://wiki.mysterria.net/",
        "https://map.mysterria.net/",
        "https://github.com/ikeepcalm/coi-client",
        "https://modrinth.com/mod/coi-client",
        "https://www.curseforge.com/minecraft/mc-mods/coi-client",
    ],
});

export const websiteLd = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: ["en", "uk"],
    publisher: {"@id": `${SITE_URL}/#organization`},
});

/** The server itself - the entity most competitor searches are really after. */
export const videoGameLd = (playerCount?: number) => ({
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "@id": `${SITE_URL}/#game`,
    name: "Mysterria",
    alternateName: "Mysterria Minecraft Server",
    url: SITE_URL,
    image: DEFAULT_IMAGE,
    description:
        "A Lord of the Mysteries inspired Minecraft roleplay server. Brew Sequence 9 potions, act your role, and climb 22 Beyonder Pathways from Sequence 9 to 0.",
    gamePlatform: ["PC", "Minecraft: Java Edition", "Minecraft: Bedrock Edition"],
    applicationCategory: "Game",
    genre: ["Roleplaying", "MMORPG", "Survival"],
    inLanguage: ["en", "uk"],
    isAccessibleForFree: true,
    publisher: {"@id": `${SITE_URL}/#organization`},
    ...(playerCount ? {audience: {"@type": "Audience", audienceType: `${playerCount} Beyonders`}} : {}),
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: SITE_URL,
    },
});

export const breadcrumbLd = (trail: Array<{ name: string; path: string }>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: absolute(crumb.path),
    })),
});

export const faqLd = (entries: Array<{ question: string; answer: string }>) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map(entry => ({
        "@type": "Question",
        name: entry.question,
        acceptedAnswer: {"@type": "Answer", text: entry.answer},
    })),
});

export const articleLd = (article: {
    title: string;
    description: string;
    url: string;
    image?: string;
    published?: string;
    modified?: string;
    language: string;
}) => ({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    image: [absolute(article.image || DEFAULT_IMAGE)],
    mainEntityOfPage: {"@type": "WebPage", "@id": absolute(article.url)},
    inLanguage: article.language,
    ...(article.published ? {datePublished: article.published} : {}),
    ...(article.modified ? {dateModified: article.modified} : {}),
    author: {"@id": `${SITE_URL}/#organization`},
    publisher: {"@id": `${SITE_URL}/#organization`},
});

export const itemListLd = (name: string, items: Array<{ name: string; path: string }>) => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: absolute(item.path),
    })),
});
