<template>
  <div class="serverInfo server-info-card">
    <p class="serverTitle">{{ t("serverInformation") }}</p>
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ t("loadingServerData") }}</p>
    </div>
    <div v-else>
      <div class="infoContainer">
        <div class="infoBlock" :title="t('timePlayedTitle')">
          <p>{{ t("timePlayed") }}</p>
          <div class="info">{{ serverProfile?.playtime || t("unknown") }}</div>
        </div>
        <div class="infoBlock" :title="t('magicPathTitle')">
          <p>{{ t("magicPathLabel") }}</p>
          <div class="info">
            {{ serverProfile?.magic_path || t("unknown") }}
          </div>
        </div>
        <div class="infoBlock" :title="t('residenceTitle')">
          <p>{{ t("livesIn") }}</p>
          <div class="info">{{ serverProfile?.residence || t("unknown") }}</div>
        </div>
      </div>

      <div class="infoContainer infoContainerPC">
        <div class="infoBlockSecond">
          <p>{{ t("magicLevel") }}</p>
          <div class="info">
            {{ serverProfile?.magic_level ?? t("unknown") }}
          </div>
        </div>
        <div class="infoBlockSecond">
          <p>{{ t("experienceLevel") }}</p>
          <div class="info">
            {{ serverProfile?.experience_level || t("unknown") }}
          </div>
        </div>
        <div class="infoBlockSecond">
          <p>{{ t("warnings") }}</p>
          <div class="info green">{{ serverProfile?.warnings || "0 / 8" }}</div>
        </div>
        <div class="infoBlockSecond">
          <p>{{ t("criminalRecords") }}</p>
          <div class="info green">
            {{ serverProfile?.criminal_records || t("unknown") }}
          </div>
        </div>
      </div>

      <div class="infoContainer infoContainerMobile">
        <div class="infoMobile">
          <div class="infoBlockSecond">
            <p>{{ t("magicLevel") }}</p>
            <div class="info">
              {{ serverProfile?.magic_level ?? t("unknown") }}
            </div>
          </div>
          <div class="infoBlockSecond">
            <p>{{ t("experienceLevel") }}</p>
            <div class="info">
              {{ serverProfile?.experience_level || t("unknown") }}
            </div>
          </div>
        </div>
        <div class="infoMobile">
          <div class="infoBlockSecond">
            <p>{{ t("warnings") }}</p>
            <div class="info green">
              {{ serverProfile?.warnings || "0 / 8" }}
            </div>
          </div>
          <div class="infoBlockSecond">
            <p>{{ t("criminalRecords") }}</p>
            <div class="info green">
              {{ serverProfile?.criminal_records || t("unknown") }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "@/composables/useI18n";

const { t } = useI18n();

interface ServerProfile {
  playtime?: string;
  magic_path?: string;
  residence?: string;
  magic_level?: number;
  experience_level?: number;
  warnings?: string;
  criminal_records?: number;
  server_role?: string;
  nickname?: string;
}

defineProps<{
  serverProfile: ServerProfile | null;
  loading?: boolean;
}>();

// Props-driven component, no local state management needed
</script>

<style scoped>
.serverInfo {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, white 10%, transparent);
  border-radius: 8px;
  padding: 24px;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.serverInfo:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 30%, transparent);
}

.serverTitle {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  background: linear-gradient(135deg, #6c5dd3, #8b7eff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.infoContainer {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.infoContainer:last-child {
  margin-bottom: 0;
}

.infoBlock {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.infoBlockSecond {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.infoBlock p,
.infoBlockSecond p {
  font-size: 0.9rem;
  font-weight: 600;
  color: #cccccc;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 1.25rem;
  border-radius: 10px;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  word-break: break-word;
  min-height: 50px;
  display: flex;
  align-items: center;
}

.info:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(108, 93, 211, 0.5);
  transform: translateY(-1px);
}

.green {
  color: #4ade80;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(108, 93, 211, 0.2);
  border-top: 3px solid #6c5dd3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.infoContainerMobile {
  display: none;
}

.infoContainerPC {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
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

@media (max-width: 768px) {
  .serverInfo {
    padding: 1.5rem;
  }

  .infoContainer {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .infoContainerPC {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .serverInfo {
    padding: 1rem;
    margin-bottom: 2rem;
  }

  .serverTitle {
    font-size: 1.25rem;
  }

  .infoContainerPC {
    display: none;
  }

  .infoContainerMobile {
    display: block;
  }

  .infoContainerMobile .infoMobile {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
}
</style>
