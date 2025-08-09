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
      path: "/shop",
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

  // For protected routes, wait briefly for auth, but don't block indefinitely
  if ((to.meta.requiresAuth || to.meta.requiresPrivileged) && authStore.isLoading) {
    // Wait maximum 1 second for auth to initialize
    let attempts = 0;
    while (authStore.isLoading && attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
    
    // If still loading after timeout, assume not authenticated
    if (authStore.isLoading) {
      console.warn('Auth still loading after timeout, assuming not authenticated');
    }
  }

  // Check authentication only for protected routes
  if (to.meta.requiresAuth && (!authStore.isAuthenticated || authStore.isLoading)) {
    next({ name: "home" });
  } else if (to.meta.requiresPrivileged && (!authStore.isPrivilegedUser || authStore.isLoading)) {
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
