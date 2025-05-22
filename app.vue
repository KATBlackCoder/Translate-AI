<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- <UNotifications /> Global container for Nuxt UI toasts - Removed as per implementation plan, UApp likely handles this -->
    <!-- Nuxt will automatically apply layouts/default.vue to pages -->
    <!-- unless the page specifies a different layout or layout: false. -->
    <!-- UApp provides the global context for Nuxt UI components. -->
  </UApp>
</template>

<script setup lang="ts">
// Global setup logic can go here if needed in the future,
// for example, related to color mode or other global configurations
// that might interact with <UApp> props if necessary.
</script>

<style>
/* Global styles */
body {
  margin: 0;
  /* Nuxt UI and <UApp> will handle base styling, fonts, and background colors */
}
</style>
