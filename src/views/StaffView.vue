<template>
  <div class="staff-page">
    <HeaderItem/>

    <main class="order">
      <div class="order-glow" aria-hidden="true"></div>
      <div class="myst-shell order-inner">
        <header class="order-head">
          <p class="myst-eyebrow">{{ t('staffOrder.eyebrow') }}</p>
          <h1 class="myst-h1">{{ t('staffOrder.title') }}</h1>
          <p class="order-lede">{{ t('staffOrder.lede') }}</p>
        </header>

        <div v-if="loading" class="order-state">
          <div class="order-spinner" aria-hidden="true"></div>
          <p>{{ t('loading') }}</p>
        </div>

        <div v-else-if="error" class="order-state">
          <p>{{ t('staffPage.loadError') }}</p>
        </div>

        <template v-else>
          <section
              v-for="(group, groupIndex) in memberGroups"
              :key="group.position"
              class="rank-section"
          >
            <div class="rank-head">
              <h2>{{ group.position }}</h2>
              <span class="rank-rule" aria-hidden="true"></span>
              <span class="rank-count">{{ group.members.length }} {{ t('staffPage.members') }}</span>
            </div>

            <div class="member-grid">
              <div
                  v-for="member in group.members"
                  :key="`${group.position}-${member.nickname}`"
                  :class="['member-card', { crown: groupIndex === 0 }]"
              >
                <img
                    v-if="member.avatarUrl"
                    :alt="member.nickname"
                    :src="member.avatarUrl"
                    class="member-avatar"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                >
                <div v-else aria-hidden="true" class="member-avatar member-initial">
                  {{ member.nickname.charAt(0).toUpperCase() }}
                </div>

                <div class="member-copy">
                  <h3>{{ member.nickname }}</h3>
                  <p>{{ group.position }}</p>
                </div>
              </div>
            </div>
          </section>

          <div class="order-cta">
            <p>{{ t('staffOrder.helpQuestion') }}</p>
            <a
                class="myst-btn-gold"
                href="https://discord.com/invite/jc7GSxBWgb"
                rel="noopener noreferrer"
                target="_blank"
            >
              <IconDiscord aria-hidden="true"/>
              {{ t('staffOrder.openTicket') }}
            </a>
          </div>
        </template>
      </div>
    </main>

    <FooterItem/>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from "vue";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
import {useI18n} from "@/composables/useI18n";
import {breadcrumbLd, useSeo} from "@/composables/useSeo";
import IconDiscord from "@/assets/icons/IconDiscord.vue";
import {membersAPI} from "@/utils/api/staff";
import type {StaffMember} from "@/types/staff";

const {t} = useI18n();

const members = ref<StaffMember[]>([]);
const loading = ref(true);
const error = ref(false);

useSeo(() => ({
  title: t("staffOrder.title"),
  description: t("staffOrder.lede"),
  path: "/staff",
  jsonLd: [breadcrumbLd([{name: "Home", path: "/"}, {name: "Staff", path: "/staff"}])],
}));

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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--myst-bg);
  color: var(--myst-ink);
}

.order {
  position: relative;
  flex: 1 0 auto;
  padding: 80px 24px 90px;
  overflow: hidden;
}

.order-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200, 178, 115, 0.06), transparent 65%);
}

.order-inner {
  position: relative;
}

.order-head {
  margin-bottom: 70px;
  text-align: center;
}

.order-head .myst-eyebrow {
  margin-bottom: 14px;
}

.order-lede {
  margin: 18px auto 0;
  max-width: 58ch;
  color: var(--myst-ink-muted);
  font-size: 15.5px;
  line-height: 1.7;
}

/* Rank sections */
.rank-section {
  margin-bottom: 56px;
}

.rank-head {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.rank-head h2 {
  margin: 0;
  font-family: var(--myst-font-display);
  font-size: 24px;
  font-weight: 700;
  color: var(--myst-offwhite);
}

.rank-rule {
  height: 1px;
  flex: 1;
  background: linear-gradient(90deg, var(--myst-line-40), transparent);
}

.rank-count {
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
  white-space: nowrap;
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 16px;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
  padding: 20px 24px;
  background: var(--myst-panel);
  border: 1px solid var(--myst-line-16);
  transition: border-color 0.25s ease, transform 0.25s ease;
}

.member-card:hover {
  border-color: var(--myst-line-40);
  transform: translateY(-3px);
}

.member-card.crown {
  background: var(--myst-panel-warm);
  border-color: var(--myst-line-35);
}

.member-avatar {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 2px;
  object-fit: cover;
  background: linear-gradient(135deg, #2a3050, #171a2c);
}

.member-card.crown .member-avatar {
  border: 1px solid var(--myst-line-35);
}

.member-initial {
  display: grid;
  place-items: center;
  color: var(--myst-gold);
  font-family: var(--myst-font-display);
  font-size: 20px;
  font-weight: 700;
}

.member-copy {
  min-width: 0;
}

.member-copy h3 {
  margin: 0 0 5px;
  overflow-wrap: anywhere;
  color: var(--myst-offwhite);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
}

.member-copy p {
  margin: 0;
  font-family: var(--myst-font-mono);
  font-size: 9px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
}

.member-card.crown .member-copy p {
  color: var(--myst-gold);
}

/* Bottom CTA */
.order-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 70px;
  padding: 26px 32px;
  background: rgba(200, 178, 115, 0.03);
  border: 1px solid var(--myst-line-18);
}

.order-cta p {
  margin: 0;
  color: var(--myst-ink-muted);
  font-size: 14px;
}

.order-cta .myst-btn-gold {
  padding: 12px 26px;
  font-size: 11px;
}

/* States */
.order-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px 0;
  color: var(--myst-ink-muted);
  font-family: var(--myst-font-mono);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.order-spinner {
  width: 30px;
  height: 30px;
  border: 2px solid var(--myst-line-20);
  border-top-color: var(--myst-gold);
  border-radius: 50%;
  animation: orderSpin 0.9s linear infinite;
}

@keyframes orderSpin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .order {
    padding: 50px 20px 70px;
  }

  .order-head {
    margin-bottom: 44px;
  }

  .member-grid {
    grid-template-columns: 1fr;
  }
}
</style>
