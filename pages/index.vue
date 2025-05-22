<template>
  <div class="space-y-8">
    <UCard>
      <template #header>
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          Single Text Translation
        </h3>
      </template>
      <SingleTextTranslator />
    </UCard>

    <UCard>
      <template #header>
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          Project Translation (Batch)
        </h3>
      </template>
      <ProjectTranslator />
    </UCard>
  </div>
  
  <!-- 
    The main UCard with "AI Game Translator" title and footer 
    can be removed if AppHeader now serves as the main title, 
    and pages/index.vue is just for arranging these feature cards.
    Or, it can be kept if you prefer that page-level card structure.
    For now, I'm creating a new structure with two cards, 
    assuming AppHeader is the main title for the app window.
  -->
</template>

<script lang="ts" setup>
// Nuxt 3 auto-imports components:
// import SingleTextTranslator from '~/components/SingleTextTranslator.vue';
// import ProjectTranslator from '~/components/ProjectTranslator.vue';

// No specific script logic needed in pages/index.vue for now,
// as child components handle their own logic and state via Pinia.
</script>

<style>
/* Styles can remain or be added here if needed for page-level layout */
</style>