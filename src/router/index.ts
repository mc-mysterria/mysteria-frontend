import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import ShopView from "@/views/ShopView.vue";
import PageNotFoundView from "@/views/PageNotFoundView.vue";

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
      path: "/:pathMatch(.*)*",
      name: "404",
      component: PageNotFoundView,
    },
  ],
});

export default router;
