<template>
  <Card>
    <template #title>Select Game Project</template>
    <template #content>
      <div class="flex flex-col gap-4">
        <!-- Project Path Input -->
        <div class="flex gap-2">
          <InputText 
            v-model="path" 
            placeholder="Select project folder" 
            class="flex-1"
            :disabled="isValidating"
          />
          <Button 
            icon="pi pi-folder-open" 
            @click="selectFolder"
            :loading="isValidating"
          />
        </div>

        <!-- Validation Status -->
        <div v-if="validationStatus" class="mt-2">
          <div v-if="validationStatus.isValid" class="text-green-500">
            <i class="pi pi-check-circle mr-2"></i>
            Valid RPG Maker MV project
          </div>
          <div v-else class="text-red-500">
            <i class="pi pi-times-circle mr-2"></i>
            Invalid project structure
          </div>
        </div>

        <!-- Error Messages -->
        <div v-if="errors.length" class="mt-2">
          <Message severity="error" v-for="error in errors" :key="error">
            {{ error }}
          </Message>
        </div>

        <!-- Reset Button -->
        <div v-if="projectPath" class="flex justify-end">
          <Button 
            severity="secondary" 
            label="Reset Project"
            @click="resetProject"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTranslationStore } from '@/stores/translation'
import { open } from '@tauri-apps/plugin-dialog'

const store = useTranslationStore()
const path = ref('')
const isValidating = ref(false)

// Computed properties
const validationStatus = computed(() => store.validationStatus)
const errors = computed(() => store.errors)
const projectPath = computed(() => store.projectPath)

// Methods
async function selectFolder() {
  try {
    isValidating.value = true
    
    // Open folder dialog
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select RPG Maker MV Project Folder'
    })
    
    if (selected) {
      const isValid = await store.validateProject(selected as string)
      if (isValid) {
        path.value = selected as string
      }
    }
  } catch (error) {
    console.error('Error selecting folder:', error)
    store.errors = ['Failed to select folder']
  } finally {
    isValidating.value = false
  }
}

function resetProject() {
  store.resetProject()
  path.value = ''
}
</script> 