<template>
  <div class="p-4 space-y-4">
    <!-- Show Review component if strings are extracted but not yet batch translated (and no batch error from translationStore) -->
    <ProjectStringsReview 
      v-if="projectStore.extractedStrings.length > 0 && 
            translationStore.batchTranslatedStrings.length === 0 && 
            !translationStore.batchTranslationError"
    />
    
    <!-- Show Results component if batch translation has been attempted (results exist or batch error occurred in translationStore) -->
    <ProjectStringsResult 
      v-else-if="translationStore.batchTranslatedStrings.length > 0 || translationStore.batchTranslationError" 
    />

    <!-- Fallback message if no strings extracted or other unexpected state -->
    <div v-else>
      <p v-if="projectStore.isLoadingExtractedStrings" class="text-center text-gray-500 dark:text-gray-400">
        Loading project strings...
      </p>
      <p v-else-if="projectStore.extractionError" class="text-center text-red-500 dark:text-red-400">
        Error during string extraction: {{ projectStore.extractionError }}
      </p>
      <p v-else-if="projectStore.selectedProjectFolderPath && projectStore.extractedStrings.length === 0 && !projectStore.isLoadingExtractedStrings && !translationStore.batchTranslationError && translationStore.batchTranslatedStrings.length === 0" class="text-center text-gray-500 dark:text-gray-400">
        No translatable strings were found in the selected project. You can select another project from the main page.
      </p>
      <p v-else class="text-center text-gray-500 dark:text-gray-400">
        Please select a project from the main page to begin.
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useProjectStore } from '~/stores/project';
import { useTranslationStore } from '~/stores/translation'; // Import translation store
// ProjectStringsReview and ProjectStringsResult are auto-imported by Nuxt 3.

const projectStore = useProjectStore();
const translationStore = useTranslationStore(); // Use translation store
</script> 