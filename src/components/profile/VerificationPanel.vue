<template>
  <section
      v-if="props.isOwnProfile && !props.displayedUser?.verified"
      class="verification-panel myst-panel"
  >
    <span class="myst-corner-frame" aria-hidden="true"></span>

    <header class="verify-head">
      <span class="verify-icon" aria-hidden="true">
        <i class="fa-solid fa-shield-halved"></i>
      </span>
      <div>
        <p class="verify-eyebrow">{{ t('verification') }}</p>
        <h3 class="verify-title">{{ t('verifyMinecraftAccount') }}</h3>
      </div>
    </header>

    <p class="verify-lede">
      {{ t('verificationDescriptionPre') }}
      <code>{{ t('verificationDescriptionCommand') }}</code>
      {{ t('verificationDescriptionPost') }}
    </p>

    <button
        :disabled="isGenerating || !!verificationCode"
        class="myst-btn-gold verify-button"
        type="button"
        @click="generateCode"
    >
      <i :class="isGenerating ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-wand-sparkles'" aria-hidden="true"></i>
      {{ t('generateCode') }}
    </button>

    <Transition name="verify-reveal">
      <div v-if="verificationCode" class="verify-code">
        <div class="code-head">
          <span class="myst-micro">{{ t('yourVerificationCode') }}</span>
          <span class="code-expiry">
            <i class="fa-solid fa-clock" aria-hidden="true"></i>
            {{ t('codeValidUntil') }} {{ formatExpiry(verificationCode.expiresAt) }}
          </span>
        </div>

        <button class="code-value" type="button" @click="copyCode">
          <code>{{ verificationCode.code }}</code>
          <i :class="copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'" aria-hidden="true"></i>
        </button>

        <p class="code-command">
          <span class="myst-micro">{{ t('enterOnServer') }}</span>
          <code>/verify {{ verificationCode.code }}</code>
        </p>
      </div>
    </Transition>
  </section>
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
const {t, currentLanguage} = useI18n();
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
  } catch {
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
  } catch {
    show(t("copyError"), {type: "error"});
  }
};

const formatExpiry = (expiresAt: string) =>
    new Date(expiresAt).toLocaleString(currentLanguage.value === "uk" ? "uk-UA" : "en-US");
</script>

<style scoped>
.verification-panel {
  position: relative;
  padding: 32px 34px;
  border-color: var(--myst-line-28);
}

.verify-head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}

.verify-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  background: rgba(200, 178, 115, 0.08);
  border: 1px solid var(--myst-line-20);
  color: var(--myst-gold);
  font-size: 16px;
}

.verify-eyebrow {
  margin: 0 0 6px;
  font-family: var(--myst-font-mono);
  font-size: 9.5px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.verify-title {
  margin: 0;
  font-family: var(--myst-font-display);
  font-size: 21px;
  font-weight: 700;
  color: var(--myst-offwhite);
}

.verify-lede {
  position: relative;
  margin: 0 0 24px;
  color: var(--myst-ink-muted);
  font-size: 14px;
  line-height: 1.7;
}

.verify-lede code,
.code-command code {
  padding: 2px 8px;
  background: rgba(200, 178, 115, 0.08);
  border: 1px solid var(--myst-line-18);
  color: var(--myst-gold);
  font-family: var(--myst-font-mono);
  font-size: 0.9em;
}

.verify-button {
  position: relative;
  width: 100%;
}

.verify-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.verify-code {
  position: relative;
  margin-top: 24px;
  padding-top: 22px;
  border-top: 1px solid var(--myst-line-12);
}

.code-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.code-expiry {
  font-family: var(--myst-font-mono);
  font-size: 10px;
  color: var(--myst-ink-muted);
}

.code-value {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px dashed var(--myst-line-40);
  cursor: pointer;
  color: var(--myst-gold);
  transition: border-color 0.25s ease;
}

.code-value:hover {
  border-color: var(--myst-gold);
}

.code-value code {
  font-family: var(--myst-font-mono);
  font-size: 22px;
  letter-spacing: 0.3em;
}

.code-command {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 16px 0 0;
}

.verify-reveal-enter-active,
.verify-reveal-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.verify-reveal-enter-from,
.verify-reveal-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 560px) {
  .verification-panel {
    padding: 24px 20px;
  }

  .code-value code {
    font-size: 17px;
    letter-spacing: 0.2em;
  }
}
</style>
