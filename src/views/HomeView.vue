<template>
  <HeaderItem />
  <div class="home">
    <HeroSection />
    <VerticalFeaturesSlider />
    <PlayerStatsDashboard title="" :autoRefreshInterval="60" />
    <div class="animation-wrapper">
      <div class="light light2" ref="light2"></div>
      <div class="light light3" ref="light3"></div>
      <div class="light light4" ref="light4"></div>
      <div class="light light5" ref="light5"></div>
    </div>
  </div>
  <FooterItem />
</template>

<script setup lang="ts">
import HeroSection from "@/components/home/HeroSection.vue";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";

import { defineAsyncComponent, nextTick, onMounted, ref } from "vue";
import VerticalFeaturesSlider from "@components/home/VerticalFeaturesSlider.vue";

const PlayerStatsDashboard = defineAsyncComponent(
  () => import("@/components/home/PlayerStatsDashboard.vue"),
);

const light2 = ref<HTMLElement | null>(null);
const light3 = ref<HTMLElement | null>(null);
const light4 = ref<HTMLElement | null>(null);
const light5 = ref<HTMLElement | null>(null);
// const visibleSections = ref<number[]>([]);

const section0 = ref<HTMLElement | null>(null);
const section1 = ref<HTMLElement | null>(null);
const section2 = ref<HTMLElement | null>(null);
const section3 = ref<HTMLElement | null>(null);
const section4 = ref<HTMLElement | null>(null);
const section5 = ref<HTMLElement | null>(null);

const lightRefs = [light2, light3, light4, light5];
const sectionRefs = [
  section0,
  section1,
  section2,
  section3,
  section4,
  section5,
];

onMounted(() => {
  nextTick(() => {
    const options = {
      threshold: 0.15,
      rootMargin: "0px 0px -5% 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("element-show");
          observer.unobserve(entry.target);
        }
      });
    }, options);

    lightRefs.forEach((lightRef) => {
      if (lightRef.value) {
        observer.observe(lightRef.value);
        lightRef.value.classList.add("element-animation");
      }
    });
  });
});
</script>

<script lang="ts">
export default {
  name: "HomeView",
};
</script>

<style scoped>
@font-face {
  font-family: "MontserratBold";
  src: url("@/assets/fonts/Montserrat-Bold.ttf");
}

@font-face {
  font-family: "Minecraft";
  src: url("@/assets/fonts/Monocraft.ttf");
}

.home {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vw, 1.5rem);
  padding: clamp(0.5rem, 1vw, 0.75rem);
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  min-height: 100vh;
  position: relative;
}

.home-section {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
  transition:
    opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  backface-visibility: hidden;
}

.home-section.section-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.player-stats-section {
  width: 100%;
  max-width: min(1320px, 95vw);
  margin: 0 auto 2rem auto;
  padding: clamp(2rem, 4vw, 3rem) clamp(1rem, 2vw, 2rem);
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 24px;
  border: 1px solid rgba(108, 93, 211, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transform: translateZ(0);
}

.community-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin-bottom: clamp(25px, 4vw, 50px);
  text-align: center;
  word-wrap: break-word;
  hyphens: auto;
  background: linear-gradient(135deg, #6c5dd3 0%, #8b7eff 50%, #ee7828 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: "MontserratBold", sans-serif;
  font-weight: 700;
  text-shadow: 0 4px 12px rgba(108, 93, 211, 0.3);
}

.app {
  width: 100%;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(73, 29, 153, 0.3) transparent;
}

.app::-webkit-scrollbar {
  height: 6px;
}

.app::-webkit-scrollbar-track {
  background: transparent;
}

.app::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #6c5dd3, #8b7eff);
  border-radius: 3px;
}

.light {
  width: clamp(200px, 30vw, 500px);
  height: clamp(200px, 30vw, 500px);
  background: radial-gradient(circle, #6c5dd3 0%, #8b7eff 100%);
  border-radius: 50%;
  filter: blur(clamp(80px, 15vw, 200px));
  z-index: -2;
  opacity: 0.4;
  animation: pulse-glow 6s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

.animation-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
}

.light2 {
  position: absolute;
  top: 20vh;
  right: -10%;
  transform: translate(50%, -50%);
}

.light3 {
  position: absolute;
  top: 50vh;
  left: -10%;
  transform: translate(-50%, -50%);
}

.light4 {
  position: absolute;
  top: 60vh;
  right: -10%;
  transform: translate(50%, -50%);
}

.light5 {
  position: absolute;
  top: 70vh;
  left: -10%;
  transform: translate(-50%, -50%);
}

.element-animation {
  opacity: 0;
  transition: opacity 0.6s ease-out;
  will-change: opacity;
}

.element-show {
  opacity: 1;
  will-change: auto;
}

@container (max-width: 1200px) {
  .spilnota {
    font-size: clamp(1.8rem, 4.5vw, 2.8rem);
  }

  .light {
    opacity: 0.5;
  }
}

@media (max-width: 1024px) {
  .home {
    gap: clamp(1.25rem, 2.5vw, 1.75rem);
    padding: clamp(0.75rem, 1.5vw, 1rem);
  }

  .player-stats-section {
    padding: clamp(1.5rem, 3vw, 2.5rem) clamp(1rem, 2vw, 1.5rem);
    margin-bottom: clamp(60px, 6vw, 80px);
  }

  .light {
    width: clamp(180px, 28vw, 400px);
    height: clamp(180px, 28vw, 400px);
    filter: blur(clamp(70px, 14vw, 150px));
  }
}

@media (max-width: 768px) {
  .home {
    gap: clamp(1rem, 2vw, 1.5rem);
    padding: clamp(0.5rem, 1.5vw, 0.75rem);
  }

  .player-stats-section {
    padding: clamp(1.5rem, 3vw, 2rem) clamp(0.75rem, 1.5vw, 1rem);
    margin-bottom: clamp(50px, 6vw, 70px);
    border-radius: clamp(16px, 2vw, 24px);
  }

  .community-title {
    font-size: clamp(1.5rem, 4vw, 2.2rem);
    margin-bottom: clamp(25px, 3vw, 35px);
  }

  .light {
    width: clamp(150px, 25vw, 300px);
    height: clamp(150px, 25vw, 300px);
    filter: blur(clamp(60px, 12vw, 120px));
    opacity: 0.3;
  }
}

@media (max-width: 480px) {
  .animation-wrapper {
    display: none;
  }

  .home {
    gap: clamp(0.75rem, 2vw, 1.25rem);
    padding: clamp(0.5rem, 1vw, 0.75rem);
  }

  .player-stats-section {
    padding: clamp(1rem, 3vw, 1.5rem) clamp(0.5rem, 1.5vw, 0.75rem);
    margin-bottom: clamp(40px, 5vw, 60px);
    border-radius: clamp(12px, 2vw, 20px);
  }

  .community-title {
    font-size: clamp(1.25rem, 5vw, 1.8rem);
    margin-bottom: clamp(20px, 3vw, 30px);
    line-height: 1.3;
  }
}

@media (max-width: 360px) {
  .home {
    gap: 0.75rem;
    padding: 0.5rem 0.25rem;
  }

  .player-stats-section {
    padding: 1rem 0.5rem;
    margin-bottom: 30px;
  }

  .community-title {
    font-size: 1.2rem;
    margin-bottom: 15px;
    line-height: 1.2;
  }
}
</style>
