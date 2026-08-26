<template>
  <Transition name="lang-notice">
    <aside
        v-if="visible"
        aria-live="polite"
        class="lang-notice"
        role="status"
    >
      <i aria-hidden="true" class="fa-solid fa-language notice-glyph"></i>

      <div class="notice-body">
        <p class="notice-label">{{ t('contentLanguageNotice.label') }}</p>
        <p class="notice-text">{{ t('contentLanguageNotice.body') }}</p>
      </div>

      <button
          :aria-label="t('contentLanguageNotice.dismiss')"
          class="notice-dismiss"
          type="button"
          @click="dismiss"
      >
        <i aria-hidden="true" class="fa-solid fa-xmark"></i>
      </button>
    </aside>
  </Transition>
</template>

<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import {useI18n} from "@/composables/useI18n";
import {hasOwnArticles} from "@/locales";

const {t, currentLanguage} = useI18n();

/*
 * Dismissal is remembered per locale rather than globally: a reader who has
 * acknowledged that the German store is English still deserves the warning the
 * first time they land on the Romanian one.
 */
const STORAGE_KEY = "mysterria-content-language-notice";

const readDismissed = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? raw.split(",").filter(Boolean) : [];
  } catch {
    // Blocked storage: the notice reappears, which is the harmless direction.
    return [];
  }
};

const dismissed = ref<string[]>(readDismissed());

const visible = computed(() =>
    !hasOwnArticles(currentLanguage.value) && !dismissed.value.includes(currentLanguage.value),
);

const dismiss = () => {
  const language = currentLanguage.value;
  if (dismissed.value.includes(language)) return;

  dismissed.value = [...dismissed.value, language];
  try {
    localStorage.setItem(STORAGE_KEY, dismissed.value.join(","));
  } catch {
    // Same as above - the in-memory ref still hides it for this visit.
  }
};

/* Re-read on a language switch, so a dismissal made in another tab is honoured. */
watch(currentLanguage, () => {
  dismissed.value = readDismissed();
});
</script>

<style scoped>
.lang-notice {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  /* Under the header (1000) and modals (3000), over page content. */
  z-index: 900;

  display: flex;
  gap: 14px;
  align-items: flex-start;
  width: calc(100% - 40px);
  max-width: 560px;
  padding: 16px 18px;

  background: linear-gradient(160deg, rgba(24, 22, 14, 0.94), rgba(8, 10, 18, 0.97));
  border: 1px solid var(--myst-line-28);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(10px);
}

.notice-glyph {
  margin-top: 3px;
  color: var(--myst-gold);
  font-size: 15px;
  flex-shrink: 0;
}

.notice-body {
  flex: 1;
  min-width: 0;
}

.notice-label {
  margin: 0 0 6px;
  color: var(--myst-gold);
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.notice-text {
  margin: 0;
  color: var(--myst-ink-muted);
  font-size: 13px;
  line-height: 1.65;
}

.notice-dismiss {
  flex-shrink: 0;
  padding: 4px 6px;
  background: none;
  border: none;
  color: #55524a;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.notice-dismiss:hover,
.notice-dismiss:focus-visible {
  color: var(--myst-gold);
}

.lang-notice-enter-active,
.lang-notice-leave-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.lang-notice-enter-from,
.lang-notice-leave-to {
  opacity: 0;
  transform: translate(-50%, 16px);
}

@media (prefers-reduced-motion: reduce) {
  .lang-notice-enter-active,
  .lang-notice-leave-active {
    transition: opacity 0.2s ease;
  }

  .lang-notice-enter-from,
  .lang-notice-leave-to {
    transform: translateX(-50%);
  }
}

@media (max-width: 576px) {
  .lang-notice {
    bottom: 16px;
    padding: 14px 16px;
  }

  .notice-text {
    font-size: 12.5px;
  }
}
</style>
