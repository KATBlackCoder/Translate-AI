<template>
  <Card class="h-full">
    <template #title>
      <div class="text-lg font-medium">Select Game Project</div>
    </template>
    <template #content>
      <div class="flex flex-col gap-6">
        <!-- Project Path Input -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">Project Folder</label>
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
        </div>

        <!-- Validation Status -->
        <div v-if="validationStatus" class="mt-2">
          <div v-if="validationStatus.isValid" class="text-green-600 flex items-center gap-2">
            <i class="pi pi-check-circle"></i>
            <span>Valid RPG Maker MV project</span>
          </div>
          <div v-else class="text-red-600 flex items-center gap-2">
            <i class="pi pi-times-circle"></i>
            <span>Invalid project structure</span>
          </div>
        </div>

        <!-- Error Messages -->
        <div v-if="errors.length" class="mt-2">
          <Message severity="error" v-for="error in errors" :key="error">
            {{ error }}
          </Message>
        </div>

        <!-- Action Buttons -->
        <div v-if="projectPath" class="flex justify-end gap-2">
          <Button 
            v-if="!isTranslating"
            label="Start Translation" 
            icon="pi pi-play"
            severity="success"
            :disabled="!canStartTranslation"
            @click="startTranslation"
          />
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
import { useProjectStore } from '@/stores/project'
import { useSettingsStore } from '@/stores/settings'
import { useTranslationStore } from '@/stores/translation'
import { useRouter } from 'vue-router'
import { open } from '@tauri-apps/plugin-dialog'

const router = useRouter()
const projectStore = useProjectStore()
const settingsStore = useSettingsStore()
const translationStore = useTranslationStore()
const path = ref('')
const isValidating = ref(false)

// Computed properties
const validationStatus = computed(() => projectStore.validationStatus)
const errors = computed(() => projectStore.errors)
const projectPath = computed(() => projectStore.projectPath)
const canStartTranslation = computed(() => 
  projectStore.extractedTexts.length > 0 && 
  settingsStore.isTranslationConfigValid && 
  settingsStore.isAIConfigValid
)
const isTranslating = computed(() => translationStore.progress > 0 && translationStore.progress < 100)

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
      const isValid = await projectStore.validateProject(selected as string)
      if (isValid) {
        path.value = selected as string
      }
    }
  } catch (error) {
    console.error('Error selecting folder:', error)
    projectStore.errors.push('Failed to select folder')
  } finally {
    isValidating.value = false
  }
}

function resetProject() {
  projectStore.resetProject()
  path.value = ''
}

async function startTranslation() {
  router.push('/translation')
  // Start translation after navigation
  translationStore.translateAll()
}
</script> 