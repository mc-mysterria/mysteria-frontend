<template>
  <div class="legal-ritual-page page-container">
    <HeaderItem/>
    <main class="legal-ritual-main">
      <div class="legal-ritual-container">
        <!-- Unified Header -->
        <div class="myst-page-header">
          <div class="myst-header-decoration" aria-hidden="true"></div>
          <h1 class="myst-header-label">{{ t('privacyViewTitle') || 'Privacy Policy' }}</h1>
          <div class="myst-header-decoration" aria-hidden="true"></div>
        </div>

        <div class="legal-ledger">
          <div class="ledger-meta">
            <span class="ledger-date">Last Invocation: April 17, 2026</span>
          </div>

          <section class="ledger-section">
            <h2 class="ledger-title">1. Information We Collect</h2>
            <div class="ledger-content">
              <p>We only collect information necessary to provide and manage our services. This includes:</p>
              <ul class="ledger-list">
                <li><span class="gold-bullet">†</span> <strong>Discord ID and Username:</strong> Collected via OAuth2 when you log in to link your Discord account.</li>
                <li><span class="gold-bullet">†</span> <strong>Minecraft UUID:</strong> Collected when you verify your account in-game to link your Minecraft character.</li>
                <li><span class="gold-bullet">†</span> <strong>Transaction History:</strong> Details of donations made through our shop.</li>
              </ul>
            </div>
          </section>

          <section class="ledger-section">
            <h2 class="ledger-title">2. How We Use Information</h2>
            <div class="ledger-content">
              <p>Your data is used to:</p>
              <ul class="ledger-list">
                <li><span class="gold-bullet">†</span> Authenticate your access to the web portal.</li>
                <li><span class="gold-bullet">†</span> Manage your in-game ranks and virtual items.</li>
                <li><span class="gold-bullet">†</span> Communicate with you regarding your account or donations.</li>
                <li><span class="gold-bullet">†</span> Ensure security by monitoring for account abuse.</li>
              </ul>
            </div>
          </section>

          <section class="ledger-section">
            <h2 class="ledger-title">3. Data Storage and Security</h2>
            <div class="ledger-content">
              <p>We take reasonable measures to protect your information. IP addresses are processed on the game server for security reasons but are not stored in our primary web database. We do not sell or share your data with third parties for marketing purposes.</p>
            </div>
          </section>

          <section class="ledger-section">
            <h2 class="ledger-title">4. Third-Party Services</h2>
            <div class="ledger-content">
              <p>We utilize third-party services for specific functions:</p>
              <ul class="ledger-list">
                <li><span class="gold-bullet">†</span> <strong>Discord:</strong> For authentication and community management.</li>
                <li><span class="gold-bullet">†</span> <strong>Payment Providers:</strong> To process donations securely.</li>
              </ul>
            </div>
          </section>

          <section class="ledger-section">
            <h2 class="ledger-title">5. Your Rights</h2>
            <div class="ledger-content">
              <p>You may request a copy of the data we have stored about you or request its deletion at any time by contacting our support team via Discord. Deleting your data will result in the loss of access to your linked account.</p>
            </div>
          </section>

          <section class="ledger-section">
            <h2 class="ledger-title">6. Contact</h2>
            <div class="ledger-content">
              <p>If you have any questions about this Privacy Policy, please reach out to ikeepcalm or the Mysterria Team on our official Discord.</p>
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
