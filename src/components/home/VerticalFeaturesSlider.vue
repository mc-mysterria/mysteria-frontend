<template>
  <div class="features-container">
    <!-- Welcome Section -->
    <section class="welcome-section">
      <h2 class="section-title">{{ t('welcomeTitle') }}</h2>
      <blockquote class="welcome-quote">{{ t('welcomeQuote') }}</blockquote>
      <p class="main-description">{{ t('mainDescription') }}</p>
    </section>

    <!-- Features Blocks -->
    <div class="features-blocks">
      <!-- Gameplay Feature (Left) -->
      <div class="feature-block left-block">
        <div class="block-content">
          <div class="block-text">
            <h3 class="feature-title">{{ t('gameplayTitle') }}</h3>
            <ul class="feature-list">
              <li v-for="feature in tArray('gameplayFeatures')" :key="feature" class="feature-item">
                {{ feature }}
              </li>
            </ul>
          </div>
          <div class="block-image">
            <div class="character-art beyonder-art">
              <img src="@/assets/images/Klein.jpg" alt="Hero Character" class="character-image" />
              <div class="mystical-aura"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Guides Feature (Right) -->
      <div class="feature-block right-block">
        <div class="block-content">
          <div class="block-text">
            <h3 class="feature-title">{{ t('guidesTitle') }}</h3>
            <ul class="feature-list">
              <li v-for="feature in tArray('guidesFeatures')" :key="feature" class="feature-item">
                {{ feature }}
              </li>
            </ul>
          </div>
          <div class="block-image">
            <div class="character-art scholar-art">
              <img src="@/assets/images/Amon.png" alt="Amon Character" class="character-image" />
              <div class="mystical-aura scholar-glow"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- What Awaits Feature (Left) -->
      <div class="feature-block left-block">
        <div class="block-content">
          <div class="block-text">
            <h3 class="feature-title">{{ t('awaitsTitle') }}</h3>
            <ul class="feature-list">
              <li v-for="feature in tArray('awaitsFeatures')" :key="feature" class="feature-item">
                {{ feature }}
              </li>
            </ul>
          </div>
          <div class="block-image">
            <div class="character-art sequence-art">
              <img src="@/assets/images/City.webp" alt="City View" class="character-image" />
              <div class="mystical-aura sequence-glow"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Final Message (Right) -->
      <div class="feature-block right-block final-block">
        <div class="block-content final-content">
          <div class="block-text">
            <blockquote class="final-message">{{ t('finalMessage') }}</blockquote>
          </div>
          <div class="block-image">
            <div class="character-art truth-art">
              <img src="@/assets/images/Happy.png" alt="Happy Character" class="character-image" />
              <div class="mystical-aura truth-glow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t, tArray } = useI18n()
</script>

<style scoped>
/*
 * This version removes ALL hover effects to guarantee the smoothest possible scrolling experience.
 * The visual appeal is maintained through high-quality static styles, focusing on typography,
 * spacing, color, and depth.
*/

.features-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 5rem 2rem;
  background-color: #1a1a2e;
}

.welcome-section {
  text-align: center;
  margin-bottom: 7rem;
}

.section-title {
  font-size: clamp(2.8rem, 6vw, 4.5rem);
  font-family: "MontserratBold", sans-serif;
  background: linear-gradient(135deg, #9b84d5 0%, #c0a4e8 50%, #e6d5b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 2rem;
  text-shadow: 0 4px 20px rgba(155, 132, 213, 0.3);
}

.welcome-quote {
  font-size: clamp(1.25rem, 2.5vw, 1.7rem);
  font-style: italic;
  font-family: "Georgia", serif;
  color: #c0a4e8;
  margin-bottom: 2.5rem;
  border-left: 3px solid #a588d6;
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

/* Chess-like Layout */
.left-block {
  align-self: flex-start;
  width: 85%;
  margin-left: 0;
}

.right-block {
  align-self: flex-end;
  width: 85%;
  margin-right: 0;
}

.block-content {
  display: flex;
  align-items: center;
  gap: 4rem;
  padding: 3.5rem;
  background: linear-gradient(150deg, rgba(40, 30, 60, 0.2), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(192, 164, 232, 0.15);
  border-radius: 28px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(192, 164, 232, 0.1);
  position: relative;
  overflow: hidden;
}

.left-block .block-content {
  flex-direction: row;
}

.right-block .block-content {
  flex-direction: row-reverse;
}

.block-text {
  flex: 1;
  min-width: 0;
}

.feature-title {
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-family: "MontserratBold", sans-serif;
  color: #c0a4e8;
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
  color: #c0a4e8;
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

.mystical-aura {
  position: absolute;
  width: 120%;
  height: 120%;
  top: -10%;
  left: -10%;
  border-radius: 50%;
  opacity: 0.5;
  z-index: 0;
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
  filter: brightness(0.95) contrast(1.05) saturate(1.1);
}

/* Different character themes */
.beyonder-art .mystical-aura {
  background: radial-gradient(circle, rgba(155, 132, 213, 0.5) 0%, rgba(165, 136, 214, 0) 70%);
}

.scholar-glow {
  background: radial-gradient(circle, rgba(228, 194, 151, 0.5) 0%, rgba(228, 194, 151, 0) 70%);
}

.sequence-glow {
  background: radial-gradient(circle, rgba(238, 206, 162, 0.5) 0%, rgba(238, 206, 162, 0) 70%);
}

.truth-glow {
  background: radial-gradient(circle, rgba(139, 115, 199, 0.6) 0%, rgba(139, 115, 199, 0) 70%);
}

.final-content {
  flex-direction: column;
  text-align: center;
  gap: 2rem;
}

.final-message {
  font-size: clamp(1.6rem, 3.2vw, 2.5rem);
  font-style: italic;
  font-family: "Georgia", serif;
  color: #c0a4e8;
  margin: 0;
  border: none;
  padding: 0;
  line-height: 1.4;
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
    width: 95%;
    align-self: center;
  }
  .block-content {
    gap: 3rem;
    padding: 2.5rem;
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
  .right-block {
    width: 100%;
  }
  .block-content,
  .left-block .block-content,
  .right-block .block-content {
    flex-direction: column;
    text-align: center;
    gap: 2.5rem;
    padding: 2rem;
  }
  .feature-item::before {
    left: 50%;
    transform: translateX(-100px);
  }
  .block-image {
    flex: 0 0 240px;
    height: 240px;
  }
  .final-content {
    gap: 2rem;
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
