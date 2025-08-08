<template>
  <div class="title">
    <div class="hero-text" :class="{ 'hero-visible': isTextVisible }">
      <h1>{{ t("serverName") }}</h1>
      <div class="subTitle">
        <p v-html="formatSubtitle(t('heroSubtitle'))"></p>
      </div>
      <div class="buttonContainer">
        <RouterLink to="/game" class="primary-button">
          <IconGamepad />
          {{ t("joinServer") }}
        </RouterLink>
        <a :href="wikiURL" rel="noopener noreferrer" class="secondary-button">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 26c-6.617 0-12-5.383-12-12S9.383 4 16 4s12 5.383 12 12-5.383 12-12 12z"
              fill="#F0F1F5"
            />
            <path
              d="M16 6c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 14c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
              fill="#F0F1F5"
            />
          </svg>
          {{ t("lorePathways") }}
        </a>
      </div>
      <p class="version">
        {{ t("versionInfo") }}
      </p>
    </div>
    <img
      class="animationPlanet hero-planet"
      :class="{ 'hero-visible': isPlanetVisible }"
      src="@/assets/images/Hero.png"
      :alt="t('serverName') + ' world'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import IconGamepad from "@/assets/icons/IconGamepad.vue";
import { useI18n } from "@/composables/useI18n";

const { t } = useI18n();
const wikiURL = import.meta.env.VITE_WIKI_URL;
const isTextVisible = ref(false);
const isPlanetVisible = ref(false);

const formatSubtitle = (text: string) => {
  return text
    .replace(/\n/g, "<br />")
    .replace(
      /Lord of Mysteries/g,
      '<span class="violetText">Lord of Mysteries</span>',
    )
    .replace(/pathways/g, '<span class="violetText">pathways</span>')
    .replace(
      /Lord of the Mysteries/g,
      '<span class="violetText">Lord of the Mysteries</span>',
    )
    .replace(/Потойбічний/g, '<span class="violetText">Потойбічний</span>')
    .replace(/Послідовність/g, '<span class="violetText">Послідовність</span>');
};

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      isTextVisible.value = true;
    }, 100);

    setTimeout(() => {
      isPlanetVisible.value = true;
    }, 400);
  });
});
</script>

<style scoped>
.title {
  max-width: 1200px;
  width: 90%;
  min-height: calc(100vh - 160px);
  margin: 0 auto 40px auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0;
}

.title img {
  width: clamp(300px, 40vw, 400px);
  height: auto;
}

.hero-text {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
  transition:
    opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
  flex: 1;
  max-width: 600px;
}

.hero-planet {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
  transition:
    opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s,
    transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
  will-change: opacity, transform;
  filter: drop-shadow(0 20px 40px rgba(108, 93, 211, 0.2));
}

.hero-text.hero-visible,
.hero-planet.hero-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.animationPlanet {
  animation-name: Planet;
  animation-duration: 5s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

h1 {
  font-size: clamp(3rem, 8vw, 5rem);
  font-family: "MontserratBold", system-ui, sans-serif;
  background: linear-gradient(135deg, #4ade80 0%, #22d3ee 50%, #a0dc8e 100%);
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  text-shadow: 0 4px 12px rgba(74, 222, 128, 0.4);
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
}

.subTitle {
  font-size: clamp(1.125rem, 2.5vw, 1.5rem);
  margin-bottom: 3rem;
  line-height: 1.6;
  color: rgba(232, 232, 232, 0.9);
}

.buttonContainer {
  font-size: 16px;
  display: flex;
  margin-bottom: 85px;
}

.buttonContainer a,
.buttonContainer .primary-button {
  width: fit-content;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: 0.2s;
  text-decoration: none;
  padding: 15px 25px;
  border-radius: 7px;
}

.buttonContainer img,
.buttonContainer svg {
  width: 32px;
  margin-right: 15px;
}

.primary-button {
  background: linear-gradient(135deg, #4ade80, #22d3ee);
  border: 2px solid transparent;
  margin-right: 25px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(139, 115, 199, 0.3);
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(139, 115, 199, 0.4);
}

.primary-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
}

.primary-button:hover::before {
  left: 100%;
}

.secondary-button {
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.secondary-button:hover {
  border-color: rgba(165, 136, 214, 0.5);
  background: rgba(165, 136, 214, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(165, 136, 214, 0.2);
}

.version {
  color: rgba(180, 187, 197, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

.ghostText {
  background: linear-gradient(135deg, #4ade80, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
}

@media (max-width: 1440px) {
  .title {
    width: 95%;
  }
}

@media (max-width: 768px) {
  .title {
    flex-direction: column;
    text-align: center;
    min-height: calc(100vh - 180px);
    padding: 1rem 0;
    gap: 2rem;
  }

  .title img {
    order: -1;
    width: clamp(250px, 50vw, 350px);
    margin: 0 auto;
  }

  .hero-text {
    max-width: 100%;
  }

  h1 {
    font-size: clamp(2.5rem, 8vw, 4rem);
    margin-bottom: 1.5rem;
  }

  .subTitle {
    font-size: clamp(1rem, 3vw, 1.25rem);
    margin-bottom: 2rem;
  }

  .buttonContainer {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .buttonContainer a,
  .buttonContainer .primary-button {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }

  .primary-button {
    margin-right: 0;
  }
}

@media (max-width: 480px) {
  .title {
    width: 100%;
    padding: 0.75rem;
    min-height: calc(100vh - 160px);
    margin-bottom: clamp(20px, 4vw, 40px);
  }

  .title img {
    width: clamp(200px, 45vw, 280px);
  }

  h1 {
    font-size: clamp(2rem, 7vw, 3rem);
    margin-bottom: 1rem;
  }

  .subTitle {
    font-size: clamp(0.9rem, 3.5vw, 1.1rem);
    margin-bottom: 1.5rem;
    padding: 0 0.5rem;
  }

  .buttonContainer {
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    padding: 0 0.5rem;
  }

  .buttonContainer a,
  .buttonContainer .primary-button {
    padding: 12px 20px;
    font-size: 0.9rem;
    max-width: 280px;
  }

  .version {
    font-size: 0.8rem;
    margin-bottom: 1rem;
    padding: 0 0.5rem;
  }
}

@keyframes Planet {
  0% {
    transform: translateY(-20px);
  }

  50% {
    transform: translateY(20px);
  }

  100% {
    transform: translateY(-20px);
  }
}
</style>
