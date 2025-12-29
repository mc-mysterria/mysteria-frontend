<template>
  <footer class="footer relative z-20">
    <div class="footer-container">
      <div class="footer-content">
        <div class="flex-1">
          © {{ new Date().getFullYear() }} Mysterria — unofficial fan project ✨ | All rights reserved | Not affiliated
          with original IPs
        </div>
        <nav class="footer-nav">
          <RouterLink class="footer-link" to="/wiki">Wiki</RouterLink>
          <RouterLink class="footer-link" to="/guide">Guide</RouterLink>
          <RouterLink class="footer-link" to="/store">Shop</RouterLink>
        </nav>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid color-mix(in srgb, white 10%, transparent);
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  backdrop-filter: blur(8px);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #a1a1aa;
  text-align: center;
}

@media (min-width: 640px) {
  .footer-content {
    flex-direction: row;
    text-align: left;
  }
}

.flex-1 {
  flex: 1;
}

.footer-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer-link {
  color: var(--myst-ink);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--myst-gold);
}
</style>
