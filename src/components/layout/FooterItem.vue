<template>
  <footer>
    <div class="footer-content-wrapper">
      <div class="footer-main">
        <RouterLink to="/" class="footer-brand">
          <div class="footer-logo-container">
            <IconLogo />
          </div>
          <span class="project-name">{{ t('serverName') }}</span>
        </RouterLink>
        <div class="footer-social-icons">
          <a
            v-for="url in urls"
            :key="url.name"
            :href="url.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="url.name"
            :data-tooltip="url.tooltip"
          >
            <component :is="url.icon" />
          </a>
        </div>
      </div>
      <div class="footer-legal">
        <div class="copyright-text">
          <p>
            {{ t('copyright') }} {{ t('serverName') }}. {{ t('rights') }}.<br />
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
  background: linear-gradient(
    135deg,
    rgb(26, 29, 36) 0%,
    rgb(42, 46, 59) 50%,
    rgb(26, 29, 36) 100%
  );
  padding: 50px 0;
  font-size: 16px;
  color: rgb(224, 224, 224);
  font-family: "Montserrat", sans-serif;
  position: relative;
  overflow: hidden;
}
footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(108, 93, 211, 0.5) 50%,
    transparent 100%
  );
}

.footer-content-wrapper {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}
.footer-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}
.footer-brand {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.3s;
  cursor: pointer;
}
.footer-brand:hover {
  transform: translateY(-2px);
}
.footer-logo-container {
  overflow: visible;
  width: fit-content;
  padding: 12px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 50%;
  margin-right: 18px;
  transition: 0.3s;
}
.footer-logo-container:hover {
  overflow: visible;
  transform: scale(1.05);
  box-shadow: rgba(108, 93, 211, 0.5) 0px 2px 0px inset;
}
.icon-logo {
  width: 36px;
  height: 36px;
}
.project-name {
  background: linear-gradient(
    135deg,
    rgb(238, 120, 40) 0%,
    rgb(255, 140, 66) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  font-weight: 700;
  text-shadow: rgba(238, 120, 40, 0.3) 0px 2px 8px;
}
.footer-social-icons {
  display: flex;
  align-items: center;
  gap: 18px;
}
.footer-social-icons a {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  text-decoration: none;
  transition: transform 0.3s;
  box-shadow: rgba(108, 93, 211, 0.5) 0px 1.5px 0px inset;
}
.footer-social-icons a:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: rgba(108, 93, 211, 0.2) 0px 3px 0px inset;
}
.footer-social-icons svg,
.footer-social-icons img,
.footer-social-icons .icon-map,
.footer-social-icons .icon-telegram,
.footer-social-icons .icon-discord,
.footer-social-icons .icon-wiki {
  transition: 0.3s;
  width: 20px !important;
  height: 20px !important;
  fill: rgba(255, 255, 255, 0.5) !important;
}
.footer-social-icons a:hover svg * {
  fill: #fff !important;
}
.footer-social-icons a::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
}
.footer-social-icons a::before {
  content: "";
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  border: 6px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
}
.footer-social-icons a:hover::after,
.footer-social-icons a:hover::before {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}
.footer-legal {
  display: flex;
  justify-content: center;
  align-items: center;
}
.copyright-text {
  color: rgb(180, 187, 197);
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
}
.copyright-text p {
  margin: 5px 0;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  footer {
    padding: 45px 0;
  }
  .footer-content-wrapper {
    max-width: 100%;
    padding: 0 24px;
    gap: 28px;
  }
  .footer-brand {
    font-size: 22px;
  }
  .footer-logo-container {
    padding: 10px;
    margin-right: 16px;
  }
  .footer-social-icons {
    gap: 16px;
  }
  .footer-social-icons a {
    width: 42px;
    height: 42px;
  }
}
@media (max-width: 992px) {
  footer {
    padding: 40px 0;
  }
  .footer-content-wrapper {
    padding: 0 20px;
    gap: 25px;
  }
  .footer-main {
    gap: 18px;
  }
  .footer-brand {
    font-size: 20px;
  }
  .footer-logo-container {
    padding: 9px;
    margin-right: 14px;
  }
  .footer-social-icons {
    gap: 14px;
  }
  .footer-social-icons a {
    width: 40px;
    height: 40px;
  }
  .copyright-text {
    font-size: 13px;
  }
}
@media (max-width: 768px) {
  footer {
    padding: 35px 0;
  }
  .footer-content-wrapper {
    padding: 0 16px;
    gap: 22px;
  }
  .footer-main {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  .footer-brand {
    margin-bottom: 0;
    font-size: 18px;
  }
  .footer-logo-container {
    padding: 8px;
    margin-right: 12px;
  }
  .footer-social-icons {
    gap: 12px;
  }
  .footer-social-icons a {
    width: 38px;
    height: 38px;
  }
  .copyright-text {
    font-size: 12px;
  }
}
@media (max-width: 480px) {
  footer {
    padding: 30px 0;
  }
  .footer-content-wrapper {
    padding: 0 12px;
    gap: 20px;
  }
  .footer-main {
    gap: 16px;
  }
  .footer-brand {
    font-size: 16px;
  }
  .footer-logo-container {
    padding: 7px;
    margin-right: 10px;
  }
  .icon-logo {
    width: 30px;
    height: 30px;
  }
  .footer-social-icons {
    gap: 10px;
  }
  .footer-social-icons a {
    width: 36px;
    height: 36px;
  }
  .footer-social-icons svg,
  .footer-social-icons img,
  .footer-social-icons .icon-map,
  .footer-social-icons .icon-telegram,
  .footer-social-icons .icon-discord,
  .footer-social-icons .icon-wiki {
    width: 18px !important;
    height: 18px !important;
  }
  .copyright-text {
    font-size: 11px;
    line-height: 1.5;
  }
  .copyright-text p {
    margin: 3px 0;
  }
}
</style>
