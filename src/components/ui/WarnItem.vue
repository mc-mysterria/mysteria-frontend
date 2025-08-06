<template>
  <Transition name="slide-fade">
    <div 
      v-if="isVisible" 
      :class="['notification-card', type, { clickable: clickable }]" 
      role="alert"
      @click="handleClick"
    >
      <div class="content">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          :class="['info-icon', type]"
        >
          <path
            d="M12 21.5C16.9706 21.5 21 17.4706 21 12.5C21 7.52944 16.9706 3.5 12 3.5C7.02944 3.5 3 7.52944 3 12.5C3 17.4706 7.02944 21.5 12 21.5Z"
            stroke-width="1.5"
            stroke-miterlimit="10"
          />
          <path
            d="M12 8V13.25"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12.375 16.625C12.375 16.8321 12.2071 17 12 17C11.7929 17 11.625 16.8321 11.625 16.625C11.625 16.4179 11.7929 16.25 12 16.25C12.2071 16.25 12.375 16.4179 12.375 16.625Z"
            stroke-width="1.5"
          />
        </svg>
        {{ message }}
        <!-- Copy icon for copyable notifications -->
        <svg
          v-if="copyable"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="copy-icon"
        >
          <path
            d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046 9.89543 22 11 22H20C21.1046 22 22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <IconClose v-if="!copyable" @click.stop="close" class="icon-close" />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 320px;
  padding: 10px 15px 10px 10px;
  background-color: #23252c;
  border-left: 7px solid;
  border-radius: 7px;
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.24);
  margin-bottom: 16px;
}

.content {
  display: flex;
  align-items: center;
  gap: 8px;
}

img {
  margin-left: 5px;
}

.info-icon {
  width: 24px !important;
  height: 24px !important;
  flex-shrink: 0;
}

.icon-close {
  cursor: pointer;
}

.error,
.warn,
.info,
.fatal,
.debug,
.success {
  border-left-color: var(--border-color);
}

.error .info-icon,
.warn .info-icon,
.info .info-icon,
.fatal .info-icon,
.debug .info-icon,
.success .info-icon {
  stroke: var(--border-color);
}

.error {
  --border-color: #e54545;
}

.warn {
  --border-color: #ee7828;
}

.info {
  --border-color: #0f9918;
}

.fatal {
  --border-color: #c0392b;
}

.debug {
  --border-color: #16a34a;
}

.success {
  --border-color: #0f9918;
}

.clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 24px rgba(0, 0, 0, 0.32);
}

.copy-icon {
  margin-left: auto;
  color: #bbb;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.clickable:hover .copy-icon {
  color: #fff;
}

/* Animation */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
