<template>
  <div class="legal-ritual-page page-container">
    <HeaderItem/>
    <main class="legal-ritual-main">
      <div class="legal-ritual-container">
        <!-- Unified Header -->
        <div class="myst-page-header">
          <div class="myst-header-decoration" aria-hidden="true"></div>
          <h1 class="myst-header-label">{{ t('termsViewTitle') || 'Terms of Service' }}</h1>
          <div class="myst-header-decoration" aria-hidden="true"></div>
        </div>

        <div class="legal-ledger">
          <div class="ledger-meta">
            <span class="ledger-date">Last Invocation: April 17, 2026</span>
          </div>

          <section class="ledger-section">
            <h2 class="ledger-title">1. Acceptance of Terms</h2>
            <div class="ledger-content">
              <p>By accessing the Mysterria Minecraft server or using this website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
            </div>
          </section>

          <section class="ledger-section">
            <h2 class="ledger-title">2. Donations and Virtual Items</h2>
            <div class="ledger-content">
              <p>Payments made to Mysterria are considered voluntary donations. These donations support the maintenance and development of the project. In return, you may receive virtual items, ranks, or other in-game benefits.</p>
              <p><strong>No Refunds:</strong> All donations are final. Since virtual items are delivered immediately, we do not offer refunds, exchanges, or returns under any circumstances.</p>
            </div>
          </section>

          <section class="ledger-section">
            <h2 class="ledger-title">3. User Conduct</h2>
            <div class="ledger-content">
              <p>Players must adhere to the community rules established for both the game server and the Discord community. Failure to follow these rules may result in suspension without notice.</p>
              <p>Our full rules can be found at <RouterLink to="/rules" class="ledger-link">mysterria.net/rules</RouterLink>.</p>
            </div>
          </section>

          <section class="ledger-section">
            <h2 class="ledger-title">4. Age Requirement</h2>
            <div class="ledger-content">
              <p>By using our services, you confirm that you are at least 13 years of age. This requirement aligns with the policies of our primary authentication provider, Discord.</p>
            </div>
          </section>

          <section class="ledger-section">
            <h2 class="ledger-title">5. Limitation of Liability</h2>
            <div class="ledger-content">
              <p>Mysterria is an unofficial fan project and is not affiliated with Mojang AB or Microsoft. The service is provided "as is" without warranties. ikeepcalm and the Mysterria Team are not liable for any damages.</p>
            </div>
          </section>

          <section class="ledger-section">
            <h2 class="ledger-title">6. Changes to Terms</h2>
            <div class="ledger-content">
              <p>We reserve the right to modify these terms at any time. Continued use of our services after changes are posted constitutes your acceptance of the new terms.</p>
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

.ledger-link { color: var(--myst-gold); text-decoration: none; border-bottom: 1px solid rgba(200, 178, 115, 0.3); transition: all 0.3s; }
.ledger-link:hover { border-bottom-color: var(--myst-gold); background: rgba(200, 178, 115, 0.05); }

@media (max-width: 768px) {
  .legal-ledger { padding: 32px 24px; }
  .legal-ritual-main { padding-top: 100px; }
}
</style>
