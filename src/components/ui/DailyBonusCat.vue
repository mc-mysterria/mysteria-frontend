<template>
  <Teleport to="body">
    <Transition name="cat-fade">
      <div
          v-if="shouldShow"
          class="daily-cat-wrapper"
          :style="positionStyle"
          :title="t('dailyBonusCatTitle')"
          role="button"
          tabindex="0"
          @click="handleClick"
          @keydown.enter="handleClick"
      >
        <div class="daily-cat-glow" />
        <img
            :alt="t('dailyBonusCatAlt')"
            class="daily-cat-img"
            src="@/assets/images/daily/nicky.webp"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue';
import {useAuthStore} from '@/stores/auth';
import {useDailyBonusStore} from '@/stores/dailyBonus';
import {useNotification} from '@/services/useNotification';
import {useI18n} from '@/composables/useI18n';

const props = defineProps<{ page: string }>();

const authStore = useAuthStore();
const bonusStore = useDailyBonusStore();
const {show} = useNotification();
const {t} = useI18n();

const POSITION_PRESETS = [
  {bottom: '80px', right: '24px'},
  {bottom: '120px', left: '24px'},
  {top: '140px', right: '20px'},
  {top: '200px', left: '20px'},
  {bottom: '200px', right: '48px'},
  {bottom: '160px', left: '48px'},
];

const positionStyle = ref<Record<string, string>>({});

onMounted(() => {
  const preset = POSITION_PRESETS[Math.floor(Math.random() * POSITION_PRESETS.length)];
  positionStyle.value = {
    position: 'fixed',
    zIndex: '900',
    ...preset,
  };
});

const shouldShow = computed(() =>
    authStore.isAuthenticated &&
    bonusStore.isAvailable &&
    bonusStore.randomPage === props.page,
);

const handleClick = async () => {
  if (!authStore.isAuthenticated) return;

  const result = await bonusStore.claim();

  if (result.success) {
    show(t('dailyBonusFound'), {type: 'success', duration: 6000});
  } else if (result.alreadyClaimed) {
    show(t('dailyBonusAlreadyClaimed'), {type: 'info', duration: 4000});
  } else {
    show(t('dailyBonusLinkMinecraft'), {type: 'warn', duration: 5000});
  }
};
</script>

<style scoped>
.daily-cat-wrapper {
  cursor: pointer;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  animation: cat-bob 3s ease-in-out infinite;
  filter: drop-shadow(0 0 6px rgba(200, 178, 115, 0.0));
  transition: filter 0.3s ease, transform 0.2s ease;
}

.daily-cat-wrapper:hover {
  filter: drop-shadow(0 0 10px rgba(200, 178, 115, 0.5));
  transform: scale(1.08);
  animation-play-state: paused;
}

.daily-cat-wrapper:active {
  transform: scale(0.96);
}

.daily-cat-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  opacity: 0.75;
  transition: opacity 0.3s ease;
  border-radius: 4px;
}

.daily-cat-wrapper:hover .daily-cat-img {
  opacity: 1;
}

.daily-cat-glow {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200, 178, 115, 0.15) 0%, transparent 70%);
  animation: glow-pulse 2.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes cat-bob {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.15); }
}

.cat-fade-enter-active {
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.cat-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.cat-fade-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.85);
}

.cat-fade-leave-to {
  opacity: 0;
  transform: scale(0.7);
}
</style>
