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
import { ref, onMounted } from "vue";

interface Props {
  delay?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  delay: 0,
});

const sectionRef = ref<HTMLElement>();

onMounted(() => {
  if (!sectionRef.value) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
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
</script>

<style scoped>
/* Styles are defined in main.css */
</style>
