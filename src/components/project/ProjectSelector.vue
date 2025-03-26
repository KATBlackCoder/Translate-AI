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
        <div v-if="projectPath" class="mt-2">
          <div v-if="projectValid" class="text-green-600 flex items-center gap-2">
            <i class="pi pi-check-circle"></i>
            <span>Valid project</span>
          </div>
          <div v-else-if="errors.length" class="text-red-600 flex items-center gap-2">
            <i class="pi pi-times-circle"></i>
            <span>Invalid project structure</span>
          </div>
        </div>

        <!-- Engine and Model Info -->
        <div v-if="projectValid" class="mt-2">
          <Message severity="info">
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <i class="pi pi-cog"></i>
                <span><strong>Engine:</strong> {{ engineName }}</span>
              </div>
              <div v-if="settingsStore.aiProvider && settingsStore.aiModel" class="flex items-center gap-2">
                <i class="pi pi-brain"></i>
                <span><strong>AI Model:</strong> {{ getProviderName }} ({{ settingsStore.aiModel }})</span>
              </div>
            </div>
          </Message>
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
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useSettingsStore } from '@/stores/settings'
import { useTranslationStore } from '@/stores/translation'
import { useEngineStore } from '@/stores/engines/engine'
import { useRouter } from 'vue-router'
import { open } from '@tauri-apps/plugin-dialog'
const router = useRouter()
const projectStore = useProjectStore()
const settingsStore = useSettingsStore()
const translationStore = useTranslationStore()
const engineStore = useEngineStore()
const path = ref('')
const isValidating = ref(false)

// Default base URLs
const defaultBaseUrls = {
  ollama: 'http://localhost:11434',
  chatgpt: 'https://api.openai.com/v1',
  deepseek: 'https://api.deepseek.com/v1'
}

// Initialize base URL on mount
onMounted(() => {
  if (settingsStore.aiProvider && (!settingsStore.baseUrl || settingsStore.baseUrl === '')) {
    settingsStore.baseUrl = defaultBaseUrls[settingsStore.aiProvider as keyof typeof defaultBaseUrls] || ''
  }
})

// Computed properties
const errors = computed(() => projectStore.errors)
const projectPath = computed(() => projectStore.projectPath)
const canStartTranslation = computed(() => {
  const conditions = {
    hasTexts: projectStore.extractedTexts.length > 0,
    translationConfigValid: settingsStore.isTranslationConfigValid,
    aiConfigValid: settingsStore.isAIConfigValid,
    notTranslating: !isTranslating.value,
    projectValid: projectValid.value,
    hasProjectPath: projectPath.value
  }
  
  console.log('Translation conditions:', conditions)
  console.log('AI Config:', {
    provider: settingsStore.aiProvider,
    model: settingsStore.aiModel,
    baseUrl: settingsStore.baseUrl,
    hasApiKey: Boolean(settingsStore.apiKey)
  })
  return Object.values(conditions).every(Boolean)
})
const isTranslating = computed(() => translationStore.progress > 0 && translationStore.progress < 100)
const getProviderName = computed(() => {
  const providers = {
    'ollama': 'Ollama',
    'chatgpt': 'ChatGPT',
    'deepseek': 'DeepSeek'
  }
  return providers[settingsStore.aiProvider as keyof typeof providers] || settingsStore.aiProvider
})
const projectValid = computed(() => projectPath.value && projectStore.extractedTexts.length > 0)
const engineName = computed(() => {
  if (engineStore.engine && engineStore.engine.settings) {
    return engineStore.engine.settings.name
  }
  
  // Fallback to mapping if engine is not initialized
  const engines = {
    'rpgmv': 'RPG Maker MV',
    // Add more engines here as they are implemented
  }
  return engines[settingsStore.engineType as keyof typeof engines] || settingsStore.engineType
})

// Methods
async function selectFolder() {
  try {
    isValidating.value = true
    
    // Reset error messages and validation status
    projectStore.errors = []
    
    // Open folder dialog
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select RPG Maker MV Project Folder'
    })
    
    if (selected) {
      
      // Validate and start the project
      const isValid = await projectStore.startEngineProject(selected as string)
      
      if (isValid) {
        path.value = selected as string
      }
    }
  } catch (error) {
    console.error('Error selecting folder:', error)
    projectStore.errors.push('Failed to select folder: ' + (error instanceof Error ? error.message : String(error)))
  } finally {
    isValidating.value = false
  }
}

function resetProject() {
  projectStore.resetProject()
  path.value = ''
}

async function startTranslation() {
  try {
    // First navigate to translation view
    await router.push('/translation')
    // Then start translation after navigation is complete
    await translationStore.translateAll()
  } catch (error) {
    console.error('Error starting translation:', error)
    projectStore.errors.push('Failed to start translation: ' + (error instanceof Error ? error.message : String(error)))
  }
}
</script> 