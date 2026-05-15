<template>
  <div class="notifications-container">
    <TransitionGroup name="slide-fade">
      <WarnItem
          v-for="notification in notifications"
          :key="notification.id"
          :clickable="notification.clickable"
          :copyable="notification.copyable"
          :duration="notification.duration"
          :message="notification.message"
          :type="notification.type"
          @click="() => handleNotificationClick(notification)"
          @close="() => remove(notification.id)"
      />
    </TransitionGroup>
  </div>
</template>

<script lang="ts" setup>
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
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  pointer-events: none;
}

.notifications-container :deep(.notification-ritual-card) {
  pointer-events: all;
}

</style>
