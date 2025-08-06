<template>
  <div class="team" role="region" aria-label="Team Members">
    <h1>Команда проекту:</h1>
    <h2 class="role-title">{{ currentGroup?.label || "" }}</h2>

    <div class="cards-wrapper">
      <Transition name="group-transition" mode="out-in">
        <div
          :key="currentSlide"
          class="card-container"
          :class="`group-size-${currentGroup?.members.length || 0}`"
        >
          <div
            v-for="(member, index) in currentGroup?.members || []"
            :key="member.name"
            class="cardTeam"
            :class="{
              'theroer-card': member.name === 'THEROER',
              'ikeepca1m-card': member.name === 'ikeepca1m',
            }"
            :style="{ '--animation-delay': `${index * 0.1}s` }"
          >
            <div class="gradient">
              <h3>{{ member.name }}</h3>
              <img
                :src="member.avatar"
                alt="Team member skin"
                @load="handleImageLoad(member.name)"
                :class="{ loaded: loadedImages.has(member.name) }"
              />
            </div>
            <div v-if="member.name === 'THEROER'" class="particles">
              <div
                v-for="particle in particles"
                :key="particle.id"
                class="particle"
                :style="{
                  left: `${particle.left}%`,
                  animationDelay: `${particle.delay}s`,
                }"
              ></div>
            </div>
            <div v-if="member.name === 'ikeepca1m'" class="particles">
              <div
                v-for="particle in redParticles"
                :key="particle.id"
                class="red-particle"
                :style="{
                  left: `${particle.left}%`,
                  animationDelay: `${particle.delay}s`,
                }"
              ></div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <button
      title="previous group"
      @click="prevGroup"
      class="nav-btn nav-btn-left"
      :disabled="currentSlide === 0"
      aria-label="Previous group"
    >
      <svg
        width="20"
        height="18"
        viewBox="0 0 20 18"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.54074 7.42969L2.85811 8.24961H3.925H18.75C18.9489 8.24961 19.1397 8.32863 19.2803 8.46928C19.421 8.60993 19.5 8.8007 19.5 8.99961C19.5 9.19853 19.421 9.38929 19.2803 9.52994C19.1397 9.67059 18.9489 9.74961 18.75 9.74961H3.925H2.85811L3.54074 10.5695L8.07825 16.0195L8.07838 16.0197C8.14153 16.0955 8.18911 16.183 8.21839 16.2772C8.24768 16.3714 8.25809 16.4704 8.24903 16.5687C8.23998 16.6669 8.21163 16.7624 8.16562 16.8496C8.11962 16.9369 8.05687 17.0142 7.98098 17.0771C7.84604 17.1889 7.67622 17.25 7.50098 17.2496L7.49919 17.2496C7.389 17.2498 7.28013 17.2257 7.18033 17.179C7.08051 17.1324 6.9922 17.0643 6.92169 16.9796L6.92161 16.9795L0.685863 9.49662C0.662081 9.46153 0.640579 9.42494 0.621494 9.38707L0.565982 9.27693L0.553311 9.26788L0.552485 9.26579C0.518958 9.18098 0.501184 9.09078 0.500024 8.99961C0.500768 8.94118 0.508336 8.88314 0.522503 8.82667C0.559716 8.78325 0.594847 8.73116 0.622141 8.66877C0.641807 8.62382 0.654255 8.57932 0.662106 8.53939C0.669751 8.52695 0.677672 8.51469 0.685863 8.5026L6.92161 1.0197L6.92202 1.01921C7.04943 0.865923 7.23251 0.769525 7.431 0.751225C7.62948 0.732925 7.82711 0.794222 7.9804 0.921632C8.13369 1.04904 8.23009 1.23213 8.24839 1.43061C8.26667 1.62896 8.20548 1.82645 8.07825 1.97969C8.07816 1.9798 8.07807 1.97991 8.07798 1.98001L3.54074 7.42969ZM0.465619 9.20525C0.463445 9.20369 0.463785 9.20378 0.466046 9.20555L0.465619 9.20525Z"
          fill="#F0F1F5"
          stroke="#F0F1F5"
        />
      </svg>
    </button>

    <button
      title="next group"
      @click="nextGroup"
      class="nav-btn nav-btn-right"
      :disabled="currentSlide === totalSlides - 1"
    >
      <svg
        width="20"
        height="18"
        viewBox="0 0 20 18"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.25 7.74961H16.075L11.5375 2.29961C11.3253 2.04434 11.2232 1.71524 11.2537 1.38471C11.2842 1.05417 11.4447 0.749285 11.7 0.537112C11.9553 0.324939 12.2844 0.222862 12.6149 0.253336C12.9454 0.283811 12.2503 0.444341 13.4625 0.699612L19.7125 8.19961C19.7545 8.25927 19.7922 8.32194 19.825 8.38711C19.825 8.44961 19.825 8.48711 19.9125 8.54961C19.9692 8.69294 19.9988 8.8455 20 8.99961C19.9988 9.15372 19.9692 9.30629 19.9125 9.44961C19.9125 9.51211 19.9125 9.54961 19.825 9.61211C19.7922 9.67729 19.7545 9.73996 19.7125 9.79961L13.4625 17.2996C13.345 17.4407 13.1978 17.5542 13.0314 17.632C12.8651 17.7097 12.6836 17.7499 12.5 17.7496C12.2079 17.7502 11.9249 17.6485 11.7 17.4621C11.5734 17.3572 11.4688 17.2283 11.3921 17.0829C11.3154 16.9374 11.2682 16.7783 11.2531 16.6146C11.238 16.4509 11.2553 16.2858 11.3041 16.1288C11.3529 15.9718 11.4322 15.8259 11.5375 15.6996L16.075 10.2496H1.25C0.91848 10.2496 0.600536 10.1179 0.366116 9.8835C0.131695 9.64907 0 9.33113 0 8.99961C0 8.66809 0.131695 8.35015 0.366116 8.11573C0.600536 7.88131 0.91848 7.74961 1.25 7.74961Z"
          fill="#F0F1F5"
        />
      </svg>
    </button>

    <div class="points">
      <div
        v-for="(group, index) in groupedTeamMembers"
        :key="group.role"
        @click="goToSlide(index)"
        class="point"
        :class="{ 'point-active': currentSlide === index }"
        :title="group.label"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import ikeepca1m from "@/assets/images/team/ikeepca1m.png";
import THEROER from "@/assets/images/team/THEROER.png";
import AchekcSs_ from "@/assets/images/team/AchekcSs_.png";
import animetop10 from "@/assets/images/team/animetop10.png";
import TheVan1sh from "@/assets/images/team/TheVan1sh.png";
import TheTo4ka from "@/assets/images/team/TheTo4ka.png";
import bib1ghoul from "@/assets/images/team/bib1ghoul.png";
import kwaidix from "@/assets/images/team/kwaidix.png";
import Ari from "@/assets/images/team/Ari.png";
import Shadow from "@/assets/images/team/Shadow.png";
import FyZzZen from "@/assets/images/team/fyzzzen.png";
import Foli from "@/assets/images/team/foli.png";
import Kodi from "@/assets/images/team/kodi.png";

const teamMembers = ref([
  { name: "ikeepca1m", avatar: ikeepca1m, role: "dev" },
  { name: "THEROER", avatar: THEROER, role: "dev" },

  { name: "AchekcSs_", avatar: AchekcSs_, role: "mod" },
  { name: "kwaidix", avatar: kwaidix, role: "mod" },

  { name: "Foli", avatar: Foli, role: "judge" },
  { name: "Kodi_YTf", avatar: Kodi, role: "judge" },

  { name: "animetop10", avatar: animetop10, role: "mi9" },
  { name: "TheVan1sh", avatar: TheVan1sh, role: "mi9" },
  { name: "TheTo4ka", avatar: TheTo4ka, role: "mi9" },
  { name: "bib1ghoul", avatar: bib1ghoul, role: "mi9" },

  { name: "Ari23_", avatar: Ari, role: "youtuber" },
  { name: "9I_DuHo3aBp", avatar: Shadow, role: "youtuber" },
  { name: "FyZzZen", avatar: FyZzZen, role: "youtuber" },
]);

const roleLabels = {
  dev: "Розробники",
  mod: "Модератори",
  mi9: "Офіцери",
  judge: "Судді",
  youtuber: "Ютубери",
};

const groupedTeamMembers = computed(() => {
  const grouped = teamMembers.value.reduce(
    (acc, member) => {
      if (!acc[member.role]) {
        acc[member.role] = [];
      }
      acc[member.role].push(member);
      return acc;
    },
    {} as Record<string, typeof teamMembers.value>,
  );

  const orderedRoles = ["dev", "mod", "mi9", "judge", "youtuber"];
  return orderedRoles
    .map((role) => ({
      role,
      label: roleLabels[role as keyof typeof roleLabels],
      members: grouped[role] || [],
    }))
    .filter((group) => group.members.length > 0);
});

const currentSlide = ref(0);
const isTransitioning = ref(false);
const particles = ref<Array<{ id: number; left: number; delay: number }>>([]);
const redParticles = ref<Array<{ id: number; left: number; delay: number }>>(
  [],
);
const loadedImages = ref(new Set());

const totalSlides = computed(() => groupedTeamMembers.value.length);

const currentGroup = computed(() => {
  return groupedTeamMembers.value[currentSlide.value] || null;
});

const handleImageLoad = (memberName: string) => {
  loadedImages.value.add(memberName);
};

const nextGroup = () => {
  if (currentSlide.value < totalSlides.value - 1 && !isTransitioning.value) {
    isTransitioning.value = true;
    currentSlide.value++;
    setTimeout(() => {
      isTransitioning.value = false;
    }, 600);
  }
};

const prevGroup = () => {
  if (currentSlide.value > 0 && !isTransitioning.value) {
    isTransitioning.value = true;
    currentSlide.value--;
    setTimeout(() => {
      isTransitioning.value = false;
    }, 600);
  }
};

const goToSlide = (index: number) => {
  if (index !== currentSlide.value && !isTransitioning.value) {
    isTransitioning.value = true;
    currentSlide.value = index;
    setTimeout(() => {
      isTransitioning.value = false;
    }, 600);
  }
};

const spawnParticle = () => {
  const left = Math.random() * 100;
  const delay = Math.random() * 2;
  const id = Date.now() + Math.random();

  particles.value.push({ id, left, delay });

  setTimeout(() => {
    particles.value = particles.value.filter((p) => p.id !== id);
  }, 2000);
};

const spawnRedParticle = () => {
  const left = Math.random() * 100;
  const delay = Math.random() * 2;
  const id = Date.now() + Math.random();

  redParticles.value.push({ id, left, delay });

  setTimeout(() => {
    redParticles.value = redParticles.value.filter((p) => p.id !== id);
  }, 2000);
};

onMounted(() => {
  setInterval(spawnParticle, 50);
  setInterval(spawnRedParticle, 60);
});
</script>

<style scoped>
@font-face {
  font-family: "Minecraft";
  src: url("@/assets/fonts/Monocraft.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "MontserratBold";
  src: url("@/assets/fonts/Montserrat-Bold.ttf");
}

.cards-wrapper {
  position: relative;
  width: 100%;
  min-height: 500px;
  margin-bottom: 80px;
  overflow: hidden;
}

.group-transition-enter-active,
.group-transition-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.group-transition-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.95);
}

.group-transition-leave-to {
  opacity: 0;
  transform: translateX(-50px) scale(0.95);
}

.group-transition-enter-to,
.group-transition-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.team {
  position: relative;
  width: 100%;
  max-width: 1500px;
  margin: 0 auto 0 auto;
  padding: 40px 20px 10px 20px;
  box-sizing: border-box;
}

.team h1 {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  margin-bottom: 3rem;
  text-align: center;
  font-family: "MontserratBold", sans-serif;
  background: linear-gradient(135deg, #10b981 0%, #22c55e 50%, #a0dc8e 100%);
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  text-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  font-weight: 700;
}

.role-title {
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  margin: 40px 0 20px 0;
  text-align: center;
  font-family: "MontserratBold", sans-serif;
  background: linear-gradient(135deg, #22c55e 0%, #10b981 50%, #a0dc8e 100%);
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  text-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
  font-weight: 600;
  position: relative;
}

.card-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 27px;
  padding: 20px;
  width: 100%;
  min-height: 500px;
  max-width: 1600px;
  margin: 0 auto;
  box-sizing: border-box;
}

.group-size-1 .card-container {
  justify-content: center;
  max-width: 350px;
}

.group-size-2 .card-container {
  flex-wrap: nowrap;
  justify-content: space-evenly;
  max-width: 700px;
  gap: 40px;
}

.group-size-3 .card-container {
  flex-wrap: nowrap;
  justify-content: space-evenly;
  max-width: 1000px;
  gap: 30px;
}

.group-size-4 .card-container,
.group-size-5 .card-container,
.group-size-6 .card-container {
  justify-content: center;
  flex-wrap: wrap;
  max-width: 1200px;
  gap: 27px;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(26, 29, 35, 0.9);
  color: #ffffff;
  border-radius: 50%;
  padding: 16px;
  margin: 0 20px;
  z-index: 100;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn-left {
  left: 10px;
}

.nav-btn-right {
  right: 10px;
}

.nav-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #10b981, #22c55e);
  border-color: rgba(16, 185, 129, 0.5);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.4);
}

.nav-btn:focus {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.points {
  position: absolute;
  left: 50%;
  bottom: 25px;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.point {
  border-radius: 9999px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 12px;
  height: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(5px);
}

.point-active {
  background: linear-gradient(135deg, #10b981, #22c55e);
  border-color: rgba(16, 185, 129, 0.5);
  width: 36px;
  height: 12px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.cardTeam {
  height: 450px;
  background: linear-gradient(
    135deg,
    rgba(26, 29, 35, 0.95) 0%,
    rgba(35, 38, 44, 0.9) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(108, 93, 211, 0.1);
  position: relative;
  font-family: "Minecraft", monospace;
  overflow: hidden;
  width: 280px;
  min-width: 280px;
  max-width: 280px;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
  animation: cardFadeIn 0.6s ease-out forwards;
  cursor: pointer;
}

@keyframes cardFadeIn {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.cardTeam:hover {
  transform: translateY(-15px) scale(1.08);
  box-shadow:
    0 40px 80px rgba(0, 0, 0, 0.6),
    0 0 0 2px rgba(108, 93, 211, 0.5),
    0 0 30px rgba(108, 93, 211, 0.3);
  border-color: rgba(108, 93, 211, 0.6);
  z-index: 50;
  transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.cardTeam:active {
  transform: translateY(-8px) scale(1.02);
  transition: all 0.1s ease;
}

.gradient {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(108, 93, 211, 0.1) 0%,
    rgba(0, 0, 0, 0.7) 60%,
    rgba(0, 0, 0, 0.9) 100%
  );
  border-radius: 20px;
  position: relative;
  z-index: 5;
}

.cardTeam h3 {
  font-size: clamp(1.5rem, 3vw, 2rem);
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffffff;
  text-shadow:
    0 4px 12px rgba(0, 0, 0, 0.7),
    0 2px 4px rgba(108, 93, 211, 0.3);
  font-weight: 600;
  letter-spacing: 0.05em;
  z-index: 10;
}

.cardTeam img {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 0);
  border-radius: 0 0 7px 7px;
  width: 100%;
  height: 70%;
  object-fit: cover;
  object-position: center top;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cardTeam img.loaded {
  opacity: 1;
}

@media (max-width: 768px) {
  .team {
    width: 100%;
    max-width: 500px;
    padding: 0 1rem 80px 1rem;
    margin: 0 auto clamp(80px, 8vw, 150px) auto;
  }

  .team h1 {
    font-size: clamp(2rem, 5vw, 2.5rem);
    margin-bottom: clamp(30px, 4vw, 50px);
    text-align: center;
  }

  @media (max-width: 768px) {
    .team {
      width: 100%;
      max-width: 500px;
      padding: 0 1rem 80px 1rem;
      margin: 0 auto clamp(80px, 8vw, 150px) auto;
    }

    .team h1 {
      font-size: clamp(2rem, 5vw, 2.5rem);
      margin-bottom: clamp(30px, 4vw, 50px);
      text-align: center;
    }

    .cards-wrapper {
      margin-bottom: 60px;
    }

    .card-container {
      gap: 15px;
      padding: 10px;
    }

    .group-size-2 .card-container,
    .group-size-3 .card-container {
      flex-wrap: wrap;
      justify-content: center;
    }

    .nav-btn {
      width: 48px;
      height: 48px;
      padding: 12px;
    }

    .nav-btn-left {
      left: 5px;
    }

    .nav-btn-right {
      right: 5px;
    }
  }

  @media (max-width: 480px) {
    .team {
      width: 100%;
      max-width: 100%;
      padding: 0 0.75rem 60px 0.75rem;
      margin: 0 auto clamp(60px, 6vw, 100px) auto;
    }

    .team h1 {
      font-size: clamp(1.75rem, 6vw, 2.25rem);
      margin-bottom: clamp(20px, 3vw, 30px);
    }

    .cardTeam {
      width: 260px;
      min-width: 260px;
      max-width: 260px;
    }

    .cardTeam h3 {
      font-size: clamp(1.25rem, 4vw, 1.75rem);
      top: 15%;
    }

    .card-container {
      gap: 15px;
      padding: 10px;
    }

    .points {
      bottom: clamp(30px, 4vw, 40px);
    }

    .nav-btn {
      width: clamp(36px, 5vw, 48px);
      height: clamp(36px, 5vw, 48px);
      padding: clamp(8px, 1.5vw, 12px);
    }

    .point {
      width: clamp(8px, 1.5vw, 12px);
      height: clamp(8px, 1.5vw, 12px);
    }

    .point-active {
      width: clamp(24px, 4vw, 36px);
      height: clamp(8px, 1.5vw, 12px);
    }
  }

  .card-container {
    /* Center first card by padding on mobile */
    padding-left: 0;
    padding-right: 0;
    transition: padding 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@media (max-width: 480px) {
  .team {
    width: 100%;
    max-width: 100%;
    padding: 0 0.75rem 60px 0.75rem;
    margin: 0 auto clamp(60px, 6vw, 100px) auto;
  }

  .team h1 {
    font-size: clamp(1.75rem, 6vw, 2.25rem);
    margin-bottom: clamp(20px, 3vw, 30px);
  }

  .cardTeam h3 {
    font-size: clamp(1.25rem, 4vw, 1.75rem);
    top: 15%;
  }

  .card-container {
    gap: 15px;
    padding: 10px;
  }

  .points {
    bottom: clamp(30px, 4vw, 40px);
  }

  .nav-btn {
    bottom: clamp(-25px, -3vw, -15px);
    width: clamp(36px, 5vw, 48px);
    height: clamp(36px, 5vw, 48px);
    padding: clamp(8px, 1.5vw, 12px);
  }

  .point {
    width: clamp(8px, 1.5vw, 12px);
    height: clamp(8px, 1.5vw, 12px);
  }

  .point-active {
    width: clamp(24px, 4vw, 36px);
    height: clamp(8px, 1.5vw, 12px);
  }
}

.theroer-card {
  background: linear-gradient(
    135deg,
    rgba(238, 120, 40, 0.1) 0%,
    rgba(26, 29, 35, 0.95) 30%,
    rgba(35, 38, 44, 0.9) 100%
  );
  border: 1px solid rgba(238, 120, 40, 0.3);
  position: relative;
  overflow: hidden;
}

.theroer-card::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to top,
    rgba(238, 120, 40, 0.2) 0%,
    rgba(0, 0, 0, 0.7) 50%,
    rgba(0, 0, 0, 0.4) 100%
  );
  z-index: 1;
}

.theroer-card::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    linear-gradient(
      135deg,
      rgba(16, 185, 129, 0.08) 0%,
      transparent 40%
    ),
    linear-gradient(
      45deg,
      rgba(34, 197, 94, 0.06) 0%,
      transparent 30%
    ),
    linear-gradient(
      -45deg,
      rgba(16, 185, 129, 0.05) 20%,
      transparent 60%
    ),
    repeating-linear-gradient(
      90deg,
      transparent 0%,
      rgba(34, 197, 94, 0.03) 1px,
      transparent 2px,
      transparent 20px
    ),
    linear-gradient(
      180deg,
      transparent 0%,
      rgba(16, 185, 129, 0.04) 100%
    );
  z-index: 2;
  pointer-events: none;
}

.theroer-card:hover::after {
  animation: particles 2s ease-in-out infinite;
}

@keyframes particles {
  0% {
    opacity: 0;
    transform: translateY(100px) scale(1.2);
  }
  20% {
    opacity: 0.5;
    transform: translateY(80px) scale(0.7);
  }
  40% {
    opacity: 0.7;
    transform: translateY(60px) scale(0.9);
  }
  60% {
    opacity: 0.8;
    transform: translateY(40px) scale(1);
  }
  80% {
    opacity: 0.4;
    transform: translateY(-80px) translateX(-1px) scale(1.4);
  }
  90% {
    opacity: 0.2;
    transform: translateY(-90px) translateX(1px) scale(1.5);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) translateX(0) scale(1.6);
  }
}

.theroer-card .particles {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}

.theroer-card .particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(238, 120, 40, 0.8);
  border-radius: 50%;
  animation: minecraft-fire 3s ease-out infinite;
  bottom: 0;
  opacity: 0;
  z-index: 10;
  box-shadow: 0 0 6px rgba(238, 120, 40, 0.5);
}

.theroer-card .particle:nth-child(3n + 1) {
  background: rgba(238, 120, 40, 0.8);
}

.theroer-card .particle:nth-child(3n + 2) {
  background: rgba(108, 93, 211, 0.8);
}

.theroer-card .particle:nth-child(3n + 3) {
  background: rgba(139, 126, 255, 0.8);
}

@keyframes minecraft-fire {
  0% {
    opacity: 0;
    transform: translateY(0) translateX(0) scale(0.5);
  }
  10% {
    opacity: 0.8;
    transform: translateY(-10px) translateX(1px) scale(0.7);
  }
  20% {
    opacity: 0.9;
    transform: translateY(-20px) translateX(-1px) scale(0.8);
  }
  30% {
    opacity: 1;
    transform: translateY(-30px) translateX(1px) scale(0.9);
  }
  40% {
    opacity: 0.9;
    transform: translateY(-40px) translateX(-1px) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-50px) translateX(1px) scale(1.1);
  }
  60% {
    opacity: 0.7;
    transform: translateY(-60px) translateX(-1px) scale(1.2);
  }
  70% {
    opacity: 0.6;
    transform: translateY(-70px) translateX(1px) scale(1.3);
  }
  80% {
    opacity: 0.4;
    transform: translateY(-80px) translateX(-1px) scale(1.4);
  }
  90% {
    opacity: 0.2;
    transform: translateY(-90px) translateX(1px) scale(1.5);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) translateX(0) scale(1.6);
  }
  80% {
    opacity: 0.4;
    transform: translateY(-80px) translateX(-1px) scale(1.4);
  }
  90% {
    opacity: 0.2;
    transform: translateY(-90px) translateX(1px) scale(1.5);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) translateX(0) scale(1.6);
  }
}

.ikeepca1m-card {
  background: linear-gradient(
    135deg,
    rgba(220, 38, 38, 0.1) 0%,
    rgba(26, 29, 35, 0.95) 30%,
    rgba(35, 38, 44, 0.9) 100%
  );
  border: 1px solid rgba(220, 38, 38, 0.3);
  position: relative;
  overflow: hidden;
}

.ikeepca1m-card::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to top,
    rgba(220, 38, 38, 0.2) 0%,
    rgba(0, 0, 0, 0.7) 50%,
    rgba(0, 0, 0, 0.4) 100%
  );
  z-index: 1;
}

.ikeepca1m-card::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    linear-gradient(
      225deg,
      rgba(16, 185, 129, 0.07) 0%,
      transparent 35%
    ),
    linear-gradient(
      -135deg,
      rgba(34, 197, 94, 0.05) 0%,
      transparent 25%
    ),
    linear-gradient(
      315deg,
      rgba(16, 185, 129, 0.04) 30%,
      transparent 70%
    ),
    repeating-linear-gradient(
      45deg,
      transparent 0%,
      rgba(34, 197, 94, 0.02) 1px,
      transparent 3px,
      transparent 25px
    ),
    linear-gradient(
      270deg,
      transparent 0%,
      rgba(16, 185, 129, 0.03) 100%
    );
  z-index: 2;
  pointer-events: none;
}

.ikeepca1m-card:hover::after {
  animation: red-particles 2s ease-in-out infinite;
}

@keyframes red-particles {
  0% {
    opacity: 0;
    transform: translateY(100px) scale(1.2);
  }
  20% {
    opacity: 0.5;
    transform: translateY(80px) scale(0.7);
  }
  40% {
    opacity: 0.7;
    transform: translateY(60px) scale(0.9);
  }
  60% {
    opacity: 0.8;
    transform: translateY(40px) scale(1);
  }
  80% {
    opacity: 0.4;
    transform: translateY(-80px) translateX(-1px) scale(1.4);
  }
  90% {
    opacity: 0.2;
    transform: translateY(-90px) translateX(1px) scale(1.5);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) translateX(0) scale(1.6);
  }
}

.ikeepca1m-card .particles {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}

.ikeepca1m-card .red-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: rgba(220, 38, 38, 0.9);
  border-radius: 0;
  animation: red-x-particle 3s ease-out infinite;
  bottom: 0;
  opacity: 0;
  z-index: 10;
  box-shadow: 0 0 8px rgba(220, 38, 38, 0.6);
}

.ikeepca1m-card .red-particle::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 2px;
  background: rgba(220, 38, 38, 0.9);
  transform: translate(-50%, -50%) rotate(45deg);
}

.ikeepca1m-card .red-particle::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 2px;
  background: rgba(220, 38, 38, 0.9);
  transform: translate(-50%, -50%) rotate(-45deg);
}

@keyframes red-x-particle {
  0% {
    opacity: 0;
    transform: translateY(0) translateX(0) scale(0.5) rotate(0deg);
  }
  10% {
    opacity: 0.8;
    transform: translateY(-10px) translateX(1px) scale(0.7) rotate(45deg);
  }
  20% {
    opacity: 0.9;
    transform: translateY(-20px) translateX(-1px) scale(0.8) rotate(90deg);
  }
  30% {
    opacity: 1;
    transform: translateY(-30px) translateX(1px) scale(0.9) rotate(135deg);
  }
  40% {
    opacity: 0.9;
    transform: translateY(-40px) translateX(-1px) scale(1) rotate(180deg);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-50px) translateX(1px) scale(1.1) rotate(225deg);
  }
  60% {
    opacity: 0.7;
    transform: translateY(-60px) translateX(-1px) scale(1.2) rotate(270deg);
  }
  70% {
    opacity: 0.6;
    transform: translateY(-70px) translateX(1px) scale(1.3) rotate(315deg);
  }
  80% {
    opacity: 0.4;
    transform: translateY(-80px) translateX(-1px) scale(1.4) rotate(360deg);
  }
  90% {
    opacity: 0.2;
    transform: translateY(-90px) translateX(1px) scale(1.5) rotate(405deg);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) translateX(0) scale(1.6) rotate(450deg);
  }
}
</style>
