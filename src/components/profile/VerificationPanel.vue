<template>
  <div
      v-if="props.isOwnProfile && !props.displayedUser?.verified"
      class="binding-ritual verification-panel"
  >
    <div class="ritual-frame"></div>
    
    <!-- Header Section -->
    <div class="ritual-header">
      <div class="ritual-icon-main">
        <svg fill="none" height="40" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" width="40">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <div class="ritual-pulse"></div>
      </div>
      <div class="header-content">
        <span class="ritual-eyebrow">Soul Binding</span>
        <h3 class="ritual-title">{{ t("verifyMinecraftAccount") }}</h3>
        <p class="ritual-subtitle" v-html="t('verificationDescription')"></p>
      </div>
    </div>

    <!-- Actions Section -->
    <div class="ritual-actions">
      <button
          :class="{ 'loading': isGenerating }"
          :disabled="isGenerating || !!verificationCode"
          class="btn-activate-ritual"
          @click="generateCode"
      >
        <div v-if="isGenerating" class="btn-loader">
          <div class="spinner"></div>
          <span>INITIATING...</span>
        </div>
        <div v-else class="btn-content">
          <i class="fa-solid fa-wand-sparkles"></i>
          <span>{{ t("generateCode") }}</span>
        </div>
        <div class="btn-flare"></div>
      </button>

      <!-- The Engraved Code -->
      <transition name="ritual-reveal">
        <div v-if="verificationCode" class="engraved-code-card">
          <div class="engraving-bg"></div>
          
          <div class="code-header">
            <span class="code-label">{{ t("yourVerificationCode") }}</span>
            <div class="status-orb" :class="{ 'copied': copied }"></div>
          </div>

          <div class="code-display-area">
            <div class="code-wrapper" @click="copyCode">
              <code class="sigil-code">{{ verificationCode.code }}</code>
              <div class="copy-hint">
                <i :class="copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'"></i>
              </div>
            </div>
          </div>

          <div class="ritual-instructions">
            <div class="expiry-note">
              <i class="fa-regular fa-clock"></i>
              <span>{{ t("codeValidUntil") }} {{ formatExpiry(verificationCode.expiresAt) }}</span>
            </div>
            <div class="command-ritual">
              <span class="cmd-label">{{ t("enterOnServer") }}</span>
              <div class="cmd-box">
                <code>/verify {{ verificationCode.code }}</code>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue";
import {useNotification} from "@/services/useNotification";
import {useI18n} from "@/composables/useI18n";
import type {UserResponse} from "@/types/users";

const props = defineProps<{
  displayedUser: UserResponse | null;
  isOwnProfile: boolean;
}>();

interface VerificationCode {
  code: string;
  expiresAt: string;
}

const {show} = useNotification();
const {t} = useI18n();
const isGenerating = ref(false);
const verificationCode = ref<VerificationCode | null>(null);
const copied = ref(false);

const generateCode = async () => {
  isGenerating.value = true;
  try {
    const response = await fetch("/api/user/verify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to generate code");
    verificationCode.value = await response.json();
    show(t("verificationCodeGenerated"), {type: "success"});
  } catch (error) {
    show(t("verificationCodeError"), {type: "error"});
  } finally {
    isGenerating.value = false;
  }
};

const copyCode = async () => {
  if (!verificationCode.value) return;
  try {
    await navigator.clipboard.writeText(verificationCode.value.code);
    copied.value = true;
    show(t("copySuccess"), {type: "info"});
    setTimeout(() => { copied.value = false; }, 2000);
  } catch (error) {
    show(t("copyError"), {type: "error"});
  }
};

const formatExpiry = (expiresAt: string) => {
  const {currentLanguage} = useI18n();
  const locale = currentLanguage.value === 'uk' ? 'uk-UA' : 'en-US';
  return new Date(expiresAt).toLocaleString(locale);
};
</script>

<style scoped>
/* BINDING RITUAL AESTHETIC */

.binding-ritual {
  position: relative;
  background: rgba(13, 16, 30, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
  padding: 40px;
}

.ritual-frame {
  position: absolute;
  inset: 12px;
  border: 1px solid rgba(200, 178, 115, 0.1);
  pointer-events: none;
}

/* Header */
.ritual-header {
  display: flex;
  gap: 32px;
  margin-bottom: 40px;
}

.ritual-icon-main {
  position: relative;
  width: 80px;
  height: 80px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(200, 178, 115, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--myst-gold);
}

.ritual-pulse {
  position: absolute;
  inset: -8px;
  border: 1px solid rgba(200, 178, 115, 0.1);
  animation: ritualPulse 4s ease-in-out infinite;
}

@keyframes ritualPulse {
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.5; }
}

.ritual-eyebrow {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--myst-gold);
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 8px;
}

.ritual-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  color: var(--myst-offwhite);
  margin: 0 0 12px;
}

.ritual-subtitle {
  font-size: 14px;
  color: #888;
  line-height: 1.6;
  max-width: 500px;
}

/* Button */
.btn-activate-ritual {
  position: relative;
  background: #1a1e3a;
  border: 1px solid var(--myst-gold);
  color: var(--myst-gold);
  padding: 16px 32px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.btn-activate-ritual:hover:not(:disabled) {
  background: var(--myst-gold);
  color: #000;
  box-shadow: 0 0 30px rgba(200, 178, 115, 0.3);
}

.btn-flare {
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: skewX(-25deg);
  transition: left 0.6s ease;
}

.btn-activate-ritual:hover .btn-flare {
  left: 150%;
}

/* Code Card */
.engraved-code-card {
  margin-top: 40px;
  position: relative;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(200, 178, 115, 0.3);
  padding: 32px;
  animation: reveal Ritual 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.engraving-bg {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.05;
  pointer-events: none;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.code-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
}

.status-orb {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #333;
  transition: all 0.3s ease;
}

.status-orb.copied {
  background: var(--myst-gold);
  box-shadow: 0 0 10px var(--myst-gold);
}

.code-wrapper {
  background: rgba(200, 178, 115, 0.05);
  border: 1px dashed rgba(200, 178, 115, 0.3);
  padding: 24px;
  text-align: center;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.code-wrapper:hover {
  background: rgba(200, 178, 115, 0.1);
  border-style: solid;
}

.sigil-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 32px;
  font-weight: 800;
  color: var(--myst-gold);
  letter-spacing: 8px;
}

.copy-hint {
  position: absolute;
  top: 8px; right: 12px;
  font-size: 14px;
  color: var(--myst-gold);
  opacity: 0.3;
}

.ritual-instructions {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.expiry-note {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #f59e42;
  font-size: 13px;
}

.cmd-label {
  display: block;
  font-size: 11px;
  color: #555;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.cmd-box {
  background: #080a14;
  padding: 12px 16px;
  border-left: 2px solid var(--myst-gold);
}

.cmd-box code {
  color: var(--myst-offwhite);
  font-family: 'JetBrains Mono', monospace;
}

/* Animations */
.ritual-reveal-enter-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.ritual-reveal-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .binding-ritual {
    padding: 32px 20px;
  }
  
  .ritual-header {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
  
  .sigil-code {
    font-size: 24px;
    letter-spacing: 4px;
  }
}
</style>
