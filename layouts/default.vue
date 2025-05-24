<template>
  <div class="min-h-screen bg-background text-foreground">
    <LayoutHeader />
    <main class="pt-4 pb-8 px-4">
      <UContainer class="w-full">
        <slot />
      </UContainer>
    </main>
    <!-- Optional: <AppFooter /> could go here -->
  </div>
</template>

<script lang="ts" setup>
// import AppHeader from '~/components/AppHeader.vue'; // No longer needed due to Nuxt 3 auto-imports

// No specific script setup needed for this basic layout beyond imports yet.
</script>

<style>
/* body {
  @apply bg-background text-foreground;
} */
/* Using Nuxt UI's approach, background and text colors are often handled by app.config or global styles */
/* The div.min-h-screen with bg-background should cover most cases */
</style>