<template>
  <HeaderItem/>
  <div class="rules-page">
    <div class="rules-container">
      <!-- Header Section -->
      <div class="rules-header">
        <h1 class="rules-title">{{ t("rulesTitle") }}</h1>
        <p class="rules-subtitle">{{ t("rulesSubtitle") }}</p>

        <!-- Tabs for privileged users and counsel -->
        <div v-if="isPrivilegedUser || true" class="rules-tabs">
          <button
              :class="{ active: activeTab === 'player' }"
              class="tab-button"
              @click="setActiveTab('player')"
          >
            {{ t('playerRules') }}
          </button>
          <button
              v-if="isPrivilegedUser"
              :class="{ active: activeTab === 'staff' }"
              class="tab-button"
              @click="setActiveTab('staff')"
          >
            {{ t('staffRules') }}
          </button>
          <button
              :class="{ active: activeTab === 'counsel' }"
              class="tab-button counsel-tab"
              @click="setActiveTab('counsel')"
          >
            {{ t('counselTab') }}
          </button>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div :class="{ 'counsel-active': activeTab === 'counsel' }" class="rules-content">
        <!-- Table of Contents Sidebar (hidden for counsel tab) -->
        <div v-if="activeTab !== 'counsel'" class="rules-sidebar">
          <h2 class="sidebar-title">{{ t('tableOfContents') }}</h2>
          <nav class="rules-nav">
            <!-- Player Rules Navigation -->
            <div v-if="activeTab === 'player'">
              <div
                  v-for="rule in rules"
                  :key="rule.id"
                  class="nav-item"
                  @click="scrollToRule(rule.id)"
              >
                <span class="nav-number">{{ rule.id }}</span>
                <span class="nav-title">{{ rule.title }}</span>
              </div>
            </div>

            <!-- Staff Rules Navigation -->
            <div v-else-if="activeTab === 'staff'">
              <div
                  v-for="group in staffRules"
                  :key="group.group"
                  class="nav-group"
              >
                <div class="nav-group-title">{{ group.group }}</div>
                <div
                    v-for="rule in group.rules"
                    :key="rule.id"
                    class="nav-item staff-nav-item"
                    @click="scrollToRule(rule.id)"
                >
                  <span class="nav-number">{{ rule.id }}</span>
                  <span class="nav-title">{{ rule.title }}</span>
                </div>
              </div>
            </div>
          </nav>
        </div>

        <!-- Rules Display Area -->
        <div class="rules-main">
          <!-- Player Rules -->
          <div v-if="activeTab === 'player'" class="all-rules">
            <div
                v-for="rule in rules"
                :id="`rule-${rule.id}`"
                :key="rule.id"
                class="rule-card"
            >
              <div class="rule-number">{{ rule.id }}</div>
              <div class="rule-content">
                <h3 class="rule-title">{{ rule.title }}</h3>
                <p class="rule-description">{{ rule.content }}</p>
              </div>
            </div>
          </div>

          <!-- Staff Rules -->
          <div v-else-if="activeTab === 'staff'" class="staff-rules-section">
            <div
                v-for="(group, groupIndex) in staffRules"
                :key="groupIndex"
                class="staff-rule-group"
            >
              <h3 class="group-title">{{ group.group }}</h3>
              <div class="group-rules">
                <div
                    v-for="rule in group.rules"
                    :id="`staff-rule-${rule.id}`"
                    :key="rule.id"
                    class="rule-card staff-rule-card"
                >
                  <div class="rule-number staff-rule-number">{{ rule.id }}</div>
                  <div class="rule-content">
                    <h4 class="rule-title">{{ rule.title }}</h4>
                    <p class="rule-description">{{ rule.content }}</p>
                    <p v-if="rule.examples" class="rule-examples">
                      <strong>{{ t('examples') }}:</strong> {{ rule.examples }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- UN-Meeting Counsel -->
          <div v-else-if="activeTab === 'counsel'" class="counsel-main">
            <CounselListSection/>
          </div>
        </div>
      </div>
    </div>
  </div>
  <FooterItem/>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue'
import {useRoute} from 'vue-router'
import {useI18n} from "@/composables/useI18n";
import {useAuthStore} from "@/stores/auth";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
import CounselListSection from "@/components/counsel/CounselListSection.vue";

const {t, currentLanguage} = useI18n();
const authStore = useAuthStore();
const route = useRoute();

interface Rule {
  id: string
  title: string
  content: string
  examples?: string
}

interface StaffRuleGroup {
  group: string
  rules: Rule[]
}

const rules = ref<Rule[]>([])
const staffRules = ref<StaffRuleGroup[]>([])

const isPrivilegedUser = computed(() => {
  const role = authStore.userRole?.toUpperCase()
  return role && role !== 'MEMBER' && role !== 'PLAYER' && role !== 'USER'
})

const activeTab = ref<'player' | 'staff' | 'counsel'>('player')

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const currentRules = computed(() => {
  if (activeTab.value === 'staff') {
    return staffRules.value.flatMap(group =>
        group.rules.map(rule => ({
          ...rule,
          id: `${rule.id}`,
          groupTitle: group.group
        }))
    )
  }
  return rules.value
})

const setActiveTab = (tab: 'player' | 'staff' | 'counsel') => {
  activeTab.value = tab
}

const scrollToRule = (ruleId: string) => {
  const elementId = activeTab.value === 'staff' ? `staff-rule-${ruleId}` : `rule-${ruleId}`
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollIntoView({behavior: 'smooth', block: 'start'})
  }
}

const loadRulesForLanguage = async (lang: string) => {
  try {
    const rulesModule = await import(`@/assets/sources/rules_${lang}.json`)
    rules.value = rulesModule.default as Rule[]
  } catch {
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

const loadStaffRulesForLanguage = async (lang: string) => {
  if (!isPrivilegedUser.value) {
    staffRules.value = []
    return
  }

  try {
    const staffRulesModule = await import(`@/assets/sources/staff_rules_${lang}.json`)
    staffRules.value = staffRulesModule.default as StaffRuleGroup[]
  } catch {
    // Fallback to English if language file not found
    try {
      const staffRulesModule = await import('@/assets/sources/staff_rules_en.json')
      staffRules.value = staffRulesModule.default as StaffRuleGroup[]
    } catch (fallbackError) {
      console.error('Failed to load staff rules:', fallbackError)
      staffRules.value = []
    }
  }
}

onMounted(() => {
  // Check if there's a tab query parameter and set the active tab
  const tabQuery = route.query.tab as string | undefined
  if (tabQuery === 'counsel' || tabQuery === 'staff' || tabQuery === 'player') {
    activeTab.value = tabQuery
  }

  loadRulesForLanguage(currentLanguage.value)
  loadStaffRulesForLanguage(currentLanguage.value)
})

watch(currentLanguage, (newLang) => {
  loadRulesForLanguage(newLang)
  loadStaffRulesForLanguage(newLang)
})

watch(isPrivilegedUser, () => {
  loadStaffRulesForLanguage(currentLanguage.value)
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

/* Tabs */
.rules-tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
  padding: 4px;
  background: color-mix(in srgb, var(--myst-bg-2) 50%, transparent);
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, white 5%, transparent);
  backdrop-filter: blur(10px);
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.tab-button {
  flex: 1;
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--myst-ink-muted);
  font-size: 14px;
  font-weight: 500;
  font-family: "Inter", system-ui, sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.tab-button:hover {
  background: color-mix(in srgb, var(--myst-gold) 10%, transparent);
  color: var(--myst-ink);
}

.tab-button.active {
  background: var(--myst-gold);
  color: var(--myst-bg);
  font-weight: 600;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--myst-gold) 30%, transparent);
}

/* Counsel Tab Special Styling */
.tab-button.counsel-tab {
  position: relative;
  background: color-mix(in srgb, #4dd0e1 8%, transparent);
  color: color-mix(in srgb, var(--myst-ink) 90%, #4dd0e1);
}

.tab-button.counsel-tab:hover {
  background: color-mix(in srgb, #4a90e2 10%, transparent);
}

.tab-button.counsel-tab.active {
  background: linear-gradient(135deg, #4a90e2, #6ba4ec);
  color: white;
  box-shadow: 0 2px 12px color-mix(in srgb, #4a90e2 40%, transparent);
}

.tab-button.counsel-tab.active::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #4a90e2, #6ba4ec);
  border-radius: 10px;
  opacity: 0.3;
  filter: blur(8px);
  z-index: -1;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tab-button.counsel-tab.active::before {
    animation: none;
  }
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

/* Navigation Groups for Staff Rules */
.nav-group {
  margin-bottom: 24px;
}

.nav-group-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--myst-gold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  padding: 8px 16px;
  background: color-mix(in srgb, var(--myst-gold) 10%, transparent);
  border-radius: 6px;
  border-left: 3px solid var(--myst-gold);
  font-family: "Inter", system-ui, sans-serif;
}

.staff-nav-item {
  margin-left: 8px;
  border-left: 2px solid color-mix(in srgb, var(--myst-gold) 30%, transparent);
  padding-left: 12px;
}

.staff-nav-item:hover {
  border-left-color: var(--myst-gold);
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

/* Staff Rules Section */
.staff-rules-section {
  margin-top: 48px;
}

.section-divider {
  margin-bottom: 32px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--myst-ink-strong);
  text-align: center;
  margin-bottom: 16px;
  font-family: "Inter", system-ui, sans-serif;
}

.divider-line {
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--myst-gold), transparent);
  margin: 0 auto;
  max-width: 300px;
}

.staff-rule-group {
  margin-bottom: 40px;
}

.group-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--myst-ink-strong);
  margin-bottom: 20px;
  padding: 12px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-gold) 30%, transparent);
  font-family: "Inter", system-ui, sans-serif;
}

.group-rules {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.staff-rule-card {
  border-left: 4px solid var(--myst-gold);
  background: color-mix(in srgb, var(--myst-bg-2) 60%, transparent);
}

.staff-rule-number {
  background: linear-gradient(135deg, var(--myst-gold), color-mix(in srgb, var(--myst-gold) 80%, white));
  box-shadow: 0 2px 8px color-mix(in srgb, var(--myst-gold) 30%, transparent);
}

.rule-examples {
  margin-top: 12px;
  padding: 12px;
  background: color-mix(in srgb, var(--myst-bg) 50%, transparent);
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
  border-left: 3px solid var(--myst-gold-soft);
  font-style: italic;
}

.rule-examples strong {
  color: var(--myst-ink-strong);
  font-weight: 600;
  font-style: normal;
}

/* Counsel Main Section */
.counsel-main {
  width: 100%;
}

/* Make container full width when counsel tab is active */
.rules-container:has(.rules-content.counsel-active) {
  max-width: 100%;
  padding: 0;
}

.rules-content.counsel-active {
  display: block;
}

.rules-content.counsel-active .rules-main {
  max-width: 100%;
}

/* Responsive Design for Staff Rules */
@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }

  .staff-rules-section {
    margin-top: 32px;
  }

  .staff-rule-group {
    margin-bottom: 32px;
  }

  .group-title {
    font-size: 1.25rem;
  }

  .rules-tabs {
    max-width: 320px;
    margin-top: 24px;
  }

  .tab-button {
    padding: 10px 16px;
    font-size: 13px;
  }

  .nav-group {
    margin-bottom: 16px;
  }

  .nav-group-title {
    font-size: 12px;
    padding: 6px 12px;
    margin-bottom: 8px;
  }
}

/* Dark theme specific overrides */
@media (min-width: 1025px) {
  .rules-sidebar {
    scrollbar-color: var(--myst-gold) rgba(0, 0, 0, 0.05);
    scrollbar-width: thin;
  }
}
</style>
