<script setup lang="ts">
import { useEngineStore } from '@/stores/engine'
import ProjectSelector from '@/components/project/ProjectSelector.vue'

const engineStore = useEngineStore()
</script> 

<template>
  <div class="container mx-auto p-4 space-y-4">
    <!-- Project Selection -->
    <div class="text-center space-y-4">
      <ProjectSelector />
    </div>
    
    <!-- Initial State -->
    <div v-if="!engineStore.hasProjectFiles" class="text-center py-12">
      <i class="pi pi-folder-open text-4xl text-gray-400 mb-4"></i>
      <h2 class="text-xl text-gray-600">Select a project folder to start</h2>
    </div>

    <!-- Loading State -->
    <div v-else-if="engineStore.isLoading" class="text-center py-12">
      <ProgressSpinner />
      <div class="mt-4 text-gray-600">Loading project files...</div>
    </div>
  </div>
</template>
