<template>
  <HeaderItem />
  <div class="pnf-container">
    <div class="pnf-card">
      <h1>404</h1>
      <h3>{{ t("pageNotFoundTitle") }}</h3>
      <p>
        {{ t("pageNotFoundMessage") }}
      </p>
      <button @click="goBack" class="pnf-button">
        {{ t("goBack") }}
        <IconArrowRight :aria-label="t('goBack')" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import IconArrowRight from "@/assets/icons/IconArrowRight.vue";
import { useI18n } from "@/composables/useI18n";

const { t } = useI18n();

const router = useRouter();

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push("/");
  }
};
</script>

<script lang="ts">
export default {
  name: "PageNotFoundView",
};
</script>

<style scoped>
@font-face {
  font-family: "MontserratBold";
  src: url("@/assets/fonts/Montserrat-Bold.ttf");
}

@font-face {
  font-family: "MontserratRegular";
  src: url("@/assets/fonts/Montserrat-Regular.ttf");
}
@font-face {
  font-family: "MontserratSemiBold";
  src: url("@/assets/fonts/Montserrat-SemiBold.ttf");
}

.pnf-container,
.pnf-card,
.pnf-button {
  box-sizing: border-box;
}

.pnf-container {
  min-height: calc(100vh - 100px);
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow-y: auto;
}

.pnf-card {
  background-color: #171a214d;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: clamp(30px, 6vw, 50px);
  border-radius: 16px;
  width: 100%;
  max-width: 560px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

h1 {
  font-family: "MontserratBold", sans-serif;
  font-size: clamp(60px, 15vw, 90px);
  background: linear-gradient(
    160deg,
    rgba(34, 197, 94, 1) 0%,
    rgba(34, 197, 94, 1) 50%,
    rgba(16, 185, 129, 1) 100%
  );
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  margin-block-start: 0;
  margin-block-end: clamp(25px, 4vh, 35px);
  line-height: 1.1;
}

h3 {
  font-family: "MontserratSemiBold", sans-serif;
  font-size: clamp(20px, 5vw, 24px);
  color: #f3f4f6;
  margin-block-start: 0;
  margin-block-end: clamp(15px, 3vh, 20px);
  line-height: 1.4;
}

p {
  font-family: "MontserratRegular", sans-serif;
  font-size: clamp(14px, 3.5vw, 16px);
  color: #d1d5db;
  margin-block-start: 0;
  margin-block-end: clamp(35px, 6vh, 50px);
  line-height: 1.6;
}

.pnf-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: clamp(12px, 2vh, 14px) clamp(24px, 4.5vw, 32px);
  font-family: "MontserratSemiBold", sans-serif;
  font-size: clamp(14px, 3.2vw, 16px);
  border: none;
  color: #ffffff;
  background-color: #10b981;
  border-radius: 10px;
  cursor: pointer;
  transition:
    background-color 0.2s ease-in-out,
    transform 0.1s ease-in-out,
    box-shadow 0.2s ease-in-out;
  text-decoration: none;
  width: fit-content;
  margin: 0 auto;
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.3);
}

.pnf-button:hover,
.pnf-button:focus {
  background-color: #22c55e;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
  outline: none;
}

.pnf-button:active {
  transform: translateY(0px);
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.3);
}

.pnf-button img {
  margin-left: 10px;
  height: clamp(0.9em, 2vh, 1em);
  width: auto;
  filter: brightness(0) invert(1);
}

@media (max-width: 480px) {
  .pnf-card {
    padding: clamp(20px, 5vw, 30px);
    margin-left: 10px;
    margin-right: 10px;
    border-radius: 12px;
  }
  h1 {
    font-size: clamp(48px, 12vw, 70px);
  }
  h3 {
    font-size: clamp(18px, 4.5vw, 22px);
  }
  p {
    font-size: clamp(13px, 3vw, 15px);
  }
  .pnf-button {
    width: 100%;
    max-width: 280px;
    padding: clamp(11px, 2.3vh, 13px) clamp(15px, 3vw, 20px);
  }
}
</style>
