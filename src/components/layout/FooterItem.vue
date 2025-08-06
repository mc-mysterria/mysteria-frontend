<template>
  <footer>
    <div class="footer-backdrop"></div>
    <div class="footer-content-wrapper">
      <div class="footer-grid">
        <div class="footer-brand-section">
          <RouterLink to="/" class="footer-brand">
            <div class="footer-logo-container">
              <div class="logo-background-effect"></div>
              <IconLogo />
            </div>
            <div class="brand-text">
              <span class="project-name">{{ t('serverName') }}</span>
              <span class="brand-tagline">Experience Beyond Reality</span>
            </div>
          </RouterLink>
        </div>
        
        <div class="footer-social-section">
          <h4 class="social-title">Connect With Us</h4>
          <div class="footer-social-icons">
            <a
              v-for="url in urls"
              :key="url.name"
              :href="url.url"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="url.name"
              :data-tooltip="url.tooltip"
              class="social-link"
            >
              <div class="social-icon-background"></div>
              <component :is="url.icon" />
            </a>
          </div>
        </div>
      </div>
      
      <div class="footer-divider"></div>
      
      <div class="footer-legal">
        <div class="copyright-text">
          <p>
            <span class="copyright-year">{{ t('copyright') }} {{ t('serverName') }}</span>
            <span class="rights-text">{{ t('rights') }}</span>
          </p>
          <p class="disclaimer">
            We are in no way affiliated with or endorsed by Mojang or Microsoft.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import IconLogo from "@/assets/icons/IconLogo.vue";
import IconMap from "@/assets/icons/IconMap.vue";
import IconTelegram from "@/assets/icons/IconTelegram.vue";
import IconDiscord from "@/assets/icons/IconDiscord.vue";
import IconWiki from "@/assets/icons/IconWiki.vue";
import { useI18n } from "@/composables/useI18n";

const wikiUrl = import.meta.env.VITE_WIKI_URL;
const mapUrl = import.meta.env.VITE_MAP_URL;
const telegramUrl = import.meta.env.VITE_TELEGRAM_URL;
const discordUrl = import.meta.env.VITE_DISCORD_URL;

const { t } = useI18n();

const urls = [
  {
    name: "map",
    url: mapUrl,
    tooltip: "Online Map",
    icon: IconMap,
  },
  {
    name: "telegram",
    url: telegramUrl,
    tooltip: "Telegram",
    icon: IconTelegram,
  },
  {
    name: "discord",
    url: discordUrl,
    tooltip: "Discord",
    icon: IconDiscord,
  },
  {
    name: "wiki",
    url: wikiUrl,
    tooltip: "Wiki",
    icon: IconWiki,
  },
];
</script>

<style scoped>
@font-face {
  font-family: "Montserrat";
  src: url("/src/assets/fonts/Montserrat-Bold.ttf");
  font-weight: 700;
}

footer {
  width: calc(-1px + 100vw);
  background: 
    /* Subtle upward gradient instead of radial */
    linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.95) 100%),
    linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%),
    /* Subtle texture pattern */
    repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(16, 185, 129, 0.008) 2px, rgba(16, 185, 129, 0.008) 4px);
  padding: 80px 0 60px 0;
  font-size: 16px;
  color: #cbd5e1;
  font-family: "Montserrat", sans-serif;
  position: relative;
  overflow: hidden;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.footer-backdrop {
  display: none;
}

footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(16, 185, 129, 0.3) 25%,
    rgba(34, 197, 94, 0.3) 75%,
    transparent 100%
  );
}


.footer-content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  flex-direction: column;
  gap: 48px;
  position: relative;
  z-index: 1;
}
.footer-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 60px;
  align-items: start;
}

.footer-brand-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.footer-social-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: flex-end;
}
.footer-brand {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 28px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  padding: 16px;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.1);
  backdrop-filter: blur(10px);
}

.footer-brand:hover {
  transform: translateY(-2px) scale(1.01);
  background: rgba(15, 23, 42, 0.5);
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(16, 185, 129, 0.1) inset;
}
.footer-logo-container {
  position: relative;
  overflow: visible;
  width: 64px;
  height: 64px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.1));
  border: 2px solid rgba(16, 185, 129, 0.2);
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-background-effect {
  display: none;
}



.footer-brand:hover .footer-logo-container {
  transform: scale(1.05);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(34, 197, 94, 0.2));
  border-color: rgba(16, 185, 129, 0.4);
}
.icon-logo {
  width: 32px;
  height: 32px;
  z-index: 1;
  position: relative;
}
.brand-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-name {
  background: linear-gradient(
    135deg,
    #10b981 0%,
    #22c55e 50%,
    #16a34a 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  font-weight: 800;
  font-size: 1.1em;
  letter-spacing: -0.025em;
}

.brand-tagline {
  color: #94a3b8;
  font-size: 0.85em;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.social-title {
  color: #e2e8f0;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.025em;
  text-align: right;
}

.footer-social-icons {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.social-link {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8));
  border: 1px solid rgba(148, 163, 184, 0.1);
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.social-icon-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.1));
  opacity: 0;
  transition: opacity 0.4s ease;
}
.social-link:hover {
  transform: translateY(-2px) scale(1.05);
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(16, 185, 129, 0.2) inset;
}

.social-link:hover .social-icon-background {
  opacity: 1;
}
.footer-social-icons svg,
.footer-social-icons img,
.footer-social-icons .icon-map,
.footer-social-icons .icon-telegram,
.footer-social-icons .icon-discord,
.footer-social-icons .icon-wiki {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  width: 24px !important;
  height: 24px !important;
  fill: #94a3b8 !important;
  position: relative;
  z-index: 1;
}
.social-link:hover svg,
.social-link:hover svg * {
  fill: #ffffff !important;
  transform: scale(1.05);
}
.social-link::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 130%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
.social-link::before {
  content: "";
  position: absolute;
  bottom: 118%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  border: 8px solid transparent;
  border-top-color: rgba(30, 41, 59, 0.95);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}
.social-link:hover::after,
.social-link:hover::before {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}
.footer-divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(148, 163, 184, 0.2) 20%,
    rgba(16, 185, 129, 0.3) 50%,
    rgba(148, 163, 184, 0.2) 80%,
    transparent 100%
  );
  margin: 24px 0;
}

.footer-legal {
  display: flex;
  justify-content: center;
  align-items: center;
}
.copyright-text {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.8;
  text-align: center;
  max-width: 600px;
}

.copyright-year {
  color: #e2e8f0;
  font-weight: 600;
  background: linear-gradient(135deg, #10b981, #22c55e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.rights-text {
  margin-left: 8px;
}

.disclaimer {
  margin-top: 8px;
  font-size: 13px;
  color: #64748b;
  font-style: italic;
}
.copyright-text p {
  margin: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.copyright-text p:first-child {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  footer {
    padding: 70px 0 50px 0;
  }
  .footer-content-wrapper {
    max-width: 100%;
    padding: 0 28px;
    gap: 40px;
  }
  .footer-grid {
    gap: 48px;
  }
  .footer-brand {
    font-size: 26px;
    padding: 14px;
  }
  .footer-logo-container {
    width: 60px;
    height: 60px;
    padding: 14px;
  }
  .footer-social-icons {
    gap: 14px;
  }
  .social-link {
    width: 48px;
    height: 48px;
  }
}
@media (max-width: 992px) {
  footer {
    padding: 60px 0 45px 0;
  }
  .footer-content-wrapper {
    padding: 0 24px;
    gap: 36px;
  }
  .footer-grid {
    gap: 40px;
  }
  .footer-brand {
    font-size: 24px;
    padding: 12px;
  }
  .footer-logo-container {
    width: 56px;
    height: 56px;
    padding: 12px;
  }
  .footer-social-icons {
    gap: 12px;
  }
  .social-link {
    width: 44px;
    height: 44px;
  }
  .copyright-text {
    font-size: 13px;
  }
}
@media (max-width: 768px) {
  footer {
    padding: 50px 0 40px 0;
  }
  .footer-content-wrapper {
    padding: 0 20px;
    gap: 32px;
  }
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 32px;
    text-align: center;
  }
  .footer-social-section {
    align-items: center;
  }
  .social-title {
    text-align: center;
  }
  .footer-social-icons {
    justify-content: center;
  }
  .footer-brand {
    font-size: 22px;
    padding: 14px;
    justify-content: center;
  }
  .footer-logo-container {
    width: 52px;
    height: 52px;
    padding: 12px;
  }
  .footer-social-icons {
    gap: 12px;
  }
  .social-link {
    width: 44px;
    height: 44px;
  }
  .copyright-text {
    font-size: 12px;
  }
}
@media (max-width: 480px) {
  footer {
    padding: 40px 0 35px 0;
  }
  .footer-content-wrapper {
    padding: 0 16px;
    gap: 28px;
  }
  .footer-grid {
    gap: 28px;
  }
  .footer-brand {
    font-size: 20px;
    padding: 12px;
    gap: 16px;
  }
  .footer-logo-container {
    width: 48px;
    height: 48px;
    padding: 10px;
  }
  .icon-logo {
    width: 28px;
    height: 28px;
  }
  .footer-social-icons {
    gap: 10px;
  }
  .social-link {
    width: 40px;
    height: 40px;
  }
  .footer-social-icons svg,
  .footer-social-icons img,
  .footer-social-icons .icon-map,
  .footer-social-icons .icon-telegram,
  .footer-social-icons .icon-discord,
  .footer-social-icons .icon-wiki {
    width: 20px !important;
    height: 20px !important;
  }
  .social-title {
    font-size: 1rem;
  }
  .project-name {
    font-size: 1em;
  }
  .brand-tagline {
    font-size: 0.75em;
  }
  .copyright-text {
    font-size: 11px;
    line-height: 1.6;
  }
  .copyright-text p {
    margin: 6px 0;
  }
  .disclaimer {
    font-size: 11px;
  }
}
</style>
