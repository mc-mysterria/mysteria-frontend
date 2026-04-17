<template>
  <HeaderItem />
  <main class="legal-page">
    <div class="legal-container">
      <h1 class="legal-title">Terms of Service</h1>
      <p class="legal-date">Last Updated: April 17, 2026</p>

      <section class="legal-section">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing the Mysterria Minecraft server or using this website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
        </p>
      </section>

      <section class="legal-section">
        <h2>2. Donations and Virtual Items</h2>
        <p>
          Payments made to Mysterria are considered voluntary donations. These donations support the maintenance and development of the project. In return, you may receive virtual items, ranks, or other in-game benefits.
        </p>
        <p>
          <strong>No Refunds:</strong> All donations are final. Since virtual items are delivered immediately upon successful transaction, we do not offer refunds, exchanges, or returns under any circumstances.
        </p>
      </section>

      <section class="legal-section">
        <h2>3. User Conduct</h2>
        <p>
          Players must adhere to the community rules established for both the game server and the Discord community. Failure to follow these rules may result in temporary or permanent suspension of your access to Mysterria without notice or refund of any donations.
        </p>
        <p>
          Our full rules can be found at <RouterLink to="/rules" class="legal-link">mysterria.net/rules</RouterLink>.
        </p>
      </section>

      <section class="legal-section">
        <h2>4. Age Requirement</h2>
        <p>
          By using our services, you confirm that you are at least 13 years of age. This requirement aligns with the policies of our primary authentication provider, Discord.
        </p>
      </section>

      <section class="legal-section">
        <h2>5. Limitation of Liability</h2>
        <p>
          Mysterria is an unofficial fan project and is not affiliated with Mojang AB, Microsoft, or any other intellectual property holders. The service is provided "as is" without warranties of any kind. ikeepcalm and the Mysterria Team are not liable for any damages arising from your use of the server or website.
        </p>
      </section>

      <section class="legal-section">
        <h2>6. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Continued use of our services after changes are posted constitutes your acceptance of the new terms.
        </p>
      </section>
    </div>
  </main>
  <FooterItem />
</template>

<script setup lang="ts">
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
</script>

<style scoped>
.legal-page {
  padding: 120px 16px 80px;
  background: var(--myst-bg);
  color: var(--myst-ink);
  min-height: 100vh;
}

.legal-container {
  max-width: 800px;
  margin: 0 auto;
}

.legal-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--myst-ink-strong);
  margin-bottom: 8px;
  font-family: "Inter", system-ui, sans-serif;
}

.legal-date {
  font-size: 14px;
  color: var(--myst-ink-muted);
  margin-bottom: 48px;
}

.legal-section {
  margin-bottom: 32px;
}

.legal-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--myst-ink-strong);
  margin-bottom: 16px;
  font-family: "Inter", system-ui, sans-serif;
}

.legal-section p {
  font-size: 16px;
  line-height: 1.7;
  color: var(--myst-ink-muted);
  margin-bottom: 16px;
}

.legal-link {
  color: var(--myst-gold);
  text-decoration: none;
  font-weight: 500;
}

.legal-link:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .legal-title {
    font-size: 2rem;
  }
}
</style>
