<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold">Project Translator</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Select an RPG Maker MV project folder to extract and translate texts.
      </p>
    </template>

    <div class="space-y-4">
      <UButton
        label="Select Project Folder"
        icon="i-heroicons-folder-open"
        :loading="projectStore.isLoadingProjectFolder"
        block
        @click="projectStore.selectProjectFolder"
      />

      <div
        v-if="projectStore.selectedProjectFolderPath"
        class="mt-4 p-2 border rounded-md"
      >
        <p class="text-sm font-medium">Selected Project:</p>
        <p class="text-xs text-gray-600 dark:text-gray-300 break-all">
          {{ projectStore.selectedProjectFolderPath }}
        </p>
        <p
          v-if="projectStore.projectDetectionResult"
          class="text-xs mt-1"
          :class="{
            'text-green-600 dark:text-green-400':
              projectStore.projectDetectionResult !== 'NotDetected',
            'text-red-600 dark:text-red-400':
              projectStore.projectDetectionResult === 'NotDetected',
          }"
        >
          Detection:
          {{ friendlyDetectionResult(projectStore.projectDetectionResult) }}
        </p>
      </div>

      <!-- "Extract Strings" Button - REMOVED -->
      <!-- 
      <UButton
        v-if="
          projectStore.selectedProjectFolderPath &&
          projectStore.projectDetectionResult !== 'NotDetected'
        "
        label="Extract Strings" 
        icon="i-heroicons-beaker" 
        :loading="projectStore.isLoadingExtractedStrings" 
        variant="outline"
        block
        class="mt-2"
        @click="projectStore.extractProjectStrings" 
      />
      -->

      <!-- Display Extraction Error (This might be moved or handled differently if extraction is automatic) -->
      <UAlert
        v-if="projectStore.extractionError"
        icon="i-heroicons-exclamation-triangle"
        color="error"
        variant="soft"
        title="Extraction Error"
        :description="projectStore.extractionError"
        class="mt-4"
      />

      <!-- Display Extracted Strings Summary and Table - REMOVED -->
      <!-- 
      <div v-if="projectStore.extractedStrings.length > 0 && !projectStore.extractionError" class="mt-4 space-y-2">
        <p class="text-sm font-medium">
          Successfully extracted {{ projectStore.extractedStrings.length }} string(s):
        </p>

        <UTable
          :data="projectStore.extractedStrings"
          class="max-h-96 overflow-auto"
        />
        
      </div>
      -->
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import { useProjectStore } from "~/stores/project";
import type { RpgMakerDetectionResultType } from "~/types/project";
// ProjectBatchTranslationControls is auto-imported by Nuxt 3 from components/project/BatchTranslationControls.vue

const projectStore = useProjectStore();

const friendlyDetectionResult = (
  result: RpgMakerDetectionResultType | null
): string => {
  if (!result) return "N/A";
  switch (result) {
    case "DetectedByProjectFile":
      return "RPG Maker MV (Project File)";
    case "DetectedByWwwData":
      return "RPG Maker MV (www/data Structure)";
    case "NotDetected":
      return "Not a recognized RPG Maker MV project";
    default:
      return "Unknown detection result";
  }
};

// No need for local handleSelectProjectFolder or performExtractionTest if called directly on projectStore in template
</script>

<style>
/* Component-specific styles */
</style>
