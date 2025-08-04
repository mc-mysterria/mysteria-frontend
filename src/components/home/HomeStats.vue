<template>
  <div class="hrContainer">
    <div class="line"></div>
    <div class="content">
      <IconPeople />
      <div class="text">
        <div class="hrTitle">30+</div>
        <p v-html="t('stableOnline')"></p>
      </div>
    </div>
    <div class="line"></div>
    <div class="content">
      <IconStars />
      <div class="text">
        <div class="hrTitle">100%</div>
        <p v-html="t('uniqueContent')"></p>
      </div>
    </div>
    <div class="line"></div>
    <div class="content">
      <IconClock />
      <div class="text">
        <div class="hrTitle">3+</div>
        <p v-html="t('serverAge')"></p>
      </div>
    </div>
    <div class="line"></div>
  </div>
</template>

<script setup lang="ts">
import IconPeople from "@/assets/icons/IconPeople.vue";
import IconStars from "@/assets/icons/IconStars.vue";
import IconClock from "@/assets/icons/IconClock.vue";
import { useI18n } from "@/composables/useI18n";

const { t } = useI18n();
</script>

<style scoped>
.hrContainer {
  position: relative;
  margin-bottom: 200px;
  padding: 2rem 0;
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  width: 100%;
}

.line {
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #ee7828 50%,
    transparent 100%
  );
  flex: 1;
  margin-top: 28px;
  border-radius: 1px;
  opacity: 0.8;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.content:hover {
  transform: translateY(-2px);
}

.hrContainer :deep(svg) {
  width: 48px;
  height: 48px;
  margin-bottom: 20px;
  color: #8b7eff;
  transition: all 0.3s ease;
}

.content:hover :deep(svg) {
  color: #ee7828;
  transform: scale(1.1);
  filter: drop-shadow(0 4px 12px rgba(238, 120, 40, 0.3));
}

.text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hrContainer p {
  font-size: clamp(1rem, 2vw, 1.25rem);
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  line-height: 1.4;
}

.hrTitle {
  font-family: "MontserratBold", system-ui, sans-serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  margin-bottom: 10px;
  color: #ee7828;
  font-weight: 700;
}

@media (max-width: 576px) {
  .line {
    display: none;
  }
  .hrTitle {
    font-size: 32px;
  }
  .hrContainer {
    padding: 0;
    display: block;
  }
  .content {
    margin: 20px 0;
  }
  .hrContainer img {
    width: 64px;
    height: 64px;
  }
}
</style>
