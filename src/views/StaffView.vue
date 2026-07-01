<template>
  <HeaderItem />
  <main class="staff-page">
    <div class="staff-mist" aria-hidden="true"></div>

    <div class="staff-container">
      <div class="myst-page-header">
        <div class="myst-header-decoration" aria-hidden="true"></div>
        <h1 class="myst-header-label">{{ t("staffPage.eyebrow") }}</h1>
        <div class="myst-header-decoration" aria-hidden="true"></div>
      </div>

      <section class="staff-hero">
        <p class="staff-kicker">{{ t("staffPage.kicker") }}</p>
        <h2 class="staff-title">{{ t("staffPage.title") }}</h2>
        <p class="staff-lede">{{ t("staffPage.subtitle") }}</p>
      </section>

      <div v-if="loading" class="staff-status">
        <div class="staff-spinner" aria-hidden="true"></div>
        <p>{{ t("loading") }}</p>
      </div>

      <div v-else-if="error" class="staff-status">
        <p>{{ t("staffPage.loadError") }}</p>
      </div>

      <section v-else class="staff-ledger" :aria-label="t('staffPage.listLabel')">
        <article
          v-for="group in memberGroups"
          :key="group.position"
          class="rank-section"
        >
          <div class="rank-header">
            <div>
              <p class="rank-count">{{ group.members.length }} {{ t("staffPage.members") }}</p>
              <h3 class="rank-title">{{ group.position }}</h3>
            </div>
          </div>

          <div class="member-grid">
            <div
              v-for="member in group.members"
              :key="`${group.position}-${member.nickname}`"
              class="member-card"
            >
              <img
                v-if="member.avatarUrl"
                class="member-avatar"
                :alt="member.nickname"
                :src="member.avatarUrl"
                loading="lazy"
                referrerpolicy="no-referrer"
              >
              <div v-else class="member-avatar member-avatar-fallback" aria-hidden="true">
                <i class="fa-solid fa-user"></i>
              </div>
              <div class="member-info">
                <h4 class="member-name">{{ member.nickname }}</h4>
                <p class="member-role">{{ group.position }}</p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  </main>
  <FooterItem />
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from "vue";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
import {useI18n} from "@/composables/useI18n";
import {membersAPI} from "@/utils/api/staff";
import type {StaffMember} from "@/types/staff";

const {t} = useI18n();

const members = ref<StaffMember[]>([]);
const loading = ref(true);
const error = ref(false);

interface MemberGroup {
  position: string;
  members: StaffMember[];
}

const memberGroups = computed<MemberGroup[]>(() => {
  const groups: MemberGroup[] = [];
  for (const member of members.value) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.position === member.position) {
      lastGroup.members.push(member);
    } else {
      groups.push({position: member.position, members: [member]});
    }
  }
  return groups;
});

onMounted(async () => {
  try {
    const response = await membersAPI.getMembers(4);
    members.value = response.data;
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.staff-page {
  position: relative;
  min-height: 100vh;
  padding: 120px 0 88px;
  background: #080a14;
  color: var(--myst-ink);
  overflow: hidden;
}

.staff-mist {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 0%, rgba(200, 178, 115, 0.08), transparent 36%),
    radial-gradient(circle at 80% 18%, rgba(77, 208, 225, 0.05), transparent 30%);
  pointer-events: none;
}

.staff-container {
  position: relative;
  z-index: 1;
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
}

.staff-hero {
  max-width: 780px;
  margin: 0 auto 56px;
  text-align: center;
}

.staff-kicker,
.rank-count,
.member-role {
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.22em;
}

.staff-kicker {
  margin: 0 0 14px;
  color: var(--myst-gold);
  font-size: 11px;
}

.staff-title {
  margin: 0;
  color: var(--myst-offwhite);
  font-family: 'Playfair Display', serif;
  font-size: clamp(34px, 6vw, 64px);
  font-weight: 700;
  line-height: 1.05;
}

.staff-lede {
  max-width: 62ch;
  margin: 22px auto 0;
  color: #aaa;
  font-size: 16px;
  line-height: 1.75;
}

.staff-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px 0;
  color: #aaa;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.staff-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(200, 178, 115, 0.2);
  border-top-color: var(--myst-gold);
  border-radius: 50%;
  animation: staff-spin 0.8s linear infinite;
}

@keyframes staff-spin {
  to {
    transform: rotate(360deg);
  }
}

.staff-ledger {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.rank-section {
  border: 1px solid rgba(200, 178, 115, 0.14);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.018));
  border-radius: 4px;
  padding: 28px;
  box-shadow: 0 22px 50px rgba(0, 0, 0, 0.25);
}

.rank-header {
  display: grid;
  grid-template-columns: minmax(180px, 300px) 1fr;
  gap: 28px;
  align-items: end;
  padding-bottom: 22px;
  border-bottom: 1px solid rgba(200, 178, 115, 0.14);
}

.rank-count {
  margin: 0 0 8px;
  color: var(--myst-gold);
  font-size: 10px;
}

.rank-title {
  margin: 0;
  color: var(--myst-offwhite);
  font-family: 'Playfair Display', serif;
  font-size: clamp(24px, 3vw, 34px);
  line-height: 1.1;
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 14px;
  padding-top: 22px;
}

.member-card {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 14px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.22);
  border-radius: 4px;
  color: inherit;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.member-card:hover {
  transform: translateY(-2px);
  border-color: rgba(200, 178, 115, 0.28);
  background: rgba(200, 178, 115, 0.045);
}

.member-avatar {
  flex: 0 0 54px;
  width: 54px;
  height: 54px;
  border: 1px solid rgba(200, 178, 115, 0.3);
  border-radius: 4px;
  object-fit: cover;
  background: rgba(200, 178, 115, 0.08);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.24);
}

.member-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--myst-gold);
  font-size: 20px;
  opacity: 0.7;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  margin: 0 0 5px;
  overflow-wrap: anywhere;
  color: var(--myst-offwhite);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
}

.member-role {
  margin: 0;
  color: #666;
  font-size: 10px;
}

@media (max-width: 900px) {
  .staff-page {
    padding-top: 104px;
  }

  .rank-header {
    grid-template-columns: 1fr;
    gap: 12px;
    align-items: start;
  }
}

@media (max-width: 640px) {
  .staff-container {
    width: min(100% - 32px, 1180px);
  }

  .staff-hero {
    margin-bottom: 38px;
    text-align: left;
  }

  .rank-section {
    padding: 20px;
  }

  .member-grid {
    grid-template-columns: 1fr;
  }

  .member-avatar {
    flex-basis: 52px;
    width: 52px;
    height: 52px;
  }
}
</style>
