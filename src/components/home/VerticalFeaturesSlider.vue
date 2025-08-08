<template>
  <div class="features-container">
    <!-- Welcome Section -->
    <section class="welcome-section">
      <h2 class="section-title">{{ t("welcomeTitle") }}</h2>
      <blockquote class="welcome-quote">{{ t("welcomeQuote") }}</blockquote>
      <p class="main-description">{{ t("mainDescription") }}</p>
    </section>

    <!-- Features Blocks Container -->
    <div class="features-blocks">
      <!-- Gameplay Feature (Center) -->
      <div class="feature-block left-block">
        <div class="block-content">
          <div class="block-text">
            <h3 class="feature-title">{{ t("gameplayTitle") }}</h3>
            <ul class="feature-list">
              <li
                v-for="feature in tArray('gameplayFeatures')"
                :key="feature"
                class="feature-item"
              >
                {{ feature }}
              </li>
            </ul>
          </div>
          <div class="block-image">
            <div class="character-art beyonder-art">
              <img
                src="@/assets/images/Klein.jpg"
                alt="Hero Character"
                class="character-image"
              />
              <div class="mystical-aura"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Guides Feature (Right) -->
      <div class="feature-block right-block">
        <div class="block-content">
          <div class="block-text">
            <h3 class="feature-title">{{ t("guidesTitle") }}</h3>
            <ul class="feature-list">
              <li
                v-for="feature in tArray('guidesFeatures')"
                :key="feature"
                class="feature-item"
              >
                {{ feature }}
              </li>
            </ul>
          </div>
          <div class="block-image">
            <div class="character-art scholar-art">
              <img
                src="@/assets/images/Amon.png"
                alt="Amon Character"
                class="character-image"
              />
              <div class="mystical-aura scholar-glow"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- What Awaits Feature (Left) -->
      <div class="feature-block left-block">
        <div class="block-content">
          <div class="block-text">
            <h3 class="feature-title">{{ t("awaitsTitle") }}</h3>
            <ul class="feature-list">
              <li
                v-for="feature in tArray('awaitsFeatures')"
                :key="feature"
                class="feature-item"
              >
                {{ feature }}
              </li>
            </ul>
          </div>
          <div class="block-image">
            <div class="character-art sequence-art">
              <img
                src="@/assets/images/City.webp"
                alt="City View"
                class="character-image"
              />
              <div class="mystical-aura sequence-glow"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Final Message (Right) -->
      <div class="feature-block right-block final-block">
        <div class="block-content final-content">
          <div class="block-text">
            <blockquote class="final-message">
              {{ t("finalMessage") }}
            </blockquote>
          </div>
          <img
            src="@/assets/images/Happy.webp"
            alt="Happy Character"
            class="character-image"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "@/composables/useI18n";

const { t, tArray } = useI18n();
</script>

<style scoped>
.features-container {
  width: 110%;
  margin-left: -5%;
  padding: 5rem 2rem;
  background-color: #1a1a2e;
}

.welcome-section {
  text-align: center;
  margin-bottom: 7rem;
  pointer-events: auto;
}

.section-title {
  font-size: clamp(2.8rem, 6vw, 4.5rem);
  font-family: "MontserratBold", sans-serif;
  background: linear-gradient(135deg, #4ade80 0%, #22d3ee 50%, #a0dc8e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 2rem;
  text-shadow: 0 4px 20px rgba(74, 222, 128, 0.3);
}

.welcome-quote {
  font-size: clamp(1.25rem, 2.5vw, 1.7rem);
  font-style: italic;
  font-family: "Georgia", serif;
  color: #86d686;
  margin-bottom: 2.5rem;
  border-left: 3px solid #4ade80;
  padding-left: 2rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.main-description {
  font-size: clamp(1.1rem, 2vw, 1.25rem);
  line-height: 1.7;
  color: rgba(230, 230, 245, 0.85);
  max-width: 800px;
  margin: 0 auto;
}

/* Features Blocks Layout */
.features-blocks {
  display: flex;
  flex-direction: column;
  gap: 8rem;
  padding: 2rem 0;
}

.feature-block {
  display: flex;
  justify-content: center;
  width: 100%;
}

.center-block {
  justify-content: center;
}

.left-block {
  justify-content: flex-start;
  padding-left: 5%;
}

.right-block {
  justify-content: flex-end;
  padding-right: 5%;
}

.block-content {
  display: flex;
  align-items: center;
  gap: 4rem;
  padding: 3.5rem;
  background: linear-gradient(
    150deg,
    rgba(40, 30, 60, 0.2),
    rgba(255, 255, 255, 0.05)
  );
  border: 1px solid rgba(192, 164, 232, 0.15);
  border-radius: 28px;
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(192, 164, 232, 0.1);
  transform: translateZ(0);
  max-width: 1200px;
  width: 100%;
}

.left-block .block-content {
  flex-direction: row-reverse;
}

.block-text {
  flex: 1;
  min-width: 0;
}

.feature-title {
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-family: "MontserratBold", sans-serif;
  color: #86d686;
  margin-bottom: 2rem;
  line-height: 1.3;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-item {
  padding: 0.8rem 0;
  font-size: clamp(1.05rem, 1.8vw, 1.2rem);
  color: rgba(230, 230, 245, 0.9);
  position: relative;
  padding-left: 2.2rem;
  line-height: 1.6;
}

.feature-item::before {
  content: "✧";
  position: absolute;
  left: 0;
  color: #86d686;
  font-weight: bold;
  font-size: 1.3em;
  top: 50%;
  transform: translateY(-50%);
}

.block-image {
  flex: 0 0 320px;
  height: 320px;
  position: relative;
}

.character-art {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.5);
}

.final-block .character-art {
  border-radius: 12px;
}

.mystical-aura {
  position: absolute;
  width: 120%;
  height: 120%;
  top: -10%;
  left: -10%;
  border-radius: 50%;
  opacity: 0.3;
  z-index: 0;
  transform: translateZ(0);
}

.character-image {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  object-fit: cover;
  border-radius: 50%;
  z-index: 1;
  transform: translateZ(0);
}

.final-block .character-image {
  border-radius: 12px;
  position: relative;
  width: 100%;
  height: 300px;
  object-fit: cover;
  order: -1;
  margin-bottom: 2rem;
}

/* Different character themes */
.beyonder-art .mystical-aura {
  background: 
    /* Subtle directional gradient instead of radial */
    linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
    linear-gradient(-45deg, rgba(34, 197, 94, 0.08) 0%, transparent 70%);
}

.scholar-glow {
  background: 
    /* Warm accent - subtle diagonal */
    linear-gradient(135deg, rgba(228, 194, 151, 0.15) 0%, transparent 50%),
    linear-gradient(-45deg, rgba(245, 208, 165, 0.08) 20%, transparent 70%);
}

.sequence-glow {
  background: 
    /* Golden accent - corner fade */
    linear-gradient(45deg, rgba(238, 206, 162, 0.15) 0%, transparent 60%),
    linear-gradient(225deg, rgba(250, 220, 180, 0.08) 0%, transparent 65%);
}

.truth-glow {
  background: 
    /* Maintain theme consistency with Ghost Green */
    linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, transparent 55%),
    linear-gradient(-45deg, rgba(34, 197, 94, 0.12) 0%, transparent 75%);
}

.final-block .block-content {
  flex-direction: column;
  text-align: center;
  gap: 2rem;
}

.final-message {
  font-size: clamp(1.6rem, 3.2vw, 2.5rem);
  font-style: italic;
  font-family: "Georgia", serif;
  color: #86d686;
  margin: 0;
  border: none;
  padding: 0;
  line-height: 1.4;
}

.final-block .block-image {
  order: -1;
}

/* Tablet Styles */
@media (max-width: 1024px) {
  .features-container {
    padding: 4rem 1.5rem;
  }
  .features-blocks {
    gap: 6rem;
  }
  .left-block,
  .right-block {
    padding-left: 2%;
    padding-right: 2%;
    justify-content: center;
  }
  .block-content {
    gap: 3rem;
    padding: 2.5rem;
    max-width: 95%;
  }
  .block-image {
    flex: 0 0 280px;
    height: 280px;
  }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .features-container {
    padding: 3rem 1rem;
  }
  .welcome-section {
    margin-bottom: 5rem;
  }
  .features-blocks {
    gap: 4rem;
  }
  .left-block,
  .right-block,
  .center-block {
    padding-left: 0;
    padding-right: 0;
    justify-content: center;
  }
  .block-content {
    flex-direction: column;
    text-align: center;
    gap: 2.5rem;
    padding: 2rem;
    max-width: 100%;
  }
  .left-block .block-content {
    flex-direction: column;
  }
  .feature-item::before {
    left: 50%;
    transform: translateX(-100px);
  }
  .block-image {
    flex: 0 0 240px;
    height: 240px;
  }
}

@media (max-width: 480px) {
  .block-content {
    padding: 1.5rem;
    border-radius: 20px;
  }
  .block-image {
    flex: 0 0 200px;
    height: 200px;
  }
  .feature-item {
    padding-left: 0;
  }
  .feature-item::before {
    display: none;
  }
}
</style>
