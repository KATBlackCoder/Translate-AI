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

      <!-- New Button for Testing String Extraction -->
      <UButton
        v-if="
          projectStore.selectedProjectFolderPath &&
          projectStore.projectDetectionResult !== 'NotDetected'
        "
        label="Test String Extraction"
        icon="i-heroicons-beaker"
        :loading="projectStore.isExtractingStrings"
        variant="outline"
        block
        class="mt-2"
        @click="projectStore.performExtractionTest"
      />

      <!-- Display basic extraction results -->
      <div
        v-if="projectStore.extractionResult"
        class="mt-4 p-2 border rounded-md text-xs"
      >
        <p class="text-sm font-medium mb-1">Extraction Test Output:</p>
        <template v-if="typeof projectStore.extractionResult === 'string'">
          <p class="text-red-500">Error: {{ projectStore.extractionResult }}</p>
        </template>
        <template v-else-if="Array.isArray(projectStore.extractionResult)">
          <p>
            Extracted {{ projectStore.extractionResult.length }} strings. Check
            console for full details.
          </p>
          <!-- 
          <pre class="max-h-60 overflow-auto bg-gray-50 dark:bg-gray-800 p-2 rounded">{{ JSON.stringify(projectStore.extractionResult, null, 2) }}</pre>
          -->
        </template>
      </div>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import {
  useProjectStore,
  type RpgMakerDetectionResultType,
} from "~/stores/project";
// import { storeToRefs } from 'pinia'; // Not strictly needed if using projectStore.prop directly in template

const projectStore = useProjectStore();
// const { selectedProjectFolderPath, isLoadingProjectFolder, projectDetectionResult, isExtractingStrings, extractionResult } = storeToRefs(projectStore);

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
