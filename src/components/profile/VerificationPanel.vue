<template>
  <div
      v-if="props.isOwnProfile && !props.displayedUser?.verified"
      class="verification-panel"
  >
    <!-- Header Section -->
    <div class="panel-header">
      <div class="header-icon">
        <svg fill="none" height="32" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="32">
          <path d="M9 12l2 2 4-4"/>
          <path d="M21 12c-1.1-1.1-2.3-2-3.6-2.7"/>
          <path d="M3 12c1.1-1.1 2.3-2 3.6-2.7"/>
          <path d="M12 21c-1.1-1.1-2-2.3-2.7-3.6"/>
          <path d="M12 3c1.1 1.1 2 2.3 2.7 3.6"/>
        </svg>
      </div>
      <div class="header-content">
        <h3 class="panel-title">{{ t("verifyMinecraftAccount") }}</h3>
        <p class="panel-subtitle" v-html="t('verificationDescription')"></p>
      </div>
    </div>

    <!-- Actions Section -->
    <div class="panel-actions">
      <button
          :class="{ 'loading': isGenerating }"
          :disabled="isGenerating || !!verificationCode"
          class="generate-button"
          @click="generateCode"
      >
        <div v-if="isGenerating" class="button-loading">
          <div class="loading-spinner"></div>
          <span>{{ t("generating") }}</span>
        </div>
        <div v-else class="button-content">
          <svg fill="none" height="20" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="20">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span>{{ t("generateCode") }}</span>
        </div>
      </button>

      <!-- Code Display Card -->
      <div v-if="verificationCode" class="code-card">
        <div class="code-card-header">
          <div class="success-indicator">
            <svg fill="none" height="20" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="20">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <h4 class="code-title">{{ t("yourVerificationCode") }}</h4>
        </div>

        <div class="code-section">
          <div class="code-display-container">
            <div class="verification-code-wrapper">
              <code class="verification-code">{{ verificationCode.code }}</code>
            </div>
            <button :class="{ 'copied': copied }" class="copy-button" @click="copyCode">
              <svg v-if="!copied" fill="none" height="18" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
                   width="18">
                <rect height="13" rx="2" ry="2" width="13" x="9" y="9"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              <svg v-else fill="none" height="18" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="code-info">
          <div class="expiry-info">
            <svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            <span>
              {{ t("codeValidUntil") }} {{ formatExpiry(verificationCode.expiresAt) }}
            </span>
          </div>
          <div class="command-info">
            <div class="command-label">{{ t("enterOnServer") }}</div>
            <div class="command-display">
              <code>/verify {{ verificationCode.code }}</code>
            </div>
          </div>
        </div>
      </div>
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to generate code");
    }

    verificationCode.value = await response.json();
    show(t("verificationCodeGenerated"), {type: "success"});
  } catch (error) {
    console.error("Failed to generate verification code:", error);
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
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error("Failed to copy code:", error);
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
/* Main Panel */
.verification-panel {
  width: 100%;
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, white 10%, transparent);
  border-radius: 16px;
  overflow: hidden;
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Panel Header */
.panel-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  border-bottom: 1px solid color-mix(in srgb, white 8%, transparent);
}

.header-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--myst-gold) 15%, transparent);
  border-radius: 12px;
  color: var(--myst-gold);
}

.header-content {
  flex: 1;
}

.panel-title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--myst-ink-strong);
}

.panel-subtitle {
  margin: 0;
  color: var(--myst-ink);
  font-size: 14px;
  line-height: 1.5;
}

.panel-subtitle :deep(code) {
  background: color-mix(in srgb, var(--myst-gold) 15%, transparent);
  color: var(--myst-gold);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
}

/* Panel Actions */
.panel-actions {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Generate Button */
.generate-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--myst-gold);
  color: var(--myst-bg);
  border: none;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(200, 178, 115, 0.3);
  align-self: flex-start;
}

.generate-button:hover:not(:disabled) {
  background: color-mix(in srgb, var(--myst-gold) 120%, white 20%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(200, 178, 115, 0.4);
}

.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.generate-button.loading {
  pointer-events: none;
}

.button-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid color-mix(in srgb, var(--myst-bg) 40%, transparent);
  border-top-color: var(--myst-bg);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Code Card */
.code-card {
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 20%, transparent);
  border-radius: 12px;
  overflow: hidden;
  animation: codeCardSlideIn 0.5s ease-out;
}

@keyframes codeCardSlideIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.code-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid color-mix(in srgb, white 8%, transparent);
}

.success-indicator {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, #22c55e 15%, transparent);
  border-radius: 8px;
  color: #22c55e;
  flex-shrink: 0;
}

.code-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--myst-ink-strong);
}

/* Code Section */
.code-section {
  padding: 0 20px 16px;
}

.code-display-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.verification-code-wrapper {
  flex: 1;
  position: relative;
}

.verification-code {
  display: block;
  width: 100%;
  background: color-mix(in srgb, var(--myst-gold) 10%, transparent);
  border: 2px solid color-mix(in srgb, var(--myst-gold) 30%, transparent);
  color: var(--myst-gold);
  padding: 16px 20px;
  border-radius: 8px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  text-align: center;
  text-decoration: none;
  user-select: all;
}

.copy-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, white 15%, transparent);
  color: var(--myst-ink);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.copy-button:hover {
  background: color-mix(in srgb, white 5%, transparent);
  border-color: color-mix(in srgb, white 30%, transparent);
  color: var(--myst-ink-strong);
  transform: translateY(-1px);
}

.copy-button.copied {
  background: color-mix(in srgb, #22c55e 15%, transparent);
  border-color: #22c55e;
  color: #22c55e;
}

/* Code Info */
.code-info {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.expiry-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f59e0b;
  font-size: 14px;
  font-weight: 500;
}

.command-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.command-label {
  color: var(--myst-ink);
  font-size: 14px;
  font-weight: 500;
}

.command-display {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, white 8%, transparent);
  border-radius: 6px;
  padding: 12px 16px;
}

.command-display code {
  color: var(--myst-gold);
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 14px;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .panel-header {
    padding: 20px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .header-icon {
    align-self: center;
  }

  .panel-actions {
    padding: 20px;
    gap: 20px;
  }

  .generate-button {
    align-self: stretch;
    text-align: center;
  }

  .code-display-container {
    flex-direction: column;
    gap: 16px;
  }

  .copy-button {
    align-self: center;
  }

  .verification-code {
    font-size: 16px;
    letter-spacing: 0.5px;
  }

  .code-card-header,
  .code-section,
  .code-info {
    padding-left: 16px;
    padding-right: 16px;
  }

  .command-info {
    gap: 6px;
  }
}

@media (max-width: 480px) {
  .panel-header,
  .panel-actions {
    padding: 16px;
  }

  .panel-title {
    font-size: 18px;
  }

  .verification-code {
    font-size: 14px;
    padding: 12px 16px;
  }

  .generate-button {
    padding: 12px 20px;
    font-size: 14px;
  }
}
</style>
