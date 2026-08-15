<template>
  <footer :class="['site-footer', variant]">
    <div class="footer-shell">
      <div v-if="variant === 'full'" class="footer-columns">
        <div class="footer-identity">
          <RouterLink class="footer-brand" to="/">
            <img :src="logo" alt="" width="34" height="34">
            <span>Mysterria</span>
          </RouterLink>
          <p class="footer-disclaimer">{{ t('footer.disclaimer') }}</p>
        </div>

        <div class="footer-column">
          <p class="footer-heading">{{ t('footer.playHeading') }}</p>
          <RouterLink to="/guide">{{ t('footer.linkGuide') }}</RouterLink>
          <RouterLink to="/pathways">{{ t('footer.linkArchive') }}</RouterLink>
          <RouterLink to="/rules">{{ t('footer.linkRules') }}</RouterLink>
          <RouterLink to="/staff">{{ t('footer.linkStaff') }}</RouterLink>
          <RouterLink to="/#companion">{{ t('footer.linkCompanion') }}</RouterLink>
        </div>

        <div class="footer-column">
          <p class="footer-heading">{{ t('footer.accountHeading') }}</p>
          <RouterLink to="/profile">{{ t('footer.linkDossier') }}</RouterLink>
          <RouterLink to="/store">{{ t('footer.linkShop') }}</RouterLink>
          <RouterLink to="/news">{{ t('footer.linkNews') }}</RouterLink>
        </div>

        <div class="footer-column">
          <p class="footer-heading">{{ t('footer.communityHeading') }}</p>
          <a href="https://discord.com/invite/jc7GSxBWgb" rel="noopener noreferrer" target="_blank">
            <IconDiscord class="footer-icon"/>
            {{ t('servicesDiscord') }}
          </a>
          <a href="https://wiki.mysterria.net/" rel="noopener noreferrer" target="_blank">
            <IconWiki class="footer-icon"/>
            {{ t('navWiki') }}
          </a>
          <a href="https://map.mysterria.net/" rel="noopener noreferrer" target="_blank">
            <IconMap class="footer-icon"/>
            {{ t('servicesMap') }}
          </a>
        </div>
      </div>

      <div class="footer-baseline">
        <span class="footer-copy">© {{ year }} Mysterria † {{ SERVER_IP }}</span>
        <nav class="footer-legal" :aria-label="t('footer.legalLabel')">
          <template v-if="variant === 'slim'">
            <RouterLink to="/">{{ t('navHome') }}</RouterLink>
            <RouterLink to="/guide">{{ t('navGame') }}</RouterLink>
            <RouterLink to="/store">{{ t('navShop') }}</RouterLink>
            <RouterLink to="/rules">{{ t('navRules') }}</RouterLink>
          </template>
          <template v-else>
            <RouterLink to="/terms">{{ t('termsViewTitle') }}</RouterLink>
            <RouterLink to="/privacy">{{ t('privacyViewTitle') }}</RouterLink>
            <RouterLink to="/sla">{{ t('slaViewTitle') }}</RouterLink>
          </template>
        </nav>
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import {useI18n} from "@/composables/useI18n";
import {SERVER_IP} from "@/composables/useServer";
import IconDiscord from "@/assets/icons/IconDiscord.vue";
import IconWiki from "@/assets/icons/IconWiki.vue";
import IconMap from "@/assets/icons/IconMap.vue";
import logo from "@/assets/icons/sources/IconLogo.webp";

withDefaults(defineProps<{ variant?: "full" | "slim" }>(), {variant: "slim"});

const {t} = useI18n();
const year = new Date().getFullYear();
</script>

<style scoped>
.site-footer {
  background: var(--myst-bg);
  border-top: 1px solid var(--myst-line-16);
}

.site-footer.full {
  padding: 64px 24px 36px;
}

.site-footer.slim {
  padding: 36px 24px;
}

.footer-shell {
  max-width: var(--myst-shell);
  margin: 0 auto;
}

.footer-columns {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: 48px;
  padding-bottom: 48px;
  border-bottom: 1px solid var(--myst-line-10);
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  color: inherit;
}

.footer-brand:hover {
  color: inherit;
}

.footer-brand span {
  font-family: var(--myst-font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--myst-offwhite);
}

.footer-disclaimer {
  margin: 0;
  max-width: 34ch;
  color: var(--myst-ink-muted);
  font-size: 13.5px;
  line-height: 1.7;
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.footer-heading {
  margin: 0 0 5px;
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.footer-column a {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  color: var(--myst-ink-muted);
  transition: color 0.25s ease;
}

.footer-column a:hover {
  color: var(--myst-gold);
}

.footer-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.footer-baseline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.site-footer.full .footer-baseline {
  padding-top: 28px;
}

.footer-copy,
.footer-legal a {
  font-family: var(--myst-font-mono);
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(145, 145, 155, 0.55);
}

.footer-legal {
  display: flex;
  gap: 22px;
  flex-wrap: wrap;
}

.footer-legal a:hover {
  color: var(--myst-gold);
}

@media (max-width: 900px) {
  .footer-columns {
    grid-template-columns: 1fr 1fr;
    gap: 36px;
  }

  .footer-identity {
    grid-column: 1 / -1;
  }
}

@media (max-width: 560px) {
  .footer-columns {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .footer-baseline {
    justify-content: center;
    text-align: center;
  }
}
</style>
