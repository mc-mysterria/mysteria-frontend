<template>
  <div v-if="!profile">
    <div class="unauthorized-container">
      <div class="unauthorized-message">
        <p>{{ message }}</p>
        <AuthButton class="loginPC"></AuthButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthButton from "@/components/ui/AuthButton.vue";
import { useUserStore } from "@/stores/user";
import { computed } from "vue";

const userStore = useUserStore();
const profile = computed(() => userStore.currentUser);

interface Props {
  message?: string;
}

withDefaults(defineProps<Props>(), {
  message: "Увійдіть у свій обліковий запис",
});
</script>

<style scoped>
.unauthorized-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  background-color: #23262c;
  border-radius: 7px;
  margin: 0 auto;
  max-width: 600px;
  padding: 30px;
  text-align: center;
}

.unauthorized-message p {
  color: #ffffff;
  font-size: 18px;
  margin-bottom: 20px;
}

.unauthorized-container {
  min-height: calc(100vh - 100px);
  display: flex;
  align-items: center;
}
</style>
