<template>
  <button
      @click="copyIP"
      class="copy-ip-btn"
      :class="{ copied: showCopied }"
      :aria-label="`Copy server IP: ${ip}`"
  >
    <span class="ip-text">{{ ip }}</span>
    <span class="copy-feedback" v-if="showCopied">Copied!</span>
  </button>
</template>

<script setup lang="ts">
import {ref} from "vue";

interface Props {
  ip: string;
  size?: "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
});

const showCopied = ref(false);

const copyIP = async () => {
  try {
    await navigator.clipboard.writeText(props.ip);
    showCopied.value = true;
    setTimeout(() => {
      showCopied.value = false;
    }, 2000);
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = props.ip;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    showCopied.value = true;
    setTimeout(() => {
      showCopied.value = false;
    }, 2000);
  }
};
</script>

<style scoped>
.copy-ip-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, var(--myst-gold), #d4b86a);
  color: var(--myst-bg);
  border: 2px solid var(--myst-gold);
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(200, 178, 115, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.copy-ip-btn:hover {
  background: linear-gradient(135deg, #e6cc85, var(--myst-gold));
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(200, 178, 115, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border-color: color-mix(in srgb, var(--myst-gold) 120%, white 20%);
}

.copy-ip-btn.copied {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-color: #22c55e;
  transform: scale(0.98);
}

.ip-text {
  font-family: "Inter", "Roboto", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.copy-feedback {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: #22c55e;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  animation: fadeInScale 0.3s ease;
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: translateX(-50%) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

.copy-feedback::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #22c55e;
}
</style>
