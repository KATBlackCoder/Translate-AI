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
              :disabled="isLoading"
            />
            <Button 
              icon="pi pi-folder-open" 
              @click="selectFolder"
              :loading="isLoading"
            />
          </div>
        </div>

        <!-- Engine Detection Status -->
        <div v-if="isLoading" class="mt-2">
          <ProgressBar mode="indeterminate" class="h-4" />
          <small class="block mt-1 text-gray-600">
            {{ validationStatus }}
          </small>
        </div>

        <!-- Validation Status -->
        <div v-if="projectPath && !isLoading" class="mt-2">
          <div v-if="projectValid" class="text-green-600 flex items-center gap-2">
            <i class="pi pi-check-circle"></i>
            <span>Valid project</span>
          </div>
          <div v-else-if="errorMessages.length" class="text-red-600 flex items-center gap-2">
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
                <span><strong>Engine:</strong> {{ engineNameValue }}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="pi pi-file"></i>
                <span><strong>Translatable files:</strong> {{ translatableFilesCount }} found</span>
              </div>
              <div v-if="hasAIConfig" class="flex items-center gap-2">
                <i class="pi pi-brain"></i>
                <span><strong>AI Model:</strong> {{ getProviderName }} ({{ aiModel }})</span>
              </div>
            </div>
          </Message>
        </div>

        <!-- Error Messages -->
        <div v-if="errorMessages.length" class="mt-2">
          <Message severity="error" v-for="error in errorMessages" :key="error">
            {{ error }}
          </Message>
        </div>

        <!-- Missing Files -->
        <div v-if="missingFiles.length" class="mt-2">
          <Message severity="warn">
            <div class="font-medium">Missing required files</div>
            <ul class="ml-4 list-disc">
              <li v-for="file in missingFiles" :key="file">{{ file }}</li>
            </ul>
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
import { useRouter } from 'vue-router'
import { open } from '@tauri-apps/plugin-dialog'
import { useEngine } from '@/composables/useEngine'
import { useSettingsStore } from '@/stores/settings'
import { useTranslationStore } from '@/stores/translation'

// Use our composable for engine functionality
const engine = useEngine()
const settingsStore = useSettingsStore()
const translationStore = useTranslationStore()
const router = useRouter()

// UI state
const path = ref('')
const validationStatus = ref('Checking project...')
const missingFiles = ref<string[]>([])
const translatableFilesCount = ref(0)

// Unwrap reactive refs from engine composable to avoid type errors
const isLoading = computed(() => engine.isLoading.value)
const errorMessages = computed(() => engine.errors.value)
const engineNameValue = computed(() => engine.engineName.value)

// Map of default base URLs for providers
const providerBaseUrls = {
  ollama: 'http://localhost:11434/api',
  chatgpt: 'https://api.openai.com/v1',
  deepseek: 'https://api.deepseek.com/v1'
}

// Map of display names for providers 
const providerDisplayNames = {
  'ollama': 'Ollama',
  'chatgpt': 'ChatGPT',
  'deepseek': 'DeepSeek'
}

// Initialize base URL on mount
onMounted(initializeProviderDefaults)

// Helper Functions
function initializeProviderDefaults() {
  const provider = settingsStore.aiProvider
  if (provider && (!settingsStore.baseUrl || settingsStore.baseUrl === '')) {
    settingsStore.baseUrl = providerBaseUrls[provider as keyof typeof providerBaseUrls] || ''
  }
}

function updateValidationStatus(status: string) {
  validationStatus.value = status
}

function updateTranslatableCount(count: number) {
  translatableFilesCount.value = count
}

// Computed properties
const projectPath = computed(() => path.value)
const aiModel = computed(() => settingsStore.aiModel || '')
const hasAIConfig = computed(() => 
  !!settingsStore.aiProvider && 
  !!settingsStore.aiModel
)

const canStartTranslation = computed(() => {
  const conditions = {
    // Now we check extracted content directly from the engine store
    hasTexts: translatableFilesCount.value > 0,
    translationConfigValid: settingsStore.isTranslationConfigValid,
    aiConfigValid: settingsStore.isAIConfigValid,
    notTranslating: !isTranslating.value,
    projectValid: projectValid.value,
    hasProjectPath: !!projectPath.value
  }
  
  return Object.values(conditions).every(Boolean)
})

const isTranslating = computed(() => 
  translationStore.progress > 0 && 
  translationStore.progress < 100
)

const getProviderName = computed(() => {
  const provider = settingsStore.aiProvider
  return provider ? (providerDisplayNames[provider as keyof typeof providerDisplayNames] || provider) : ''
})

const projectValid = computed(() => 
  !!projectPath.value && 
  translatableFilesCount.value > 0
)

// Main methods
async function selectFolder() {
  try {
    updateValidationStatus('Selecting project folder...')
    
    // Step 1: Open folder dialog
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select Game Project Folder'
    })
    
    if (!selected) return false
    
    const selectedPath = selected as string
    path.value = selectedPath
    
    // Step 2: Detect engine type
    updateValidationStatus('Detecting game engine...')
    const engineType = await engine.detectEngine(selectedPath)
    if (!engineType) return false
    
    // Step 3: Initialize project with the detected engine
    updateValidationStatus('Initializing project...')
    const initialized = await engine.initializeProject(selectedPath, engineType)
    if (!initialized) return false
    
    // Step 4: Extract translatable content
    updateValidationStatus('Extracting translatable content...')
    const texts = await engine.extractContent()
    if (!texts || texts.length === 0) {
      return false
    }
    
    // Update UI with extracted text count
    updateTranslatableCount(texts.length)
    return true
    
  } catch (error) {
    console.error('Error selecting folder:', error)
    return false
  }
}

function resetProject() {
  // Reset engine and translation stores
  engine.reset()
  translationStore.resetTranslation()
  
  // Reset local state
  path.value = ''
  missingFiles.value = []
  translatableFilesCount.value = 0
}

async function startTranslation() {
  try {
    // First navigate to translation view
    await router.push('/translation')
    
    // Get extracted texts from engine store
    const extractedTexts = await engine.extractContent()
    
    // Use the engine's apply translations function
    const applyTranslations = async (translations: any[]) => {
      await engine.applyTranslations(translations)
    }
    
    // Start translation with proper parameters
    await translationStore.translateAll(
      extractedTexts,
      applyTranslations,
      'general' // Use 'general' as the default promptType
    )
  } catch (error) {
    console.error('Error starting translation:', error)
  }
}
</script>