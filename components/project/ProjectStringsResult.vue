<template>
  <div v-if="translationStore.batchTranslatedStrings.length > 0 || translationStore.batchTranslationError" class="mt-6 space-y-6">
    <USeparator label="Batch Translation Results" />

    <UAlert
      v-if="translationStore.batchTranslationError"
      icon="i-heroicons-exclamation-triangle-solid"
      color="error"
      variant="soft"
      title="Batch Translation Error"
      :description="translationStore.batchTranslationError"
      class="mt-4"
    />

    <div
      v-if="
        translationStore.batchTranslatedStrings.length > 0 &&
        !translationStore.batchTranslationError
      "
      class="mt-4 space-y-2"
    >
      <p class="text-sm font-medium">
        Batch Translation Results ({{
          translationStore.batchTranslatedStrings.filter((s) => !s.error).length
        }}
        successful,
        {{
          translationStore.batchTranslatedStrings.filter((s) => s.error).length
        }}
        failed):
      </p>
      <UTable
        :data="translationStore.batchTranslatedStrings"
        class="max-h-[600px] overflow-auto"
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
    </div>
    <!-- Consider adding a button here to clear results/go back to project selection or review -->
  </div>
</template>

<script lang="ts" setup>
import { useTranslationStore } from "~/stores/translation";

const translationStore = useTranslationStore();

// Removed batchSourceLanguage, batchTargetLanguage, batchEngineName, engineOptions, and handleBatchTranslate
// as this component now only displays results.
</script> 