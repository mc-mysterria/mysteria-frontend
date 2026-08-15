<template>
  <section id="companion" class="companion">
    <div class="companion-glow" aria-hidden="true"></div>

    <div class="myst-shell companion-grid">
      <div class="companion-copy">
        <p class="myst-eyebrow">{{ t('companion.eyebrow') }}</p>
        <h2 class="companion-title">{{ t('companion.title') }}</h2>
        <p class="companion-lede">{{ t('companion.lede') }}</p>

        <ul class="companion-features">
          <li v-for="feature in features" :key="feature.title">
            <i :class="feature.icon" aria-hidden="true"></i>
            <span>
              <strong>{{ feature.title }}</strong>
              <small>{{ feature.body }}</small>
            </span>
          </li>
        </ul>
      </div>

      <div class="companion-card">
        <span class="myst-corner-frame" aria-hidden="true"></span>
        <p class="card-label">{{ t('companion.downloadEyebrow') }}</p>

        <a
            v-for="platform in platforms"
            :key="platform.url"
            class="platform-link"
            :href="platform.url"
            rel="noopener noreferrer"
            target="_blank"
        >
          <component :is="platform.icon" class="platform-icon"/>
          <span class="platform-name">{{ platform.name }}</span>
          <i class="fa-solid fa-arrow-up-right-from-square platform-arrow" aria-hidden="true"></i>
        </a>

        <p class="card-note">{{ t('companion.platformNote') }}</p>
      </div>
    </div>

    <div class="myst-shell">
      <div class="myst-callout companion-callout">
        <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
        <p><strong>{{ t('companion.optionalLabel') }}</strong>{{ t('companion.optional') }}</p>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import {useI18n} from "@/composables/useI18n";
import IconGithub from "@/assets/icons/IconGithub.vue";
import IconCurseForge from "@/assets/icons/IconCurseForge.vue";
import IconModrinth from "@/assets/icons/IconModrinth.vue";

const {t} = useI18n();

const features = computed(() => [
  {
    icon: "fa-solid fa-keyboard",
    title: t("companion.featureHotkeysTitle"),
    body: t("companion.featureHotkeysBody"),
  },
  {
    icon: "fa-solid fa-wand-magic-sparkles",
    title: t("companion.featureVisualsTitle"),
    body: t("companion.featureVisualsBody"),
  },
  {
    icon: "fa-solid fa-volume-high",
    title: t("companion.featurePresenceTitle"),
    body: t("companion.featurePresenceBody"),
  },
]);

/* Order matters: GitHub first because it always carries the newest build. */
const platforms = [
  {name: "GitHub Releases", url: "https://github.com/ikeepcalm/coi-client/releases", icon: IconGithub},
  {name: "CurseForge", url: "https://www.curseforge.com/minecraft/mc-mods/coi-client", icon: IconCurseForge},
  {name: "Modrinth", url: "https://modrinth.com/mod/coi-client", icon: IconModrinth},
];
</script>

<style scoped>
.companion {
  position: relative;
  padding: 100px 24px;
  background: linear-gradient(180deg, var(--myst-bg), var(--myst-bg-deep) 22%, var(--myst-bg-deep) 78%, var(--myst-bg));
  overflow: hidden;
}

.companion-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 45% 55% at 76% 45%, rgba(200, 178, 115, 0.06), transparent 68%);
}

.companion-grid {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 64px;
  align-items: center;
}

.companion-title {
  margin: 14px 0 18px;
  font-family: var(--myst-font-display);
  font-size: clamp(28px, 3.4vw, 42px);
  font-weight: 700;
  line-height: 1.15;
  color: var(--myst-offwhite);
}

.companion-lede {
  margin: 0 0 34px;
  max-width: 60ch;
  color: var(--myst-ink-muted);
  font-size: 15.5px;
  line-height: 1.75;
}

.companion-features {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 20px;
}

.companion-features li {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.companion-features i {
  margin-top: 3px;
  width: 18px;
  flex-shrink: 0;
  color: var(--myst-gold);
  font-size: 14px;
  text-align: center;
}

.companion-features strong {
  display: block;
  margin-bottom: 4px;
  color: var(--myst-offwhite);
  font-size: 14.5px;
  font-weight: 600;
}

.companion-features small {
  color: var(--myst-ink-muted);
  font-size: 13.5px;
  line-height: 1.65;
}

/* Download card */
.companion-card {
  position: relative;
  padding: 34px 30px;
  background: var(--myst-panel-strong);
  border: 1px solid var(--myst-line-28);
}

.card-label {
  margin: 0 0 20px;
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--myst-gold);
  text-align: center;
}

.platform-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--myst-line-16);
  color: var(--myst-ink-muted);
  transition: border-color 0.25s ease, background-color 0.25s ease, color 0.25s ease;
}

.platform-link + .platform-link {
  margin-top: 10px;
}

.platform-link:hover {
  border-color: var(--myst-gold);
  background: rgba(200, 178, 115, 0.07);
  color: var(--myst-gold);
}

.platform-icon {
  color: var(--myst-gold);
}

.platform-name {
  flex: 1;
  min-width: 0;
  font-family: var(--myst-font-mono);
  font-size: 11.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--myst-offwhite);
  transition: color 0.25s ease;
}

.platform-link:hover .platform-name {
  color: var(--myst-gold);
}

.platform-arrow {
  font-size: 10px;
  opacity: 0.5;
}

.card-note {
  margin: 20px 0 0;
  color: var(--myst-ink-muted);
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
}

.companion-callout {
  position: relative;
  margin-top: 52px;
}

@media (max-width: 980px) {
  .companion-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 700px) {
  .companion {
    padding: 70px 20px;
  }

  .companion-card {
    padding: 28px 22px;
  }
}
</style>
