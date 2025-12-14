<template>
  <Transition name="slide-bounce">
    <div
        v-if="isVisible"
        :class="['notification-card', type, { clickable: clickable }]"
        role="alert"
        @click="handleClick"
    >
      <div class="notification-icon-wrapper" :class="type">
        <!-- Success Icon -->
        <svg v-if="type === 'success'" class="notification-icon" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>

        <!-- Error/Fatal Icon -->
        <svg v-else-if="type === 'error' || type === 'fatal'" class="notification-icon" viewBox="0 0 24 24" fill="none">
          <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>

        <!-- Warning Icon -->
        <svg v-else-if="type === 'warn'" class="notification-icon" viewBox="0 0 24 24" fill="none">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>

        <!-- Info/Debug Icon -->
        <svg v-else class="notification-icon" viewBox="0 0 24 24" fill="none">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div class="notification-content">
        <div class="notification-message">{{ message }}</div>
        <i v-if="copyable" class="fa-solid fa-copy copy-hint"></i>
      </div>

      <button v-if="!copyable" @click.stop="close" class="close-button" aria-label="Close notification">
        <IconClose class="icon-close"/>
      </button>

      <!-- Progress bar for duration -->
      <div v-if="duration && duration > 0" class="progress-bar" :style="{ animationDuration: `${duration}ms` }"></div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
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
.notification-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  width: 380px;
  padding: 16px 18px;
  background: color-mix(in srgb, var(--myst-bg) 95%, transparent);
  border: 1px solid color-mix(in srgb, var(--notification-color) 30%, transparent);
  border-radius: 12px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px color-mix(in srgb, var(--notification-color) 10%, transparent),
    0 0 20px color-mix(in srgb, var(--notification-color) 15%, transparent);
  margin-bottom: 12px;
  backdrop-filter: blur(16px);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--notification-color);
  box-shadow: 0 0 12px var(--notification-color);
}

/* Icon Wrapper */
.notification-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--notification-color) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--notification-color) 30%, transparent);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.notification-icon {
  width: 22px;
  height: 22px;
  color: var(--notification-color);
  filter: drop-shadow(0 0 4px color-mix(in srgb, var(--notification-color) 40%, transparent));
}

/* Content */
.notification-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.notification-message {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--myst-ink-strong);
  word-wrap: break-word;
}

.copy-hint {
  font-size: 14px;
  color: var(--myst-ink-muted);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

/* Close Button */
.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-button:hover {
  background: color-mix(in srgb, var(--myst-ink-muted) 10%, transparent);
  border-color: color-mix(in srgb, var(--myst-ink-muted) 40%, transparent);
}

.icon-close {
  width: 14px;
  height: 14px;
  opacity: 0.7;
}

.close-button:hover .icon-close {
  opacity: 1;
}

/* Progress Bar */
.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: var(--notification-color);
  transform-origin: left;
  animation: shrink linear forwards;
  box-shadow: 0 0 8px var(--notification-color);
}

@keyframes shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Type-specific colors */
.success {
  --notification-color: #10b981;
}

.error {
  --notification-color: #ef4444;
}

.fatal {
  --notification-color: #dc2626;
}

.warn {
  --notification-color: #f59e0b;
}

.info {
  --notification-color: #3b82f6;
}

.debug {
  --notification-color: #8b5cf6;
}

/* Clickable state */
.clickable {
  cursor: pointer;
}

.clickable:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px color-mix(in srgb, var(--notification-color) 20%, transparent),
    0 0 24px color-mix(in srgb, var(--notification-color) 25%, transparent);
}

.clickable:hover .notification-icon-wrapper {
  background: color-mix(in srgb, var(--notification-color) 25%, transparent);
  border-color: color-mix(in srgb, var(--notification-color) 50%, transparent);
  transform: scale(1.05);
}

.clickable:hover .copy-hint {
  color: var(--notification-color);
}

.clickable:active {
  transform: translateY(0);
}

/* Animations */
.slide-bounce-enter-active {
  animation: slideInBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.slide-bounce-leave-active {
  animation: slideOut 0.3s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes slideInBounce {
  0% {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
  60% {
    opacity: 1;
    transform: translateX(-10px) scale(1.02);
  }
  100% {
    transform: translateX(0) scale(1);
  }
}

@keyframes slideOut {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
}

/* Theme Support - Parchment */
:root[data-theme="parchment"] .notification-card {
  background: color-mix(in srgb, var(--myst-bg) 98%, transparent);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 0 0 1px color-mix(in srgb, var(--notification-color) 15%, transparent),
    0 0 20px color-mix(in srgb, var(--notification-color) 10%, transparent);
}

:root[data-theme="parchment"] .notification-icon-wrapper {
  background: color-mix(in srgb, var(--notification-color) 10%, transparent);
}

:root[data-theme="parchment"] .close-button {
  border-color: color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
}

:root[data-theme="parchment"] .close-button:hover {
  background: color-mix(in srgb, var(--myst-ink-muted) 15%, transparent);
}

/* Mobile Responsiveness */
@media (max-width: 480px) {
  .notification-card {
    width: calc(100vw - 40px);
    max-width: 380px;
    padding: 14px 16px;
  }

  .notification-icon-wrapper {
    width: 36px;
    height: 36px;
  }

  .notification-icon {
    width: 20px;
    height: 20px;
  }

  .notification-message {
    font-size: 13px;
  }
}
</style>
