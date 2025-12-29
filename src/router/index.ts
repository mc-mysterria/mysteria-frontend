import {createRouter, createWebHistory} from "vue-router";
import {useAuthStore} from "@/stores/auth";
import {nextTick} from "vue";
import {
    PERM_NEWS_MANAGE,
    PERM_COUNSEL_MANAGE,
    PERM_SHOP_MANAGE,
    PERM_ADMIN,
    PERM_USERS_VIEW,
} from "@/constants/permissions";

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
        {
            path: "/",
            name: "home",
            component: () => import("@/views/HomeView.vue"),
        },
        {
            path: "/store",
            name: "shop",
            component: () => import("@/views/ShopView.vue"),
        },
        {
            path: "/rules",
            name: "rules",
            component: () => import("@/views/RulesView.vue"),
        },
        {
            path: "/guide",
            name: "guide",
            component: () => import("@/views/GuideView.vue"),
        },
        {
            path: "/wiki",
            redirect: () => {
                window.open("https://wiki.mysterria.net/", "_blank");
                return "/";
            },
        },
        {
            path: "/game",
            name: "game",
            component: () => import("@/views/GuideView.vue"),
        },
        {
            path: "/logout",
            name: "logout",
            component: () => import("@/views/LogoutView.vue"),
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: "/profile",
            name: "profile",
            component: () => import("@/views/ProfileView.vue"),
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: "/login",
            name: "login",
            component: () => import("@/views/LoginView.vue"),
        },
        {
            path: "/auth/callback",
            name: "auth-callback",
            component: () => import("@/views/AuthCallbackView.vue"),
        },
        {
            path: "/news/:slug",
            name: "news-article",
            component: () => import("@/views/NewsView.vue"),
        },
        {
            path: "/counsel/:slug",
            name: "counsel-detail",
            component: () => import("@/views/CounselDetailView.vue"),
        },
        {
            path: "/services/:slug",
            name: "service-detail",
            component: () => import("@/views/ServiceView.vue"),
        },
        {
            path: "/edit",
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
                {
                    path: "counsel",
                    name: "edit-counsel",
                    component: () => import("@/views/CounselEditView.vue"),
                    meta: {requiresAuth: true, requiresPermission: PERM_COUNSEL_MANAGE},
                }
            ],
        },
        {
            path: "/admin",
            name: "admin",
            component: () => import("@components/admin/AdminPanel.vue"),
            meta: {requiresAuth: true, requiresAnyPermission: [PERM_ADMIN, PERM_USERS_VIEW]},
        },
        {
            path: "/:pathMatch(.*)*",
            name: "404",
            component: () => import("@/views/PageNotFoundView.vue"),
        },
    ],
});

router.beforeEach(async (to, from, next) => {
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

    // Check authentication first
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next({name: "home"});
        return;
    }

    // Check specific permission
    if (to.meta.requiresPermission) {
        const permission = to.meta.requiresPermission as string;
        if (!authStore.hasPermission(permission)) {
            next({name: "home"});
            return;
        }
    }

    // Check if user has any of the required permissions
    if (to.meta.requiresAnyPermission) {
        const permissions = to.meta.requiresAnyPermission as string[];
        if (!authStore.hasAnyPermission(permissions)) {
            next({name: "home"});
            return;
        }
    }

    next();
});

export default router;
