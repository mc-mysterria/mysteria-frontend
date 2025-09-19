<template>
  <div class="section-title">
    <div class="section-eyebrow" v-if="eyebrow">{{ eyebrow }}</div>
    <h2 class="section-main-title">{{ title }}</h2>
    <p class="section-subtitle" v-if="subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

defineProps<Props>();
</script>

<style scoped>
.section-title {
  text-align: center;
  margin-bottom: 32px;
}

.section-eyebrow {
  color: var(--myst-gold);
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
  margin-top: 2px;
}

.section-main-title {
  font-family: "Inter", serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  color: var(--myst-ink-strong);
  margin-bottom: 16px;
  line-height: 1.2;
}

.section-subtitle {
  color: #a1a1aa;
  max-width: 600px;
  margin: 0 auto;
}
</style>
