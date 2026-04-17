<template>
  <div class="legal-ritual-page page-container">
    <HeaderItem/>
    <main class="legal-ritual-main">
      <div class="legal-ritual-container">
        <!-- Unified Header -->
        <div class="myst-page-header">
          <div class="myst-header-decoration" aria-hidden="true"></div>
          <h1 class="myst-header-label">{{ t('slaViewTitle') || 'Service Level Agreement' }}</h1>
          <div class="myst-header-decoration" aria-hidden="true"></div>
        </div>

        <div class="legal-ledger">
          <div class="ledger-meta">
            <span class="ledger-date">Last Invocation: April 17, 2026</span>
          </div>

          <section class="ledger-section">
            <h2 class="ledger-title">1. Overview</h2>
            <div class="ledger-content">
              <p>This Service Level Agreement ("SLA") outlines the service expectations for Mysterria's game server and web portal. As Mysterria is an unofficial fan project managed by a small team, this agreement is intended to provide transparency rather than legally binding uptime guarantees.</p>
            </div>
          </section>

          <section class="ledger-section">
            <h2 class="ledger-title">2. Service Availability</h2>
            <div class="ledger-content">
              <p>We operate on a <strong>"Best Effort"</strong> basis. Our goal is to provide maximum uptime for both the Minecraft server and the web portal. However, we do not guarantee 100% availability.</p>
            </div>
          </section>

          <section class="ledger-section">
            <h2 class="ledger-title">3. Maintenance Windows</h2>
            <div class="ledger-content">
              <p>Regular maintenance is required to ensure the stability and security of our systems.</p>
              <ul class="ledger-list">
                <li><span class="gold-bullet">†</span> <strong>Scheduled Maintenance:</strong> We aim to provide at least 24 hours' notice for any planned downtime via our Discord community.</li>
                <li><span class="gold-bullet">†</span> <strong>Emergency Maintenance:</strong> In critical situations, we may perform maintenance without prior notice.</li>
              </ul>
            </div>
          </section>

          <section class="ledger-section">
            <h2 class="ledger-title">4. Support Response Times</h2>
            <div class="ledger-content">
              <p>Support is primarily handled via our community Discord. Response times vary based on staff availability and the complexity of the issue. We do not provide 24/7 dedicated support.</p>
            </div>
          </section>

          <section class="ledger-section">
            <h2 class="ledger-title">5. Limitations</h2>
            <div class="ledger-content">
              <p>Mysterria is not responsible for any downtime caused by:</p>
              <ul class="ledger-list">
                <li><span class="gold-bullet">†</span> Upstream provider outages (e.g., hosting providers, Discord API).</li>
                <li><span class="gold-bullet">†</span> User-side connectivity issues or DDoS attacks.</li>
                <li><span class="gold-bullet">†</span> Natural disasters or other "Act of God" events.</li>
              </ul>
            </div>
          </section>

          <section class="ledger-section">
            <h2 class="ledger-title">6. Data Integrity</h2>
            <div class="ledger-content">
              <p>While we perform regular backups, we are not liable for any data loss that may occur. Users are encouraged to report any missing virtual items or progress immediately.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
    <FooterItem/>
  </div>
</template>

<script lang="ts" setup>
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
import {useI18n} from "@/composables/useI18n";

const {t} = useI18n();
</script>

<style scoped>
.legal-ritual-page { background-color: #05070a; min-height: 100vh; display: flex; flex-direction: column; }
.legal-ritual-main { flex: 1; padding: 120px 24px 80px; }
.legal-ritual-container { max-width: 900px; margin: 0 auto; }

.legal-ledger {
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 60px;
  position: relative;
}

.ledger-meta { text-align: center; margin-bottom: 60px; }
.ledger-date {
  font-family: 'JetBrains Mono', monospace; font-size: 12px;
  color: #444; text-transform: uppercase; letter-spacing: 2px;
}

.ledger-section { margin-bottom: 48px; }
.ledger-title {
  font-family: 'Playfair Display', serif; font-size: 24px;
  color: var(--myst-gold); margin-bottom: 24px; font-weight: 700;
}

.ledger-content { font-size: 16px; line-height: 1.8; color: #ccc; }
.ledger-content p { margin-bottom: 20px; }

.ledger-list { list-style: none; padding: 0; }
.ledger-list li { display: flex; gap: 16px; margin-bottom: 12px; align-items: flex-start; }
.gold-bullet { color: var(--myst-gold); font-family: 'Playfair Display', serif; opacity: 0.6; }

@media (max-width: 768px) {
  .legal-ledger { padding: 32px 24px; }
  .legal-ritual-main { padding-top: 100px; }
}
</style>
