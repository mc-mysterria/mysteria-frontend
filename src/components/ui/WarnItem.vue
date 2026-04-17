<template>
  <Transition name="ritual-toast">
    <div
        v-if="isVisible"
        :class="['notification-ritual-card', type, { clickable: clickable }]"
        role="alert"
        @click="handleClick"
    >
      <div :class="type" class="notification-ritual-icon">
        <span v-if="type === 'success'">†</span>
        <span v-else-if="type === 'error' || type === 'fatal'">‡</span>
        <span v-else-if="type === 'warn'">!</span>
        <span v-else>i</span>
      </div>

      <div class="notification-ritual-content">
        <div class="notification-ritual-message">{{ message }}</div>
        <i v-if="copyable" class="fa-solid fa-copy copy-ritual-hint"></i>
      </div>

      <button v-if="!copyable" aria-label="Close notification" class="close-ritual-btn" @click.stop="close">
        <IconClose class="icon-close"/>
      </button>

      <!-- Progress bar for duration -->
      <div v-if="duration && duration > 0" :style="{ animationDuration: `${duration}ms` }" class="ritual-progress"></div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue";
import IconClose from "@/assets/icons/IconClose.vue";

const props = defineProps<{
  message: string;
  type: "info" | "warn" | "error" | "fatal" | "debug" | "success";
  duration?: number;
  clickable?: boolean;
  copyable?: boolean;
}>();

const emit = defineEmits(["close", "click"]);
const isVisible = ref(true);

const close = () => {
  isVisible.value = false;
  setTimeout(() => {
    emit("close");
  }, 300);
};

const handleClick = () => {
  if (props.clickable) {
    emit("click");
  }
};

onMounted(() => {
  if (props.duration !== 0) {
    setTimeout(close, props.duration || 5000);
  }
});
</script>

<style scoped>
.notification-ritual-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 400px;
  padding: 16px 20px;
  background: #080a14;
  border: 1px solid rgba(200, 178, 115, 0.2);
  border-radius: 4px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
  margin-bottom: 12px;
  backdrop-filter: blur(12px);
  overflow: hidden;
  transition: all 0.3s ease;
}

.notification-ritual-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: var(--myst-gold);
  border: 1px solid rgba(200, 178, 115, 0.3);
  background: rgba(200, 178, 115, 0.05);
  flex-shrink: 0;
}

.notification-ritual-icon.error, .notification-ritual-icon.fatal {
  color: #ff5252;
  border-color: rgba(255, 82, 82, 0.3);
  background: rgba(255, 82, 82, 0.05);
}

.notification-ritual-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.notification-ritual-message {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #ccc;
  word-wrap: break-word;
}

.copy-ritual-hint {
  font-size: 12px;
  color: #444;
}

.close-ritual-btn {
  background: none; border: none;
  color: #444; cursor: pointer;
  transition: color 0.2s;
  padding: 4px;
}
.close-ritual-btn:hover { color: var(--myst-gold); }

.ritual-progress {
  position: absolute;
  bottom: 0; left: 0; height: 2px;
  width: 100%;
  background: var(--myst-gold);
  transform-origin: left;
  animation: ritualShrink linear forwards;
}

.error .ritual-progress, .fatal .ritual-progress { background: #ff5252; }

@keyframes ritualShrink { from { transform: scaleX(1); } to { transform: scaleX(0); } }

/* Transitions */
.ritual-toast-enter-active {
  animation: ritualToastIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.ritual-toast-leave-active {
  animation: ritualToastOut 0.3s ease-in forwards;
}

@keyframes ritualToastIn {
  from { opacity: 0; transform: translateX(50px) scale(0.9); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}

@keyframes ritualToastOut {
  to { opacity: 0; transform: translateX(20px) scale(0.95); }
}

@media (max-width: 480px) {
  .notification-ritual-card { width: calc(100vw - 40px); }
}
</style>
