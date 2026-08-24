import {createRouter, createWebHistory, type RouteRecordRaw} from "vue-router";
import {useAuthStore} from "@/stores/auth";
import {nextTick} from "vue";
import {isLanguage, LANGUAGES, resolveLanguage} from "@/locales";
import {localePath} from "@/composables/useLocalePath";
import {applyLanguage} from "@/composables/useI18n";
import {
    PERM_ADMIN,
    PERM_BALANCE_MANAGE,
    PERM_COMMISSIONS_MANAGE,
    PERM_NEWS_MANAGE,
    PERM_SHOP_MANAGE,
    PERM_USERS_VIEW,
} from "@/constants/permissions";

/*
 * Every page lives under an explicit locale segment - /en/guide, /zh-TW/guide.
 * The URL is the source of truth for language: the guard below reads the
 * segment and tells the i18n layer, so a shared link always opens in the
 * language it was shared in, and each locale is a distinct URL that search
 * engines can index separately.
 *
 * The param is named `lang` rather than `locale` because the news article
 * routes already use `:locale` for the language an article was written in.
 */
const LOCALE_MATCHER = LANGUAGES.join("|");

/**
 * Paths deliberately left outside the locale prefix.
 *
 * /auth/callback is registered with Discord as the OAuth redirect URI and is
 * matched literally in stores/auth.ts. Moving it under a locale would break
 * sign-in, and it renders no reader-facing copy anyway.
 */
const unlocalizedRoutes: RouteRecordRaw[] = [
    {
        path: "/auth/callback",
        name: "auth-callback",
        component: () => import("@/views/AuthCallbackView.vue"),
    },
];

/* Child paths are relative - the locale segment is supplied by the parent. */
const localizedRoutes: RouteRecordRaw[] = [
    {
        path: "",
        name: "home",
        component: () => import("@/views/HomeView.vue"),
    },
    {
        path: "store",
        name: "shop",
        component: () => import("@/views/ShopView.vue"),
    },
    {
        path: "rules",
        name: "rules",
        component: () => import("@/views/RulesView.vue"),
    },
    {
        path: "staff",
        name: "staff",
        component: () => import("@/views/StaffView.vue"),
    },
    {
        path: "terms",
        name: "terms",
        component: () => import("@/views/TermsView.vue"),
    },
    {
        path: "privacy",
        name: "privacy",
        component: () => import("@/views/PrivacyView.vue"),
    },
    {
        path: "sla",
        name: "sla",
        component: () => import("@/views/SLAView.vue"),
    },
    {
        path: "guide/:topic?",
        name: "guide",
        component: () => import("@/views/GuideView.vue"),
    },
    {
        path: "pathways/:pathway?",
        name: "pathways",
        component: () => import("@/views/PathwaysView.vue"),
    },
    {
        path: "ascension",
        name: "ascension",
        component: () => import("@/views/AscensionView.vue"),
    },
    {
        path: "wiki",
        redirect: () => {
            window.open("https://wiki.mysterria.net/", "_blank");
            return "/";
        },
    },
    {
        path: "game",
        name: "game",
        component: () => import("@/views/GuideView.vue"),
    },
    {
        path: "logout",
        name: "logout",
        component: () => import("@/views/LogoutView.vue"),
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: "profile",
        name: "profile",
        component: () => import("@/views/ProfileView.vue"),
        meta: {
            requiresAuth: true,
        },
    },
    {
        path: "login",
        name: "login",
        component: () => import("@/views/LoginView.vue"),
    },
    {
        path: "news",
        name: "news",
        component: () => import("@/views/NewsView.vue"),
    },
    {
        path: "news/:slug",
        name: "news-article",
        component: () => import("@/views/NewsView.vue"),
    },
    {
        path: "news/:locale/:slug",
        name: "news-article-localized",
        component: () => import("@/views/NewsView.vue"),
    },
    {
        path: "services/:slug",
        name: "service-detail",
        component: () => import("@/views/ServiceView.vue"),
    },
    {
        path: "edit",
        name: "edit",
        component: () => import("@/views/EditView.vue"),
        meta: {requiresAuth: true},
        children: [
            {
                path: "news",
                name: "edit-news",
                component: () => import("@/views/NewsEditView.vue"),
                meta: {requiresAuth: true, requiresPermission: PERM_NEWS_MANAGE},
            },
            {
                path: "services",
                name: "edit-services",
                component: () => import("@/views/ServiceEditView.vue"),
                meta: {requiresAuth: true, requiresPermission: PERM_SHOP_MANAGE},
            },
        ],
    },
    {
        path: "tools/balance",
        name: "balance-tool",
        component: () => import("@/views/BalanceDashboardView.vue"),
        meta: {requiresAuth: true, requiresAnyPermission: [PERM_ADMIN, PERM_BALANCE_MANAGE]},
    },
    {
        path: "admin/commissions",
        name: "admin-commissions-list",
        component: () => import("@/views/AdminCommissionsListView.vue"),
        meta: {requiresAuth: true, requiresAnyPermission: [PERM_ADMIN, PERM_COMMISSIONS_MANAGE]},
    },
    {
        path: "admin/commissions/:id",
        name: "admin-commissions-detail",
        component: () => import("@/views/AdminCommissionDetailView.vue"),
        meta: {requiresAuth: true, requiresAnyPermission: [PERM_ADMIN, PERM_COMMISSIONS_MANAGE]},
    },
    {
        path: "notifications",
        name: "notifications",
        component: () => import("@/views/NotificationsView.vue"),
        meta: {requiresAuth: true},
    },
    {
        path: "commissions",
        name: "commissions",
        component: () => import("@/views/CommissionsView.vue"),
        meta: {requiresAuth: true},
    },
    {
        path: "commissions/:id",
        name: "commission-detail",
        component: () => import("@/views/CommissionDetailView.vue"),
        meta: {requiresAuth: true},
    },
    {
        path: "admin",
        name: "admin",
        component: () => import("@components/admin/AdminPanel.vue"),
        meta: {requiresAuth: true, requiresAnyPermission: [PERM_ADMIN, PERM_USERS_VIEW]},
    },
    {
        path: ":pathMatch(.*)*",
        name: "404",
        component: () => import("@/views/PageNotFoundView.vue"),
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior(to, from, savedPosition) {
        // Return a promise to ensure scroll happens after component is mounted
        return new Promise((resolve) => {
            // If the user clicked back/forward, restore the saved scroll position
            if (savedPosition) {
                setTimeout(() => {
                    resolve(savedPosition);
                }, 100);
            }
            // For hash links (e.g., #section), scroll to the element
            else if (to.hash) {
                nextTick(() => {
                    resolve({
                        el: to.hash,
                        behavior: 'smooth',
                    });
                });
            }
            // For all other navigation, scroll to top immediately
            else {
                // Use requestAnimationFrame for better timing
                requestAnimationFrame(() => {
                    nextTick(() => {
                        resolve({top: 0, left: 0, behavior: 'instant'});
                    });
                });
            }
        });
    },
    routes: [
        ...unlocalizedRoutes,
        /*
         * No component: vue-router renders a component-less parent's children in
         * the parent's own outlet, so this record exists purely to own the locale
         * segment. Language is applied by the guard below, before anything mounts.
         */
        {
            path: `/:lang(${LOCALE_MATCHER})`,
            children: localizedRoutes,
        },
        /*
         * Anything without a recognised locale segment - the bare "/", and every
         * pre-locale URL that is already indexed or bookmarked - is sent to the
         * reader's own language, preserving the rest of the path, query and hash.
         * vercel.json issues a 308 for the same shapes so crawlers see a real
         * redirect rather than a client-side hop.
         */
        {
            path: "/:pathMatch(.*)*",
            redirect: to => ({path: localePath(to.path, resolveLanguage()), query: to.query, hash: to.hash}),
        },
    ],
});

router.beforeEach(async (to, from, next) => {
    // The URL owns the language: adopt it before any view renders, so the first
    // paint is already in the right locale.
    const language = isLanguage(to.params.lang) ? to.params.lang : null;
    if (language) applyLanguage(language);

    const authStore = useAuthStore();

    // Wait for auth to finish loading before checking permissions
    if (to.meta.requiresAuth || to.meta.requiresPermission || to.meta.requiresAnyPermission) {
        if (authStore.isLoading) {
            // Wait for auth to finish loading
            const maxWait = 50; // Max 5 seconds
            let attempts = 0;
            while (authStore.isLoading && attempts < maxWait) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
        }
    }

    const homeForLocale = {name: "home", params: {lang: language ?? resolveLanguage()}};

    // Check authentication first
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next(homeForLocale);
        return;
    }

    // Check specific permission
    if (to.meta.requiresPermission) {
        const permission = to.meta.requiresPermission as string;
        if (!authStore.hasPermission(permission)) {
            next(homeForLocale);
            return;
        }
    }

    // Check if user has any of the required permissions
    if (to.meta.requiresAnyPermission) {
        const permissions = to.meta.requiresAnyPermission as string[];
        if (!authStore.hasAnyPermission(permissions)) {
            next(homeForLocale);
            return;
        }
    }

    next();
});

export default router;
