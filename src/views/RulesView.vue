<template>
  <HeaderItem />
  <div class="rules-page">
    <div class="rules-container">
      <!-- Header Section -->
      <div class="rules-header">
        <h1 class="rules-title">{{ t("rulesTitle") }}</h1>
        <p class="rules-subtitle">{{ t("rulesSubtitle") }}</p>
      </div>

      <!-- Two Column Layout -->
      <div class="rules-content">
        <!-- Table of Contents Sidebar -->
        <div class="rules-sidebar">
          <h2 class="sidebar-title">{{ t('tableOfContents') }}</h2>
          <nav class="rules-nav">
            <div
              v-for="rule in rules"
              :key="rule.id"
              class="nav-item"
              @click="scrollToRule(rule.id)"
            >
              <span class="nav-number">{{ rule.id }}</span>
              <span class="nav-title">{{ rule.title }}</span>
            </div>
          </nav>
        </div>

        <!-- Rules Display Area -->
        <div class="rules-main">
          <div class="all-rules">
            <div
              v-for="rule in rules"
              :key="rule.id"
              class="rule-card"
              :id="`rule-${rule.id}`"
            >
              <div class="rule-number">{{ rule.id }}</div>
              <div class="rule-content">
                <h3 class="rule-title">{{ rule.title }}</h3>
                <p class="rule-description">{{ rule.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <FooterItem />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from "@/composables/useI18n";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";

const { t, currentLanguage } = useI18n();

interface Rule {
  id: string
  title: string
  content: string
}

const rules = ref<Rule[]>([])

const scrollToRule = (ruleId: string) => {
  const element = document.getElementById(`rule-${ruleId}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const loadRulesForLanguage = async (lang: string) => {
  try {
    const rulesModule = await import(`@/assets/sources/rules_${lang}.json`)
    rules.value = rulesModule.default as Rule[]
  } catch (error) {
    // Fallback to English if language file not found
    try {
      const rulesModule = await import('@/assets/sources/rules_en.json')
      rules.value = rulesModule.default as Rule[]
    } catch (fallbackError) {
      console.error('Failed to load rules:', fallbackError)
      rules.value = []
    }
  }
}

onMounted(() => {
  loadRulesForLanguage(currentLanguage.value)
})

watch(currentLanguage, (newLang) => {
  loadRulesForLanguage(newLang)
})
</script>

<style scoped>
.rules-page {
  position: relative;
  background: var(--myst-bg);
  padding: 80px 0;
  color: var(--myst-ink);
}

.rules-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.rules-header {
  text-align: center;
  margin-bottom: 48px;
}

.rules-title {
  font-size: 3rem;
  font-weight: 800;
  color: var(--myst-ink-strong);
  margin-bottom: 16px;
  letter-spacing: -0.02em;
  font-family: "Inter", system-ui, sans-serif;
}

.rules-subtitle {
  font-size: 18px;
  color: var(--myst-ink-muted);
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* Two Column Layout */
.rules-content {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* Sidebar Styles */
.rules-sidebar {
  flex: 0 0 320px;
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, white 10%, transparent);
  border-radius: 8px;
  padding: 24px;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  backdrop-filter: blur(10px);
}


.sidebar-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--myst-ink-strong);
  margin-bottom: 24px;
  text-align: center;
  font-family: "Inter", system-ui, sans-serif;
}

.rules-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.nav-item:hover {
  background: color-mix(in srgb, var(--myst-bg-2) 60%, transparent);
}

.nav-number {
  background: var(--myst-gold);
  color: var(--myst-bg);
  font-weight: 600;
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 6px;
  min-width: 40px;
  text-align: center;
  flex-shrink: 0;
  font-family: "Inter", system-ui, sans-serif;
}

.nav-title {
  font-size: 14px;
  color: var(--myst-ink);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}


/* Main Content Area */
.rules-main {
  flex: 1;
  min-width: 0;
}

.all-rules {
  display: flex;
  flex-direction: column;
  gap: 16px;
}


.rule-card {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, white 10%, transparent);
  border-radius: 8px;
  padding: 24px;
  display: flex;
  gap: 20px;
}

.rule-number {
  background: var(--myst-gold);
  color: var(--myst-bg);
  font-weight: 700;
  font-size: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  min-width: 60px;
  height: fit-content;
  text-align: center;
  flex-shrink: 0;
  font-family: "Inter", system-ui, sans-serif;
}

.rule-content {
  flex: 1;
  min-width: 0;
}

.rule-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--myst-ink-strong);
  margin-bottom: 8px;
  line-height: 1.4;
  font-family: "Inter", system-ui, sans-serif;
}

.rule-description {
  font-size: 14px;
  line-height: 1.5;
  color: var(--myst-ink-muted);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .rules-content {
    flex-direction: column;
  }
  
  .rules-sidebar {
    flex: none;
    position: static;
    max-height: none;
    order: -1;
  }
  
  .rules-nav {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .rules-page {
    padding: 40px 0;
  }

  .rules-container {
    padding: 0 16px;
  }

  .rules-title {
    font-size: 32px;
  }

  .rules-subtitle {
    font-size: 16px;
  }

  .rules-header {
    margin-bottom: 32px;
  }

  .rules-sidebar {
    padding: 16px;
  }
  
  .rules-nav {
    grid-template-columns: 1fr;
  }

  .rule-card {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .rule-number {
    align-self: flex-start;
    min-width: 50px;
    padding: 8px 12px;
  }
}

@media (max-width: 640px) {
  .rules-content {
    gap: 16px;
  }
  
  .sidebar-title {
    font-size: 18px;
    margin-bottom: 16px;
  }
  
  .nav-item {
    padding: 10px 12px;
  }

  .rule-card {
    padding: 16px;
  }
}

/* Scrollbar Styling for Sidebar - matching design system */
.rules-sidebar::-webkit-scrollbar {
  width: 6px;
}

.rules-sidebar::-webkit-scrollbar-track {
  background: color-mix(in srgb, var(--myst-bg) 50%, transparent);
  border-radius: 3px;
}

.rules-sidebar::-webkit-scrollbar-thumb {
  background: var(--myst-gold-soft);
  border-radius: 3px;
}

.rules-sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--myst-gold);
}

/* Dark theme specific overrides */
@media (min-width: 1025px) {
  .rules-sidebar {
    scrollbar-color: var(--myst-gold) rgba(0, 0, 0, 0.05);
    scrollbar-width: thin;
  }
}
</style>
