<template>
  <img
      class="icon-logo"
      src="@/assets/icons/sources/IconLogo.webp"
      alt="Логотип Mysterria"
      role="img"
      aria-label="Логотип Mysterria"
      tabindex="0"
      fetchpriority="high"
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
