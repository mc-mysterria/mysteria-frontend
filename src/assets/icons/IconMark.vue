<template>
  <!--
    The Mark — Mysterria's own currency.
    Drawn in the redesign's language: hairline rings echoing the ritual circles
    on the home hero, and an M monogram struck through the middle. Everything is
    `currentColor`, so it takes gold, muted ink or on-gold from its context
    instead of carrying a colour of its own.
  -->
  <svg
      class="icon-mark"
      fill="none"
      role="img"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
  >
    <title>Marks</title>
    <circle cx="12" cy="12" r="10.2" stroke-width="1"/>
    <circle cx="12" cy="12" r="7.6" stroke-dasharray="1.6 2.4" stroke-width="0.7" opacity="0.45"/>
    <path
        d="M8.6 15.6V9.1l3.4 3.8 3.4-3.8v6.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
    />
  </svg>
</template>

<style scoped>
.icon-mark {
  width: 1em;
  height: 1em;
  display: block;
  flex-shrink: 0;
}
</style>
