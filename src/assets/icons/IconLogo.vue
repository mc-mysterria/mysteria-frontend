<template>
  <img
      alt="Логотип Mysterria"
      aria-label="Логотип Mysterria"
      class="icon-logo"
      fetchpriority="high"
      role="img"
      src="@/assets/icons/sources/IconLogo.webp"
      tabindex="0"
  />
</template>

<style scoped>
.icon-logo {
  width: 45px;
  height: 45px;
  transition: all 0.2s ease;
  display: block;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.icon-logo:hover {
  transform: scale(1.1) rotate(-5deg);
}

.icon-logo:active {
  transform: scale(0.95);
}
</style>
