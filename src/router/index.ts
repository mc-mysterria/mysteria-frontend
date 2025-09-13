import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
      name: "wiki",
      component: () => import("@/views/WikiView.vue"),
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
      path: "/services/:slug",
      name: "service-detail",
      component: () => import("@/views/ServiceView.vue"),
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
        },
        {
          path: "services",
          name: "edit-services",
          component: () => import("@/views/ServiceEditView.vue"),
        }
      ],
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

  if (to.meta.requiresAuth || to.meta.requiresPrivileged) {
    if (authStore.isLoading) {
      next();
      return;
    }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: "home" });
  } else if (to.meta.requiresPrivileged && !authStore.isPrivilegedUser) {
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
