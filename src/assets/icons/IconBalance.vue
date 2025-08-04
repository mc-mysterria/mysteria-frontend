<template>
  <svg
    class="icon-balance"
    width="24"
    height="25"
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Mysterria balance icon"
    tabindex="0"
  >
    <path
      d="M12 21.5C16.9706 21.5 21 17.4706 21 12.5C21 7.52944 16.9706 3.5 12 3.5C7.02944 3.5 3 7.52944 3 12.5C3 17.4706 7.02944 21.5 12 21.5Z"
      stroke="#EE7828"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- Stylized uppercase M -->
    <path
      d="M8.5 16.5V8.5H10.2L12 11.7L13.8 8.5H15.5V16.5H13.9V11.9L12 15.1L10.1 11.9V16.5H8.5Z"
      fill="#EE7828"
    />
    <!-- Decorative circles -->
    <circle
      cx="12"
      cy="12.5"
      r="2"
      fill="none"
      stroke="#EE7828"
      stroke-width="0.8"
      opacity="0.6"
    />
    <circle
      cx="12"
      cy="12.5"
      r="4"
      fill="none"
      stroke="#EE7828"
      stroke-width="0.4"
      opacity="0.3"
    />
  </svg>
</template>

<style scoped>
.icon-balance {
  width: 24px;
  height: 25px;
  display: block;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 8px rgba(138, 43, 226, 0.3));
}

.icon-balance:hover {
  transform: scale(1.1) rotate(5deg);
  filter: drop-shadow(0 0 12px rgba(138, 43, 226, 0.6));
}

@keyframes mystical-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

.icon-balance circle {
  animation: mystical-pulse 3s ease-in-out infinite;
}

.icon-balance circle:nth-of-type(1) {
  animation-delay: 0s;
}
.icon-balance circle:nth-of-type(2) {
  animation-delay: 0.5s;
}
</style>
