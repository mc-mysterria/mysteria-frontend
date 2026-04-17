<template>
  <HeaderItem/>
  <main class="covenant-page">
    <!-- Atmospheric Overlay -->
    <div class="ink-mist" aria-hidden="true"></div>

    <div class="covenant-container">
      <!-- Header Section -->
      <div class="myst-page-header">
        <div class="myst-header-decoration" aria-hidden="true"></div>
        <h1 class="myst-header-label">{{ t("lawsOfMysterria") || 'Laws of Mysterria' }}</h1>
        <div class="myst-header-decoration" aria-hidden="true"></div>
      </div>

      <div class="covenant-header">
        <!-- Tab Ritual -->
        <div class="tab-ritual">
          <button
              :class="{ active: activeTab === 'player' }"
              class="ritual-tab"
              @click="setActiveTab('player')"
          >
            <span class="ritual-label">{{ t('playerRules') }}</span>
          </button>
          <button
              v-if="isPrivilegedUser"
              :class="{ active: activeTab === 'staff' }"
              class="ritual-tab"
              @click="setActiveTab('staff')"
          >
            <span class="ritual-label">{{ t('staffRules') }}</span>
          </button>
          <button
              :class="{ active: activeTab === 'counsel' }"
              class="ritual-tab counsel-glow"
              @click="setActiveTab('counsel')"
          >
            <span class="ritual-label">{{ t('counselTab') }}</span>
          </button>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div :class="{ 'counsel-mode': activeTab === 'counsel' }" class="covenant-content">
        <!-- Table of Covenants Sidebar -->
        <aside v-if="activeTab !== 'counsel'" class="covenant-sidebar no-scrollbar">
          <div class="sidebar-frame">
            <h2 class="sidebar-title">{{ t('tableOfContents') }}</h2>
            <div class="sidebar-divider"></div>
            
            <nav class="covenant-nav">
              <div v-if="activeTab === 'player'" class="nav-list">
                <div
                    v-for="rule in rules"
                    :key="rule.id"
                    class="covenant-nav-item"
                    @click="scrollToRule(rule.id)"
                >
                  <span class="nav-id">{{ rule.id }}</span>
                  <span class="nav-text">{{ rule.title }}</span>
                </div>
              </div>

              <div v-else-if="activeTab === 'staff'" class="nav-groups">
                <div
                    v-for="group in staffRules"
                    :key="group.group"
                    class="nav-group"
                >
                  <div class="nav-group-header">{{ group.group }}</div>
                  <div
                      v-for="rule in group.rules"
                      :key="rule.id"
                      class="covenant-nav-item staff-item"
                      @click="scrollToRule(rule.id)"
                  >
                    <span class="nav-id">{{ rule.id }}</span>
                    <span class="nav-text">{{ rule.title }}</span>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </aside>

        <!-- Main Scroll Area -->
        <div class="covenant-main">
          <!-- Player Rules -->
          <div v-if="activeTab === 'player'" class="rule-ledger">
            <div
                v-for="rule in rules"
                :id="`rule-${rule.id}`"
                :key="rule.id"
                class="ledger-card"
            >
              <div class="card-num-area">
                <div class="card-num">{{ rule.id }}</div>
                <div class="card-num-line"></div>
              </div>
              <div class="card-body">
                <h3 class="card-title">{{ rule.title }}</h3>
                <p class="card-text">{{ rule.content }}</p>
              </div>
            </div>
          </div>

          <!-- Staff Rules -->
          <div v-else-if="activeTab === 'staff'" class="staff-ledger">
            <div
                v-for="(group, groupIndex) in staffRules"
                :key="groupIndex"
                class="group-section"
            >
              <div class="group-banner">
                <h3 class="banner-title">{{ group.group }}</h3>
                <div class="banner-line"></div>
              </div>
              
              <div class="group-entries">
                <div
                    v-for="rule in group.rules"
                    :id="`staff-rule-${rule.id}`"
                    :key="rule.id"
                    class="ledger-card staff-card"
                >
                  <div class="card-num-area">
                    <div class="card-num">{{ rule.id }}</div>
                  </div>
                  <div class="card-body">
                    <h4 class="card-title">{{ rule.title }}</h4>
                    <p class="card-text">{{ rule.content }}</p>
                    <div v-if="rule.examples" class="card-examples">
                      <span class="ex-label">{{ t('examples') }}:</span>
                      <p class="ex-text">{{ rule.examples }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- UN-Meeting Counsel -->
          <div v-else-if="activeTab === 'counsel'" class="counsel-ritual-view">
            <CounselListSection/>
          </div>
        </div>
      </div>
    </div>
  </main>
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
    try {
      const rulesModule = await import('@/assets/sources/rules_en.json')
      rules.value = rulesModule.default as Rule[]
    } catch (fallbackError) {
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
    try {
      const staffRulesModule = await import('@/assets/sources/staff_rules_en.json')
      staffRules.value = staffRulesModule.default as StaffRuleGroup[]
    } catch (fallbackError) {
      staffRules.value = []
    }
  }
}

onMounted(() => {
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
/* COVENANT PAGE AESTHETIC */

.covenant-page {
  position: relative;
  background-color: #080a14;
  padding: 120px 0 80px;
  color: #e0e0e0;
}

.ink-mist {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(200, 178, 115, 0.05) 0%, transparent 70%);
  pointer-events: none;
  z-index: 1;
}

.covenant-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  position: relative;
  z-index: 2;
}

/* Header & Tab Ritual */
.covenant-header {
  text-align: center;
  margin-bottom: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tab-ritual {
  display: flex;
  gap: 16px;
  background: rgba(255, 255, 255, 0.03);
  padding: 8px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.ritual-tab {
  background: none;
  border: none;
  padding: 12px 32px;
  color: #666;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.ritual-tab:hover { color: #aaa; }
.ritual-tab.active {
  color: var(--myst-gold);
  background: rgba(200, 178, 115, 0.1);
}

.ritual-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; width: 100%; height: 2px;
  background: var(--myst-gold);
  box-shadow: 0 0 10px var(--myst-gold);
}

.counsel-glow.active {
  color: #4dd0e1;
  background: rgba(77, 208, 225, 0.1);
}

.counsel-glow.active::after {
  background: #4dd0e1;
  box-shadow: 0 0 10px #4dd0e1;
}

/* Two Column Content */
.covenant-content {
  display: flex;
  gap: 64px;
  align-items: flex-start;
}

.covenant-content.counsel-mode {
  display: block;
}

/* Sidebar */
.covenant-sidebar {
  flex: 0 0 340px;
  position: sticky;
  top: 120px;
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  padding-right: 20px;
  z-index: 10;
}

.sidebar-frame {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 32px;
  border-radius: 4px;
}

.sidebar-title {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: var(--myst-offwhite);
  margin-bottom: 24px;
  text-align: center;
}

.sidebar-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--myst-gold), transparent);
  margin-bottom: 32px;
}

.covenant-nav { display: flex; flex-direction: column; gap: 8px; }

.covenant-nav-item {
  display: flex;
  gap: 16px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 2px solid transparent;
}

.covenant-nav-item:hover {
  background: rgba(255, 255, 255, 0.03);
  border-left-color: var(--myst-gold);
}

.nav-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--myst-gold);
  font-weight: 700;
  min-width: 24px;
}

.nav-text {
  font-size: 13px;
  color: #888;
  transition: color 0.3s ease;
}

.covenant-nav-item:hover .nav-text { color: var(--myst-offwhite); }

.nav-group-header {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #444;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 32px 0 16px;
  padding-left: 12px;
}

/* Main Ledger */
.covenant-main { flex: 1; min-width: 0; }

.rule-ledger, .group-entries {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.ledger-card {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 32px;
  opacity: 0;
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideUp { to { opacity: 1; transform: translateY(0); } from { opacity: 0; transform: translateY(40px); } }

.card-num-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 24px;
  font-weight: 800;
  color: var(--myst-gold);
  background: rgba(0, 0, 0, 0.4);
  width: 60px; height: 60px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(200, 178, 115, 0.2);
}

.card-num-line {
  flex: 1;
  width: 1px;
  background: linear-gradient(180deg, rgba(200, 178, 115, 0.3), transparent);
  margin-top: 16px;
}

.card-title {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  color: var(--myst-offwhite);
  margin: 0 0 16px;
  font-weight: 700;
}

.card-text {
  font-size: 16px;
  line-height: 1.7;
  color: #aaa;
}

/* Staff Specific */
.group-banner {
  margin-bottom: 48px;
  position: relative;
}

.banner-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: var(--myst-gold);
  text-transform: uppercase;
  letter-spacing: 8px;
  margin-bottom: 16px;
}

.banner-line {
  height: 1px;
  background: linear-gradient(90deg, var(--myst-gold), transparent);
}

.card-examples {
  margin-top: 24px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-left: 2px solid #444;
}

.ex-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 8px;
  display: block;
}

.ex-text {
  font-size: 14px;
  font-style: italic;
  color: #888;
  margin: 0;
}

/* Responsive */
@media (max-width: 1200px) {
  .covenant-content { gap: 40px; }
  .covenant-sidebar { flex: 0 0 300px; }
}

@media (max-width: 1024px) {
  .covenant-content { flex-direction: column; }
  .covenant-sidebar { 
    position: static; 
    flex: none; 
    width: 100%; 
    max-height: none;
    order: -1;
  }
  .covenant-nav {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .covenant-container { padding: 0 24px; }
  .ledger-card { grid-template-columns: 1fr; gap: 16px; }
  .card-num-area { flex-direction: row; gap: 20px; align-items: center; }
  .card-num-line { display: none; }
  .main-title { font-size: 2.5rem; }
  .tab-ritual { flex-direction: column; width: 100%; }
}
</style>
