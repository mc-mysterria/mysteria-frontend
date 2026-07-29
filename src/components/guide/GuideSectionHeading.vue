<template>
  <header class="section-heading">
    <span class="eyebrow">{{ eyebrow }}</span>
    <h2>{{ title }}</h2>
    <p v-if="lede">{{ lede }}</p>
  </header>
</template>

<script lang="ts" setup>
defineProps<{
  eyebrow: string;
  title: string;
  lede?: string;
}>();
</script>

<style scoped>
.section-heading {
  max-width: 760px;
  margin-bottom: 38px;
}

.eyebrow {
  display: block;
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.26em;
  line-height: 1.4;
  text-transform: uppercase;
  color: var(--myst-gold);
}

h2 {
  margin: 10px 0 12px;
  font-family: "Playfair Display", serif;
  font-size: clamp(30px, 4vw, 46px);
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.12;
  color: var(--myst-ink-strong);
}

p {
  max-width: 680px;
  margin: 0;
  color: var(--myst-ink-muted);
  font-size: 16px;
  line-height: 1.7;
}

@media (max-width: 560px) {
  .section-heading {
    margin-bottom: 28px;
  }
}
</style>
