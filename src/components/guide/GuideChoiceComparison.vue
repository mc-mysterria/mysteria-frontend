<template>
  <div class="choice-grid">
    <article
      v-for="choice in choices"
      :key="choice.name"
      class="choice-card"
      :class="{ recommended: choice.recommended }"
    >
      <div class="choice-card-head">
        <div>
          <span class="micro-label">{{ choice.eyebrow }}</span>
          <h3>{{ choice.name }}</h3>
        </div>
        <span v-if="choice.recommended" class="recommended-tag">{{ ui.recommended }}</span>
      </div>

      <dl>
        <div>
          <dt>{{ ui.benefit }}</dt>
          <dd>{{ choice.benefit }}</dd>
        </div>
        <div>
          <dt>{{ ui.cost }}</dt>
          <dd>{{ choice.cost }}</dd>
        </div>
        <div>
          <dt>{{ ui.bestFor }}</dt>
          <dd>{{ choice.bestFor }}</dd>
        </div>
      </dl>
    </article>
  </div>
</template>

<script lang="ts" setup>
import type {GuideChoice, GuideContent} from "@/data/guideContent";

defineProps<{
  choices: GuideChoice[];
  ui: GuideContent["ui"];
}>();
</script>

<style scoped>
.choice-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.choice-card {
  position: relative;
  padding: 28px;
  border: 1px solid rgba(245, 245, 247, 0.14);
  background: rgba(17, 19, 29, 0.78);
}

.choice-card.recommended {
  border-color: rgba(200, 178, 115, 0.5);
  background:
    linear-gradient(145deg, rgba(200, 178, 115, 0.09), transparent 55%),
    rgba(17, 19, 29, 0.86);
}

.choice-card-head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 66px;
}

.micro-label {
  display: block;
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.26em;
  line-height: 1.4;
  text-transform: uppercase;
  color: var(--myst-gold);
}

h3 {
  margin: 7px 0 0;
  font-family: "Playfair Display", serif;
  font-size: 26px;
  font-weight: 600;
}

.recommended-tag {
  padding: 5px 8px;
  border: 1px solid rgba(200, 178, 115, 0.45);
  color: var(--myst-gold);
  font-family: "JetBrains Mono", monospace;
  font-size: 8px;
  letter-spacing: 0.15em;
  white-space: nowrap;
}

dl {
  margin: 22px 0 0;
}

dl > div {
  display: grid;
  grid-template-columns: 122px 1fr;
  gap: 16px;
  padding: 14px 0;
  border-top: 1px solid rgba(245, 245, 247, 0.09);
}

dt {
  color: var(--myst-ink-muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

dd {
  margin: 0;
  color: var(--myst-ink);
  font-size: 13px;
  line-height: 1.55;
}

@media (max-width: 1024px) {
  dl > div {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}

@media (max-width: 800px) {
  .choice-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .choice-card {
    padding: 22px;
  }

  .choice-card-head {
    flex-direction: column;
  }
}
</style>
