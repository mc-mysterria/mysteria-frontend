import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import ShopView from "@/views/ShopView.vue";
import PageNotFoundView from "@/views/PageNotFoundView.vue";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/store",
      name: "shop",
      component: ShopView,
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
      path: "/edit",
      name: "edit",
      component: () => import("@/views/EditView.vue"),
      meta: { requiresAuth: true, requiresPrivileged: true },
      children: [
        {
          path: "news",
          name: "edit-news",
          component: () => import("@/views/NewsEditView.vue"),
        }
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "404",
      component: PageNotFoundView,
    },
  ],
});

// Navigation guard to check authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // For protected routes, check auth state without artificial delays
  if (to.meta.requiresAuth || to.meta.requiresPrivileged) {
    // If still loading, let the route load and handle auth in the component
    // This prevents blocking navigation with artificial delays
    if (authStore.isLoading) {
      console.warn('Auth loading during navigation, proceeding to route - auth will be handled by component');
      next();
      return;
    }
  }

  // Synchronous checks only - no setTimeout or polling
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: "home" });
  } else if (to.meta.requiresPrivileged && !authStore.isPrivilegedUser) {
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
