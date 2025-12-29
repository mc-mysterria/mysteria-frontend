<template>
  <div class="notifications-container">
    <TransitionGroup name="slide-fade">
      <WarnItem
          v-for="(notification, index) in notifications"
          :key="notification.id"
          :clickable="notification.clickable"
          :copyable="notification.copyable"
          :duration="notification.duration"
          :message="notification.message"
          :style="{ bottom: `${20 + index * 80}px` }"
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
  bottom: 0;
  right: 20px;
  z-index: 9999;
}

</style>
