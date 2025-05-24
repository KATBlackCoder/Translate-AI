<template>
  <header class="bg-primary-100 dark:bg-primary-800 p-4 flex justify-between items-center shadow-md">
    <h1 class="text-xl font-semibold text-primary-700 dark:text-primary-200">AI Game Translator</h1>
    <div>
      <UTooltip text="Settings">
        <UButton
          icon="i-heroicons-cog-6-tooth"
          size="md"
          color="primary"
          square
          variant="ghost"
          @click="openSettings"
        />
      </UTooltip>
      <!-- Future: Theme toggle could go here -->
    </div>
  </header>
</template>

<script lang="ts" setup>
// import { useUIStore } from '~/stores/ui'; // Example if settings were a modal managed by a store
// const uiStore = useUIStore();

function openSettings() {
  // For now, just log. Later this could open a modal or navigate to a settings page.
  console.log('Settings button clicked');
  // uiStore.openSettingsModal(); // Example
}
</script>

<style>
/* No specific styles needed here if Tailwind/NuxtUI handles everything */
</style> 