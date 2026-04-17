<template>
  <Teleport to="body">
    <Transition name="ritual-fade">
      <div v-if="show" class="modal-ritual-overlay" @click="$emit('close')">
        <div class="modal-ritual-content" @click.stop>
          <div class="modal-ritual-header">
            <h2 class="ritual-title">{{ t('home.joinServerTitle') }}</h2>
            <button class="modal-ritual-close" @click="$emit('close')">†</button>
          </div>

          <div class="modal-ritual-body">
            <div class="join-ritual-steps">
              <!-- Step 1 -->
              <div class="join-ritual-step">
                <div class="step-num">1</div>
                <div class="step-info">
                  <h4 class="step-title">{{ t('home.step1Title') }}</h4>
                  <p class="step-desc">{{ t('home.step1Description') }}</p>
                </div>
              </div>

              <!-- Step 2 -->
              <div class="join-ritual-step">
                <div class="step-num">2</div>
                <div class="step-info">
                  <h4 class="step-title">{{ t('home.step2Title') }}</h4>
                  <p class="step-desc">{{ t('home.step2Description') }}</p>
                  <div class="ip-ritual-box">
                    <code class="ip-sigil">{{ t('serverAddress') }}</code>
                  </div>
                </div>
              </div>

              <!-- Step 3 -->
              <div class="join-ritual-step">
                <div class="step-num">3</div>
                <div class="step-info">
                  <h4 class="step-title">{{ t('home.step3Title') }}</h4>
                  <p class="step-desc">{{ t('home.step3Description') }}</p>
                </div>
              </div>
            </div>

            <div class="modal-ritual-actions">
              <router-link class="btn-ritual-primary" to="/guide" @click="$emit('close')">
                {{ t('home.fullGuide') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import {useI18n} from "@/composables/useI18n";

defineProps<{
  show: boolean;
}>();

defineEmits(['close']);

const {t} = useI18n();
</script>

<style scoped>
.modal-ritual-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
}

.modal-ritual-content {
  background: #080a14;
  border: 1px solid rgba(200, 178, 115, 0.2);
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
}

.modal-ritual-header {
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ritual-title {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  color: var(--myst-gold);
  margin: 0;
}

.modal-ritual-close {
  background: none; border: none;
  color: #444; font-size: 24px;
  cursor: pointer; transition: color 0.3s;
}
.modal-ritual-close:hover { color: var(--myst-gold); }

.modal-ritual-body {
  padding: 32px;
}

.join-ritual-steps {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-bottom: 40px;
}

.join-ritual-step {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.step-num {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--myst-gold);
  color: var(--myst-gold);
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.step-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: #fff;
  margin-bottom: 4px;
}

.step-desc {
  font-size: 14px;
  color: #888;
  line-height: 1.5;
}

.ip-ritual-box {
  margin-top: 12px;
  padding: 12px 16px;
  background: #05070a;
  border: 1px solid rgba(200, 178, 115, 0.15);
  display: inline-block;
}

.ip-sigil {
  font-family: 'JetBrains Mono', monospace;
  color: var(--myst-gold);
  font-size: 16px;
}

.modal-ritual-actions {
  display: flex;
  justify-content: center;
}

.btn-ritual-primary {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--myst-gold);
  color: #05070a;
  text-decoration: none;
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 700;
  transition: all 0.3s;
}

.btn-ritual-primary:hover {
  background: #fff;
  transform: translateY(-2px);
}

/* Transitions */
.ritual-fade-enter-active, .ritual-fade-leave-active { transition: all 0.4s ease; }
.ritual-fade-enter-from, .ritual-fade-leave-to { opacity: 0; transform: scale(0.95); }
</style>
