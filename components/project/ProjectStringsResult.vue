<template>
  <div v-if="translationStore.batchTranslatedStrings.length > 0 || translationStore.batchTranslationError" class="mt-6 space-y-6">
    <USeparator label="Batch Translation Results" />

    <UAlert
      v-if="translationStore.batchTranslationError && translationStore.batchTranslatedStrings.length === 0"
      icon="i-heroicons-exclamation-triangle-solid"
      color="error"
      variant="soft"
      title="Batch Translation Error"
      :description="translationStore.batchTranslationError"
      class="mt-4"
    />

    <div
      v-if="translationStore.batchTranslatedStrings.length > 0"
      class="mt-4 space-y-2"
    >
      <p class="text-sm font-medium">
        Review Batch Translation Results ({{ translationStore.batchTranslatedStrings.filter(s => !s.error).length }} successful, {{ translationStore.batchTranslatedStrings.filter(s => s.error).length }} failed):
      </p>
      <UTable
        :data="translationStore.batchTranslatedStrings"
        class="max-h-[500px] overflow-auto"
      >
        <template #error-data="{ row }">
          <span
            v-if="(row as any).error"
            class="text-red-500 dark:text-red-400"
            >{{ (row as any).error }}</span
          >
          <span v-else class="text-gray-500 dark:text-gray-400">N/A</span>
        </template>
        <template #translated_text-data="{ row }">
          <span
            :class="{ 'text-red-500 dark:text-red-400': (row as any).error }"
            >{{ (row as any).translated_text }}</span
          >
        </template>
      </UTable>

      <div class="flex space-x-2 pt-4">
        <UButton 
          label="Reconstruct & Package Project"
          icon="i-heroicons-archive-box-arrow-down"
          :loading="projectStore.isLoadingReconstruction"
          :disabled="projectStore.isLoadingReconstruction || translationStore.batchTranslatedStrings.length === 0"
          @click="handleReconstructAndPackage"
        />
        <UButton 
          label="Save Project ZIP"
          color="primary"
          icon="i-heroicons-document-arrow-down"
          :loading="projectStore.isLoadingSaveZip" 
          :disabled="!projectStore.tempZipPath || projectStore.isLoadingReconstruction || projectStore.isLoadingSaveZip"
          @click="handleSaveZip"
        />
        <UButton 
          label="Show in Folder"
          variant="outline"
          icon="i-heroicons-folder-open"
          :disabled="!projectStore.finalZipSavedPath"
          @click="handleShowInFolder"
        />
      </div>
      <UAlert
        v-if="projectStore.reconstructionError"
        icon="i-heroicons-exclamation-triangle-solid"
        color="error"
        variant="soft"
        title="Reconstruction Error"
        :description="projectStore.reconstructionError"
        class="mt-4"
      />
       <UAlert
        v-if="projectStore.saveZipError" 
        icon="i-heroicons-exclamation-triangle-solid"
        color="error"
        variant="soft"
        title="Save ZIP Error"
        :description="projectStore.saveZipError"
        class="mt-4"
      />
      <UAlert
        v-if="projectStore.openFolderError"
        icon="i-heroicons-exclamation-triangle-solid"
        color="error"
        variant="soft"
        title="Open Folder Error"
        :description="projectStore.openFolderError"
        class="mt-4"
      />

    </div>
    <!-- Consider adding a button here to clear results/go back to project selection or review -->
  </div>
</template>

<script lang="ts" setup>
import { useTranslationStore } from "~/stores/translation";
import { useProjectStore } from "~/stores/project";

const translationStore = useTranslationStore();
const projectStore = useProjectStore();

async function handleReconstructAndPackage() {
  // Pass all batchTranslatedStrings, even those with errors, 
  // as the backend reconstruction might handle them (e.g., by using original text)
  await projectStore.reconstructAndPackageFiles(translationStore.batchTranslatedStrings);
}

async function handleSaveZip() {
  if (projectStore.tempZipPath) { // Check projectStore for tempZipPath
    await projectStore.saveProjectZip(); // Call action on projectStore
  }
}

async function handleShowInFolder() {
  if (projectStore.finalZipSavedPath) { // Check projectStore for finalZipSavedPath
    await projectStore.showProjectZipInFolder(); // Call action on projectStore
  }
}

// Removed batchSourceLanguage, batchTargetLanguage, batchEngineName, engineOptions, and handleBatchTranslate
// as this component now only displays results.
</script> 