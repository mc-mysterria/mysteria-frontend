<template>
  <div
    ref="sectionRef"
    class="fade-section"
    :style="{ animationDelay: delay + 'ms' }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface Props {
  delay?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  delay: 0,
});

const sectionRef = ref<HTMLElement>();

let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!sectionRef.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          // Clean up immediately after animation triggers
          observer?.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  );

  observer.observe(sectionRef.value);
});

// Ensure proper cleanup on component unmount
onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});
</script>

<style scoped>
/* Styles are defined in main.css */
</style>
