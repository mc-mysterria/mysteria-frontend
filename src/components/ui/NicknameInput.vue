<template>
  <div
    v-if="profile && !profile.nickname"
    class="nickname-input-container"
  >
    <div class="unauthorized-message">
      <p>Для купівлі чогось потрібно спочатку вказати нікнейм Minecraft</p>
      <div class="input-container">
        <input
          v-model="nicknameInput"
          type="text"
          placeholder="Введіть нікнейм Minecraft"
          class="nickname-input"
          :disabled="isProcessing"
        />
        <button
          @click="handleSave"
          :disabled="!nicknameInput || isProcessing"
          class="save-btn"
        >
          {{ isProcessing ? "Зберігаємо..." : "Зберегти нікнейм" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import { computed } from "vue";
import { useNotification } from "@/services/useNotification";
import { useI18n } from "@/composables/useI18n";

const userStore = useUserStore();
const { show } = useNotification();
const { t } = useI18n();
const profile = computed(() => userStore.currentUser);
const nicknameInput = ref("");
const isProcessing = ref(false);

const handleSave = async () => {
  if (!nicknameInput.value.trim()) {
    show(t('nicknameCannotBeEmpty'), { type: "error" });
    return;
  }

  isProcessing.value = true;

  try {
    await userStore.updateNickname(nicknameInput.value.trim());
    show(t('nicknameSavedSuccessfully'), { type: "info" });
  } catch {
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style scoped>
.nickname-input-container {
  min-height: calc(100vh - 100px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.unauthorized-message {
  background-color: #23262c;
  border-radius: 7px;
  padding: 30px;
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.unauthorized-message p {
  color: #ffffff;
  font-size: 18px;
  margin-bottom: 20px;
}

.input-container {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.nickname-input {
  padding: 10px;
  border-radius: 7px;
  border: 1px solid #34373d;
  background-color: #34373d;
  color: white;
  width: 300px;
}

.nickname-input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.save-btn {
  background-color: #ee7828;
  color: white;
  border: none;
  border-radius: 7px;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-btn:hover:not(:disabled) {
  background-color: #d86a24;
}

.save-btn:disabled {
  background-color: #a35420;
  cursor: not-allowed;
}

@media (max-width: 576px) {
  .input-container {
    flex-direction: column;
  }

  .nickname-input {
    width: 100%;
  }

  .save-btn {
    width: 100%;
  }
}

.error-message {
  color: #ff4444;
  margin-top: 10px;
  font-size: 14px;
}
</style>
