import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import VueCookies from "vue-cookies";
import VueDOMPurifyHTML from 'vue-dompurify-html';

import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "@/stores/auth";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(VueCookies);
app.use(VueDOMPurifyHTML);

window.$cookies = VueCookies;

const authStore = useAuthStore(pinia);
authStore.init();

app.mount("#app");
