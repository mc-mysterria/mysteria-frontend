<template>
  <nav :aria-label="label" class="article-toc">
    <ol>
      <li
          v-for="entry in entries"
          :key="entry.id"
          :class="['toc-item', `level-${entry.level}`, {active: entry.id === activeId}]"
      >
        <a :href="`#${entry.id}`" @click.prevent="$emit('select', entry.id)">{{ entry.text }}</a>
      </li>
    </ol>
  </nav>
</template>

<script lang="ts" setup>
import type {TocEntry} from '@/utils/articleToc';

defineProps<{
  entries: TocEntry[];
  activeId: string | null;
  label: string;
}>();

defineEmits<{ (event: 'select', id: string): void }>();
</script>

<style scoped>
.article-toc ol {
  list-style: none;
  margin: 0;
  padding: 0;
}

.toc-item a {
  display: block;
  padding: 6px 0 6px 14px;
  border-left: 1px solid var(--myst-line-12);
  color: var(--myst-ink-muted);
  font-size: 13px;
  line-height: 1.45;
  text-decoration: none;
  transition: color 0.18s ease, border-color 0.18s ease;
}

.toc-item.level-3 a {
  padding-left: 26px;
  font-size: 12.5px;
}

.toc-item a:hover,
.toc-item a:focus-visible {
  color: var(--myst-offwhite);
  border-left-color: var(--myst-line-40);
}

.toc-item.active > a {
  color: var(--myst-gold);
  border-left-color: var(--myst-gold);
}

.toc-item.level-2 a {
  font-weight: 600;
}
</style>
