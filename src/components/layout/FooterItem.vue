<template>
  <footer class="footer relative z-20">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-copyright">
          © {{ new Date().getFullYear() }} <span class="gold-text">Mysterria</span> — unofficial fan project † | All rights reserved
        </div>
        <nav class="footer-nav">
          <RouterLink class="footer-link" to="/wiki">{{ t('navWiki') }}</RouterLink>
          <RouterLink class="footer-link" to="/guide">{{ t('navGame') }}</RouterLink>
          <RouterLink class="footer-link" to="/store">{{ t('navShop') }}</RouterLink>
          <div class="footer-separator" aria-hidden="true">†</div>
          <RouterLink class="footer-link" to="/terms">{{ t('termsViewTitle') || 'Terms' }}</RouterLink>
          <RouterLink class="footer-link" to="/privacy">{{ t('privacyViewTitle') || 'Privacy' }}</RouterLink>
          <RouterLink class="footer-link" to="/sla">{{ t('slaViewTitle') || 'SLA' }}</RouterLink>
        </nav>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from "@/composables/useI18n";
const { t } = useI18n();
</script>

<style scoped>
.footer {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: #05070a;
  padding: 40px 0;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
}

@media (min-width: 1024px) {
  .footer-content {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
}

.footer-copyright {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #444;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.gold-text {
  color: var(--myst-gold);
  font-weight: 700;
}

.footer-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.footer-link {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #666;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: var(--myst-gold);
}

.footer-separator {
  color: rgba(200, 178, 115, 0.3);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  user-select: none;
}

@media (max-width: 640px) {
  .footer-separator {
    display: none;
  }
}
</style>
