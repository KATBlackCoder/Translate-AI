<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useEngine } from '@/composables/useEngine'
import { useSettingsStore } from '@/stores/settings'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { selectFolder } from '@/utils/fileUtils'

// Use our composable for engine functionality
const engine = useEngine()
const settingsStore = useSettingsStore()
const router = useRouter()
const toast = useToast()

// UI state
const path = ref('')
const validationStatus = ref('Checking project...')
const missingFiles = ref<string[]>([])
const translatableFilesCount = ref(0)
const isSelecting = ref(false)

// Unwrap reactive refs from engine composable to avoid type errors
const isLoading = computed(() => engine.isLoading.value || isSelecting.value)
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

function redirectToTranslation() {
  setTimeout(() => {
    router.push('/translation')
  }, 1000)
}

function showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) {
  toast.add({
    severity,
    summary,
    detail,
    life: severity === 'error' ? 8000 : 3000
  })
}

// Computed properties
const projectPath = computed(() => path.value)
const aiModel = computed(() => settingsStore.aiModel || '')
const hasAIConfig = computed(() => 
  !!settingsStore.aiProvider && 
  !!settingsStore.aiModel
)

const projectValid = computed(() => 
  !!projectPath.value && 
  translatableFilesCount.value > 0
)

const getProviderName = computed(() => {
  const provider = settingsStore.aiProvider
  return provider ? (providerDisplayNames[provider as keyof typeof providerDisplayNames] || provider) : ''
})

// Watch for valid project and navigate automatically
watch(projectValid, (valid) => {
  if (valid && hasAIConfig.value) {
    showToast('success', 'Project Ready', `Found ${translatableFilesCount.value} translatable files`)
    redirectToTranslation()
  }
})

// Main methods
async function handleSelectFolder() {
  try {
    isSelecting.value = true
    updateValidationStatus('Selecting project folder...')
    
    // Step 1: Open folder dialog using our utility
    const selectedPath = await selectFolder('Select Game Project Folder')
    
    if (!selectedPath) {
      isSelecting.value = false
      return false
    }
    
    path.value = selectedPath
    
    // Step 2: Detect engine type
    updateValidationStatus('Detecting game engine...')
    const engineType = await engine.detectEngine(selectedPath)
    if (!engineType) {
      showToast('error', 'Engine Detection Failed', 'Could not detect a supported game engine')
      isSelecting.value = false
      return false
    }
    
    // Step 3: Initialize project with the detected engine
    updateValidationStatus('Initializing project...')
    const initialized = await engine.initializeProject(selectedPath, engineType)
    if (!initialized) {
      showToast('error', 'Project Initialization Failed', 'Could not initialize the project')
      isSelecting.value = false
      return false
    }
    
    // Step 4: Extract translatable content
    updateValidationStatus('Extracting translatable content...')
    const texts = await engine.extractContent()
    if (!texts || texts.length === 0) {
      showToast('warn', 'No Content Found', 'No translatable content was found in the project')
      isSelecting.value = false
      return false
    }
    
    // Update UI with extracted text count
    updateTranslatableCount(texts.length)
    
    // If we have AI config, redirect automatically
    if (hasAIConfig.value) {
      showToast('success', 'Project Ready', `Found ${texts.length} translatable files`)
      redirectToTranslation()
    } else {
      showToast('info', 'AI Configuration Needed', 'Please configure AI settings before translation')
    }
    
    isSelecting.value = false
    return true
    
  } catch (error) {
    console.error('Error selecting folder:', error)
    showToast('error', 'Error', error instanceof Error ? error.message : 'Unknown error')
    isSelecting.value = false
    return false
  }
}
</script>

<template>
  <Card class="h-full">
    <template #title>
      <div class="flex items-center gap-2">
        <i class="pi pi-folder text-blue-500"></i>
        <span class="text-lg font-medium">Select Game Project</span>
      </div>
    </template>
    <template #content>
      <div class="flex flex-col gap-6">
        <!-- Project Path Input -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Project Folder</label>
          <div class="flex gap-2">
            <InputText 
              v-model="path" 
              placeholder="Select project folder" 
              class="flex-1"
              :disabled="isLoading"
            />
            <Button 
              icon="pi pi-folder-open" 
              @click="handleSelectFolder"
              :loading="isLoading"
              tooltip="Browse for project folder"
              tooltipOptions="{ position: 'top' }"
            />
          </div>
        </div>

        <!-- Engine Detection Status -->
        <div v-if="isLoading" class="mt-2">
          <ProgressBar mode="indeterminate" class="h-4" />
          <small class="block mt-1 text-gray-600 dark:text-gray-400">
            {{ validationStatus }}
          </small>
        </div>

        <!-- Validation Status -->
        <div v-if="projectPath && !isLoading" class="mt-2">
          <div v-if="projectValid" class="text-green-600 flex items-center gap-2">
            <i class="pi pi-check-circle"></i>
            <span>Valid project{{ hasAIConfig ? ' - Redirecting to translation...' : '' }}</span>
          </div>
          <div v-else-if="errorMessages.length" class="text-red-600 flex items-center gap-2">
            <i class="pi pi-times-circle"></i>
            <span>Invalid project structure</span>
          </div>
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

        <!-- Project Info -->
        <div v-if="projectValid" class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <i class="pi pi-cog text-blue-500"></i>
              <span class="text-sm"><strong>Engine:</strong> {{ engineNameValue }}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="pi pi-file text-green-500"></i>
              <span class="text-sm"><strong>Translatable files:</strong> {{ translatableFilesCount }}</span>
            </div>
            <div v-if="hasAIConfig" class="flex items-center gap-2">
              <i class="pi pi-brain text-purple-500"></i>
              <span class="text-sm"><strong>AI Model:</strong> {{ getProviderName }} ({{ aiModel }})</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
