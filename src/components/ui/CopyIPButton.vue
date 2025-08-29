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
import { ref } from "vue";

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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  background: var(--myst-gold);
  color: var(--myst-bg);
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.copy-ip-btn:hover {
  background: var(--myst-gold-soft);
  transform: translateY(-1px);
}

.copy-ip-btn.copied {
  background: #22c55e;
}

.ip-text {
  font-family: "monospace";
}

.copy-feedback {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--myst-bg-2);
  color: var(--myst-ink);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.copy-feedback::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--myst-bg-2);
}
</style>
