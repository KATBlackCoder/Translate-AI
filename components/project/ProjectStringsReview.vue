<template>
  <div class="space-y-6">
    <USeparator label="Review Extracted Strings & Configure Translation" />
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Review the strings extracted from the project files. Configure translation options and start the batch process.
    </p>
    
    <UAlert
      v-if="projectStore.isLoadingExtractedStrings && projectStore.extractedStrings.length === 0" 
      icon="i-heroicons-arrow-path"
      title="Loading Strings..."
      description="Please wait while the strings are being loaded."
      class="mt-4"
    />

    <UAlert
      v-if="!projectStore.isLoadingExtractedStrings && projectStore.extractionError"
      icon="i-heroicons-exclamation-triangle"
      color="error"
      variant="soft"
      title="Extraction Error"
      :description="projectStore.extractionError"
      class="mt-4"
    />

    <div v-if="!projectStore.isLoadingExtractedStrings && !projectStore.extractionError && projectStore.extractedStrings.length > 0" class="space-y-4">
      <p class="text-sm font-medium">
        Successfully extracted {{ projectStore.extractedStrings.length }} string(s) for review:
      </p>
      <UTable
        :data="projectStore.extractedStrings"
        class="max-h-[400px] overflow-auto" 
      />

      <!-- Batch Translation Setup Form -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
        <UFormField label="Source Language" name="batchSourceLanguage">
          <USelectMenu
            v-model="batchSourceLanguage"
            :items="settingsStore.languageOptions"
            value-key="id"
            option-attribute="label"
            placeholder="Select source language"
          />
        </UFormField>
        <UFormField label="Target Language" name="batchTargetLanguage">
          <USelectMenu
            v-model="batchTargetLanguage"
            :items="settingsStore.languageOptions"
            value-key="id"
            option-attribute="label"
            placeholder="Select target language"
          />
        </UFormField>
        <UFormField label="Translation Engine" name="batchEngine">
          <USelectMenu
            v-model="batchEngineName"
            :items="settingsStore.engineOptions"
            value-key="id"
            option-attribute="label"
            placeholder="Select engine"
          />
        </UFormField>
      </div>

      <UButton 
        label="Start Batch Translation"
        icon="i-heroicons-bolt-solid"
        size="lg"
        block
        :loading="translationStore.isLoadingBatchTranslation"
        :disabled="projectStore.extractedStrings.length === 0 || translationStore.isLoadingBatchTranslation || projectStore.isLoadingExtractedStrings"
        @click="handleBatchTranslate" 
      />
    </div>
    
    <p v-if="!projectStore.isLoadingExtractedStrings && !projectStore.extractionError && projectStore.extractedStrings.length === 0" class="text-sm text-gray-500 dark:text-gray-400 mt-4">
      No translatable strings were found in the project.
    </p>

    <!-- Batch translation results are now shown in ProjectStringsResult.vue -->
    <!-- Button to proceed is now handled by navigation to the results page or clearing state -->

  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useProjectStore } from '~/stores/project';
import { useTranslationStore } from '~/stores/translation';
import { useSettingsStore } from '~/stores/settings';

const projectStore = useProjectStore();
const translationStore = useTranslationStore();
const settingsStore = useSettingsStore();

const batchSourceLanguage = ref('ja'); 
const batchTargetLanguage = ref('en');
const batchEngineName = ref('ollama'); 

const handleBatchTranslate = () => {
  translationStore.performBatchTranslation(
    projectStore.extractedStrings,
    batchSourceLanguage.value,
    batchTargetLanguage.value,
    batchEngineName.value
  );
};

// The old proceedToTranslationSetup function is removed as this component now handles translation triggering.
// A new function might be needed if there's a step after displaying results (e.g. back to project selection)

</script>

<style scoped>
/* Add any component-specific styles here */
</style> 