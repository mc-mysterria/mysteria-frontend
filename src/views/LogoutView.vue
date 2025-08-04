<template>
  <div class="logout-container">
    <button @click="handleLogout" class="logout-button">{{ t('logout') }}</button>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { useI18n } from "@/composables/useI18n";

const authStore = useAuthStore();
const router = useRouter();
const { t } = useI18n();

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push("/");
  } catch (error) {
    console.error("Помилка при виході:", error);
  }
};
</script>

<style scoped>
.logout-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.logout-button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>
