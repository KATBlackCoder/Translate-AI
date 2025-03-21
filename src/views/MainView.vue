<template>
  <div class="container mx-auto p-4 space-y-4">
    <!-- Project Selection -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ProjectSelector />
      <TranslationSettings />
    </div>

    <!-- Translation Progress & List -->
    <div v-if="store.extractedTexts.length > 0" class="space-y-4">
      <TranslationProgress />
      <TranslationList />
    </div>

    <!-- Initial State -->
    <div v-else-if="!store.projectPath" class="text-center py-12">
      <i class="pi pi-folder-open text-4xl text-gray-400 mb-4"></i>
      <h2 class="text-xl text-gray-600">Select a project folder to start</h2>
    </div>

    <!-- Loading State -->
    <div v-else class="text-center py-12">
      <ProgressSpinner />
      <div class="mt-4 text-gray-600">Loading project files...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslationStore } from '@/stores/translation'
import ProjectSelector from '@/components/ProjectSelector.vue'
import TranslationSettings from '@/components/TranslationSettings.vue'
import TranslationProgress from '@/components/TranslationProgress.vue'
import TranslationList from '@/components/TranslationList.vue'

const store = useTranslationStore()
</script> 