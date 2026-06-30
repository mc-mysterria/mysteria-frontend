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

      <section class="staff-ledger" :aria-label="t('staffPage.listLabel')">
        <article
          v-for="group in staffGroups"
          :key="group.rank"
          class="rank-section"
        >
          <div class="rank-header">
            <div>
              <p class="rank-count">{{ group.members.length }} {{ t("staffPage.members") }}</p>
              <h3 class="rank-title">{{ t(rankTitleKey(group.rank)) }}</h3>
            </div>
            <p class="rank-description">{{ t(rankDescriptionKey(group.rank)) }}</p>
          </div>

          <div class="member-grid">
            <a
              v-for="member in group.members"
              :key="`${group.rank}-${member.name}`"
              class="member-card"
              :href="member.profileUrl"
              rel="noopener noreferrer"
              target="_blank"
              :aria-label="`${member.name} ${member.platform === 'github' ? t('staffPage.githubProfile') : t('staffPage.discordProfile')}`"
            >
              <img
                class="member-avatar"
                :alt="member.name"
                :src="member.avatarUrl"
                loading="lazy"
                referrerpolicy="no-referrer"
              >
              <div class="member-info">
                <h4 class="member-name">{{ member.name }}</h4>
                <p class="member-handle">@{{ member.username }}</p>
                <p class="member-role">{{ t(rankTitleKey(group.rank)) }}</p>
              </div>
              <span class="member-profile-icon" aria-hidden="true">
                <i :class="member.platform === 'github' ? 'fa-brands fa-github' : 'fa-brands fa-discord'"></i>
              </span>
            </a>
          </div>
        </article>
      </section>
    </div>
  </main>
  <FooterItem />
</template>

<script lang="ts" setup>
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
import {useI18n} from "@/composables/useI18n";
import {staffGroups, type StaffRank} from "@/data/staff";

const {t} = useI18n();

const rankTitleKey = (rank: StaffRank) => `staffPage.ranks.${rank}`;
const rankDescriptionKey = (rank: StaffRank) => `staffPage.rankDescriptions.${rank}`;
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

.rank-description {
  max-width: 62ch;
  margin: 0;
  color: #8f8f98;
  font-size: 14px;
  line-height: 1.65;
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
  text-decoration: none;
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

.member-handle {
  margin: 0 0 6px;
  overflow: hidden;
  color: #878790;
  font-size: 13px;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-role {
  margin: 0;
  color: #666;
  font-size: 10px;
}

.member-profile-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  border: 1px solid rgba(200, 178, 115, 0.16);
  border-radius: 4px;
  color: var(--myst-gold);
  background: rgba(200, 178, 115, 0.05);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.member-card:hover .member-profile-icon {
  border-color: rgba(200, 178, 115, 0.32);
  background: rgba(200, 178, 115, 0.1);
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
