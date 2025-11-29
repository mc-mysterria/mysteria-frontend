<template>
  <div class="notifications-container">
    <TransitionGroup name="slide-fade">
      <WarnItem
          v-for="(notification, index) in notifications"
          :key="notification.id"
          :message="notification.message"
          :type="notification.type"
          :duration="notification.duration"
          :clickable="notification.clickable"
          :copyable="notification.copyable"
          :style="{ bottom: `${20 + index * 80}px` }"
          @close="() => remove(notification.id)"
          @click="() => handleNotificationClick(notification)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import WarnItem from "./WarnItem.vue";
import type {Notification} from "@/services/useNotification";
import {useNotification} from "@/services/useNotification";

const {notifications, remove, copyErrorDetails} = useNotification();

const handleNotificationClick = (notification: Notification) => {
  if (notification.copyable) {
    copyErrorDetails(notification);
  }
};
</script>

<style scoped>
.notifications-container {
  position: fixed;
  bottom: 0;
  right: 20px;
  z-index: 9999;
}

.slide-fade-move {
  transition: transform 0.3s ease;
}
</style>
