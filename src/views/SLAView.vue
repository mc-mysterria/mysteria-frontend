<template>
  <HeaderItem />
  <main class="legal-page">
    <div class="legal-container">
      <h1 class="legal-title">Service Level Agreement (SLA)</h1>
      <p class="legal-date">Last Updated: April 17, 2026</p>

      <section class="legal-section">
        <h2>1. Overview</h2>
        <p>
          This Service Level Agreement ("SLA") outlines the service expectations for Mysterria's game server and web portal. As Mysterria is an unofficial fan project managed by a small team, this agreement is intended to provide transparency rather than legally binding uptime guarantees.
        </p>
      </section>

      <section class="legal-section">
        <h2>2. Service Availability</h2>
        <p>
          We operate on a <strong>"Best Effort"</strong> basis. Our goal is to provide maximum uptime for both the Minecraft server and the web portal. However, we do not guarantee 100% availability.
        </p>
      </section>

      <section class="legal-section">
        <h2>3. Maintenance Windows</h2>
        <p>
          Regular maintenance is required to ensure the stability and security of our systems.
        </p>
        <ul>
          <li><strong>Scheduled Maintenance:</strong> We aim to provide at least 24 hours' notice for any planned downtime via our Discord community.</li>
          <li><strong>Emergency Maintenance:</strong> In critical situations (e.g., security vulnerabilities or hardware failure), we may perform maintenance without prior notice.</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>4. Support Response Times</h2>
        <p>
          Support is primarily handled via our community Discord. Response times vary based on staff availability and the complexity of the issue. We do not provide 24/7 dedicated support.
        </p>
      </section>

      <section class="legal-section">
        <h2>5. Limitations</h2>
        <p>
          Mysterria is not responsible for any downtime caused by:
        </p>
        <ul>
          <li>Upstream provider outages (e.g., hosting providers, Discord API).</li>
          <li>User-side connectivity issues.</li>
          <li>Distributed Denial of Service (DDoS) attacks.</li>
          <li>Natural disasters or other "Act of God" events.</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>6. Data Integrity</h2>
        <p>
          While we perform regular backups of our databases and game worlds, we are not liable for any data loss that may occur. Users are encouraged to report any missing virtual items or progress to the support team immediately.
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
