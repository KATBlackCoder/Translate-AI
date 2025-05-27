<template>
  <UCard variant="outline">
      <template #header>
      <p class="text-lg font-semibold">Project Selection</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Select an RPG Maker MV project folder to begin.
      </p>
      </template>
    <ProjectSelector />
    <!-- SingleTextTranslator removed -->
    <!-- Navigation to /review is handled by projectStore after successful extraction -->
    </UCard>
</template>

<script lang="ts" setup>
// ProjectSelector component is auto-imported by Nuxt 3.
// No navigation logic needed here as it's handled by the projectStore.
</script>

<style>
/* Styles can remain or be added here if needed for page-level layout */
</style>
