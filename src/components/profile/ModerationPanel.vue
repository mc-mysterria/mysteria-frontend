<template>
  <div
    v-if="canModerate"
    class="moderation-panel"
    :class="{ 'modal-open': showPunishmentModal || showMessageModal }"
  >
    <div class="moderation-header" @click="togglePanel">
      <h3>Модерація</h3>
      <button class="toggle-btn" :class="{ active: isExpanded }">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </div>

    <div class="moderation-content-wrapper" :class="{ expanded: isExpanded }">
      <div class="moderation-content">
        <div class="action-buttons">
          <button @click="openPunishmentModal('warn')" class="action-btn warn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m21 16-4 4-4-4" />
              <path d="M17 20V4" />
            </svg>
            Попередження
          </button>

          <button @click="openPunishmentModal('mute')" class="action-btn mute">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m21 16-4 4-4-4" />
              <path d="M17 20V4" />
            </svg>
            Мут
          </button>

          <button @click="openPunishmentModal('ban')" class="action-btn ban">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m4.9 4.9 14.2 14.2" />
            </svg>
            Бан
          </button>

          <button @click="openMessageModal" class="action-btn message">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
            </svg>
            Повідомлення
          </button>
        </div>

        <div class="quick-info">
          <div class="info-item">
            <span class="label">ID:</span>
            <span class="value">{{ targetUser?.id || "Невідомо" }}</span>
          </div>
          <div class="info-item">
            <span class="label">Останній раз онлайн:</span>
            <span class="value">{{ formatLastSeen() }}</span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showPunishmentModal"
      class="modal-overlay"
      @click.self="closePunishmentModal"
    >
      <div class="punishment-modal">
        <h4>{{ getPunishmentTitle() }}</h4>

        <div class="form-group">
          <label>Причина:</label>
          <textarea
            v-model="punishmentReason"
            placeholder="Введіть причину..."
            class="form-textarea"
            rows="3"
          ></textarea>
        </div>

        <div v-if="punishmentType !== 'warn'" class="form-group">
          <label>Тривалість:</label>
          <div class="duration-options">
            <button
              v-for="option in getDurationOptions()"
              :key="option.value"
              @click="selectedDuration = option.value"
              :class="[
                'duration-btn',
                { active: selectedDuration === option.value },
              ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="closePunishmentModal" class="cancel-btn">
            Скасувати
          </button>
          <button
            @click="executePunishment"
            class="confirm-btn"
            :disabled="!punishmentReason.trim()"
          >
            Виконати
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showMessageModal"
      class="modal-overlay"
      @click.self="closeMessageModal"
    >
      <div class="message-modal">
        <h4>Надіслати повідомлення</h4>

        <div class="form-group">
          <label>Повідомлення:</label>
          <textarea
            v-model="messageText"
            placeholder="Введіть повідомлення..."
            class="form-textarea"
            rows="4"
          ></textarea>
        </div>

        <div class="modal-actions">
          <button @click="closeMessageModal" class="cancel-btn">
            Скасувати
          </button>
          <button
            @click="sendMessage"
            class="confirm-btn"
            :disabled="!messageText.trim()"
          >
            Надіслати
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { useAuthStore } from "@/stores/auth";
import { catwalkAPI } from "@/utils/api/catwalk";
import { punishmentsAPI } from "@/utils/api/punishments";
import { useNotification } from "@/services/useNotification";
import type { UserResponse } from "@/types/users";
import type { PunishmentCreate } from "@/types/punishments";

const props = defineProps<{
  targetUser: UserResponse | null;
}>();

const userStore = useUserStore();
const authStore = useAuthStore();

const isExpanded = ref(false);
const showPunishmentModal = ref(false);
const showMessageModal = ref(false);
const punishmentType = ref<"warn" | "mute" | "ban">("warn");
const punishmentReason = ref("");
const selectedDuration = ref(0);
const messageText = ref("");

const STORAGE_KEY_PREFIX = "moderation-panel";
const getPunishmentStorageKey = () =>
  `${STORAGE_KEY_PREFIX}-punishment-${props.targetUser?.id || "unknown"}`;
const getMessageStorageKey = () =>
  `${STORAGE_KEY_PREFIX}-message-${props.targetUser?.id || "unknown"}`;
const savePunishmentState = () => {
  if (!props.targetUser) return;

  const state = {
    type: punishmentType.value,
    reason: punishmentReason.value,
    duration: selectedDuration.value,
  };
  localStorage.setItem(getPunishmentStorageKey(), JSON.stringify(state));
};

const loadPunishmentState = () => {
  if (!props.targetUser) return;

  try {
    const saved = localStorage.getItem(getPunishmentStorageKey());
    if (saved) {
      const state = JSON.parse(saved);
      punishmentType.value = state.type || "warn";
      punishmentReason.value = state.reason || "";
      selectedDuration.value = state.duration || 0;
    }
  } catch (error) {
    console.error("Error loading punishment state:", error);
  }
};

const saveMessageState = () => {
  if (!props.targetUser) return;

  localStorage.setItem(getMessageStorageKey(), messageText.value);
};

const loadMessageState = () => {
  if (!props.targetUser) return;

  try {
    const saved = localStorage.getItem(getMessageStorageKey());
    if (saved) {
      messageText.value = saved;
    }
  } catch (error) {
    console.error("Error loading message state:", error);
  }
};

const clearPunishmentState = () => {
  if (!props.targetUser) return;
  localStorage.removeItem(getPunishmentStorageKey());
};

const clearMessageState = () => {
  if (!props.targetUser) return;
  localStorage.removeItem(getMessageStorageKey());
};

const canModerate = computed(() => {
  const currentUser = userStore.currentUser;
  if (!currentUser || !props.targetUser) return false;

  const isOwnProfile = currentUser.id === props.targetUser.id;
  if (isOwnProfile) return false;

  // Superuser has all permissions
  if (currentUser.role === "ADMIN") return true;

  // Check permissions for moderation
  const hasPermissions = authStore.hasAnyPermission([
    "punishments.write",
    "punishments.create",
    "moderation.punish",
  ]);

  return hasPermissions;
});

const togglePanel = () => {
  console.log("Toggling panel, current state:", isExpanded.value);
  isExpanded.value = !isExpanded.value;
  console.log("New state:", isExpanded.value);
};

const openPunishmentModal = (type: "warn" | "mute" | "ban") => {
  console.log("Opening punishment modal for type:", type);
  punishmentType.value = type;
  loadPunishmentState();
  showPunishmentModal.value = true;
};

const closePunishmentModal = () => {
  showPunishmentModal.value = false;
};

const openMessageModal = () => {
  loadMessageState();
  showMessageModal.value = true;
};

const closeMessageModal = () => {
  showMessageModal.value = false;
};

const getPunishmentTitle = () => {
  const titles = {
    warn: "Видати попередження",
    mute: "Замутити гравця",
    ban: "Забанити гравця",
  };
  return titles[punishmentType.value];
};

const getDurationOptions = () => {
  if (punishmentType.value === "mute") {
    return [
      { label: "10 хв", value: 10 },
      { label: "30 хв", value: 30 },
      { label: "1 год", value: 60 },
      { label: "6 год", value: 360 },
      { label: "1 день", value: 1440 },
      { label: "3 дні", value: 4320 },
      { label: "Назавжди", value: 0 },
    ];
  } else {
    return [
      { label: "1 год", value: 60 },
      { label: "6 год", value: 360 },
      { label: "1 день", value: 1440 },
      { label: "3 дні", value: 4320 },
      { label: "1 тиждень", value: 10080 },
      { label: "1 місяць", value: 43200 },
      { label: "Назавжди", value: 0 },
    ];
  }
};

const formatLastSeen = () => {
  if (!props.targetUser) return "Невідомо";

  // last_seen field doesn't exist in schema, show placeholder
  return "Невідомо";

  /*if (props.targetUser.last_seen) {
    const date = new Date(props.targetUser.last_seen)
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return 'Невідомо'*/
};

const executePunishment = async () => {
  if (!props.targetUser || !punishmentReason.value.trim()) return;

  const { show } = useNotification();

  try {
    const currentUser = userStore.currentUser;
    if (!currentUser) {
      show("Не вдалося визначити поточного користувача", { type: "error" });
      return;
    }

    const expiresAt =
      selectedDuration.value > 0
        ? new Date(
            Date.now() + selectedDuration.value * 60 * 1000,
          ).toISOString()
        : null;

    const punishmentData: PunishmentCreate = {
      id: "",
      user_id: props.targetUser.id,
      admin_id: currentUser.id,
      type: punishmentType.value,
      status: "active",
      reason: punishmentReason.value.trim(),
      expires_at: expiresAt ? new Date(expiresAt) : undefined,
      config_id: undefined,
      metadata: undefined,
    };

    console.log("Creating punishment:", punishmentData);

    const result = await punishmentsAPI.create(punishmentData);
    console.log("Punishment created:", result);

    show(
      `Покарання створено: ${punishmentType.value} для ${props.targetUser.nickname}`,
      { type: "info" },
    );
    clearPunishmentState();
    closePunishmentModal();
  } catch (error) {
    console.error("Error executing punishment:", error);
    show(
      "Помилка створення покарання: " +
        (error instanceof Error ? error.message : "Невідома помилка"),
      { type: "error" },
    );
  }
};

const sendMessage = async () => {
  if (!props.targetUser || !messageText.value.trim()) return;

  const { show } = useNotification();

  try {
    if (props.targetUser.nickname) {
      const command = `msg ${props.targetUser.nickname} ${messageText.value.trim()}`;
      console.log("Sending message:", command);
      const result = await catwalkAPI.executeCommand(command);
      console.log("Message result:", result);

      show("Повідомлення надіслано!", { type: "info" });
      clearMessageState();
    } else {
      show("У користувача немає Minecraft нікнейму", { type: "error" });
    }

    closeMessageModal();
  } catch (error) {
    console.error("Error sending message:", error);
    show(
      "Помилка надсилання повідомлення: " +
        (error instanceof Error ? error.message : "Невідома помилка"),
      { type: "error" },
    );
  }
};

watch(punishmentReason, savePunishmentState, { deep: true });
watch(selectedDuration, savePunishmentState, { deep: true });
watch(messageText, saveMessageState, { deep: true });

onMounted(() => {
  if (props.targetUser) {
    loadPunishmentState();
    loadMessageState();
  }
});

watch(
  () => props.targetUser,
  (newUser) => {
    if (newUser) {
      loadPunishmentState();
      loadMessageState();
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.moderation-panel {
  width: 100%;
  margin: 0 auto 3rem auto;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease-out;
  overflow: hidden;
  box-sizing: border-box;
}

.moderation-panel:hover:not(.modal-open) {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(108, 93, 211, 0.2);
}

.moderation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -2rem -2rem 0 -2rem;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: background 0.3s ease;
  user-select: none;
}

.moderation-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

.moderation-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.moderation-header:hover .toggle-btn {
  background: rgba(255, 255, 255, 0.15);
}

.toggle-btn.active {
  transform: rotate(180deg);
}

.moderation-content {
  padding: 1.5rem 0 0 0;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.action-btn.warn {
  border-color: rgba(255, 193, 7, 0.5);
}

.action-btn.warn:hover {
  background: rgba(255, 193, 7, 0.2);
  border-color: #ffc107;
}

.action-btn.mute {
  border-color: rgba(255, 152, 0, 0.5);
}

.action-btn.mute:hover {
  background: rgba(255, 152, 0, 0.2);
  border-color: #ff9800;
}

.action-btn.ban {
  border-color: rgba(244, 67, 54, 0.5);
}

.action-btn.ban:hover {
  background: rgba(244, 67, 54, 0.2);
  border-color: #f44336;
}

.action-btn.message {
  border-color: rgba(108, 93, 211, 0.5);
}

.action-btn.message:hover {
  background: rgba(108, 93, 211, 0.2);
  border-color: #6c5dd3;
}

.quick-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #cccccc;
  font-size: 0.9rem;
}

.value {
  color: #ffffff;
  font-weight: 500;
  font-family: monospace;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.punishment-modal,
.message-modal {
  background: linear-gradient(135deg, #1a1d23 0%, #0f1419 100%);
  border: 2px solid rgba(108, 93, 211, 0.3);
  border-radius: 16px;
  padding: 2rem;
  min-width: 400px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  position: relative;
}

.punishment-modal h4,
.message-modal h4 {
  margin: 0 0 1.5rem 0;
  color: #ffffff;
  font-size: 1.25rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #cccccc;
  font-weight: 500;
}

.form-textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  padding: 0.75rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: #6c5dd3;
  box-shadow: 0 0 0 2px rgba(108, 93, 211, 0.1);
}

.duration-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
}

.duration-btn {
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #cccccc;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;
}

.duration-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.duration-btn.active {
  background: #6c5dd3;
  border-color: #6c5dd3;
  color: #ffffff;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.cancel-btn,
.confirm-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;
  position: relative;
  z-index: 10000;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #cccccc;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.confirm-btn {
  background: linear-gradient(135deg, #6c5dd3, #8b7eff);
  border: 1px solid #6c5dd3;
  color: #ffffff;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(108, 93, 211, 0.3);
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.moderation-content-wrapper {
  max-height: 0;
  overflow: hidden;
  transition:
    max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease;
  opacity: 0;
}

.moderation-content-wrapper.expanded {
  max-height: 500px;
  opacity: 1;
}

@media (max-width: 768px) {
  .punishment-modal,
  .message-modal {
    min-width: 300px;
    padding: 1.5rem;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .duration-options {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
