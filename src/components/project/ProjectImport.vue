<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import { useDropZone } from '@vueuse/core'
import { open } from '@tauri-apps/plugin-dialog'

const isDragging = ref(false)
const selectedPath = ref('')
const error = ref('')

// Handle file drop
const { isOverDropZone } = useDropZone(document.body, (files) => {
  if (files?.[0]) {
    // For now, we'll just show the file name
    // We'll implement actual folder handling with Tauri
    handleFileSelect(files[0].name)
  }
})

// Handle drag events
document.body.addEventListener('dragenter', () => {
  isDragging.value = true
})

document.body.addEventListener('dragleave', () => {
  isDragging.value = false
})

// Handle folder selection
async function handleFolderSelect() {
  try {
    const path = await open({
      directory: true,
      multiple: false
    })
    if (path) {
      handleFileSelect(path as string)
    }
  } catch (e) {
    error.value = 'Failed to select folder'
  }
}

// Handle file/folder selection
async function handleFileSelect(path: string) {
  try {
    selectedPath.value = path
    error.value = ''
    // TODO: Validate RPG Maker MV project
    // TODO: Read Actors.json
  } catch (e) {
    error.value = 'Invalid RPG Maker MV project'
  }
}
</script>

<template>
  <div class="space-y-4">
    <Card>
      <template #title>Import Project</template>
      <template #content>
        <div 
          class="border-2 border-dashed rounded-lg p-8 text-center"
          :class="{
            'border-blue-500 bg-blue-50': isDragging,
            'border-gray-300': !isDragging
          }"
        >
          <div class="space-y-4">
            <div class="text-4xl text-gray-400">
              <i class="pi pi-folder-open"></i>
            </div>
            <div>
              <p class="text-lg font-medium text-gray-700">
                Drag & drop your RPG Maker MV project folder here
              </p>
              <p class="text-sm text-gray-500 mt-1">
                or click to select a folder
              </p>
            </div>
            <Button 
              label="Select Folder" 
              icon="pi pi-folder-open"
              @click="handleFolderSelect"
            />
          </div>
        </div>

        <!-- Selected Path -->
        <div v-if="selectedPath" class="mt-4">
          <div class="text-sm font-medium text-gray-700">Selected Project:</div>
          <div class="text-sm text-gray-600 mt-1">{{ selectedPath }}</div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mt-4 text-red-500 text-sm">
          {{ error }}
        </div>
      </template>
    </Card>
  </div>
</template> 