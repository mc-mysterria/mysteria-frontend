<template>
  <div class="notification-bell" @click="toggleNotifications">
    <IconNotification />
    <div v-if="hasUnreadNotifications" class="notification-badge"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import IconNotification from "@/assets/icons/IconNotification.vue";
const hasUnreadNotifications = ref(false);

const toggleNotifications = () => {
  console.log("Toggle notifications");
};
</script>

<style scoped>
.notification-bell {
  position: relative;
  cursor: pointer;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: #ff4d4d;
  border-radius: 50%;
  border: 2px solid #23262c;
}

.imgButton {
  background-color: #171a21;
  padding: 12px;
  border-radius: 50%;
  margin: 0 10px;
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.24);
  transition: background-color 0.3s ease;
}

.imgButton:hover {
  background-color: #2a2d35;
}
</style>
