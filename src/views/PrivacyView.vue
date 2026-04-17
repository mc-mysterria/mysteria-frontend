<template>
  <HeaderItem />
  <main class="legal-page">
    <div class="legal-container">
      <h1 class="legal-title">Privacy Policy</h1>
      <p class="legal-date">Last Updated: April 17, 2026</p>

      <section class="legal-section">
        <h2>1. Information We Collect</h2>
        <p>
          We only collect information necessary to provide and manage our services. This includes:
        </p>
        <ul>
          <li><strong>Discord ID and Username:</strong> Collected via OAuth2 when you log in to link your Discord account.</li>
          <li><strong>Minecraft UUID:</strong> Collected when you verify your account in-game to link your Minecraft character.</li>
          <li><strong>Transaction History:</strong> Details of donations made through our shop.</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>2. How We Use Information</h2>
        <p>
          Your data is used to:
        </p>
        <ul>
          <li>Authenticate your access to the web portal.</li>
          <li>Manage your in-game ranks and virtual items.</li>
          <li>Communicate with you regarding your account or donations.</li>
          <li>Ensure security by monitoring for account abuse (e.g., duplicate accounts on the game server).</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>3. Data Storage and Security</h2>
        <p>
          We take reasonable measures to protect your information. IP addresses are processed on the game server for security reasons but are not stored in our primary web database. We do not sell or share your data with third parties for marketing purposes.
        </p>
      </section>

      <section class="legal-section">
        <h2>4. Third-Party Services</h2>
        <p>
          We utilize third-party services for specific functions:
        </p>
        <ul>
          <li><strong>Discord:</strong> For authentication and community management.</li>
          <li><strong>Payment Providers:</strong> To process donations securely. We do not store your full payment information on our servers.</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>5. Your Rights</h2>
        <p>
          You may request a copy of the data we have stored about you or request its deletion at any time by contacting our support team via Discord. Deleting your data will result in the loss of access to your linked account and any associated virtual items.
        </p>
      </section>

      <section class="legal-section">
        <h2>6. Contact</h2>
        <p>
          If you have any questions about this Privacy Policy, please reach out to ikeepcalm or the Mysterria Team on our official Discord.
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

.legal-section p, .legal-section ul {
  font-size: 16px;
  line-height: 1.7;
  color: var(--myst-ink-muted);
  margin-bottom: 16px;
}

.legal-section ul {
  padding-left: 20px;
  list-style-type: disc;
}

.legal-section li {
  margin-bottom: 8px;
}

@media (max-width: 640px) {
  .legal-title {
    font-size: 2rem;
  }
}
</style>
