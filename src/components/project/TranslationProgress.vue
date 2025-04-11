<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTranslationStore } from '@/stores/translation'
import { useEngineStore } from '@/stores/engine'
import { useSettingsStore } from '@/stores/settings'
import { useToast } from 'primevue/usetoast'
import { useTranslationQueue } from '@/composables/useTranslationQueue'
import { useEngine } from '@/composables/useEngine'
import { useAIProvider } from '@/composables/useAIProvider'
import type { ResourceTranslation } from '@/types/shared/translation'
import type { AIProviderType } from '@/types/ai/base'

interface Props {
  isTranslating: boolean
  currentBatch: ResourceTranslation[]
  resources: ResourceTranslation[]
}

const props = defineProps<Props>()

// Store initialization
const translationStore = useTranslationStore()
const engineStore = useEngineStore()
const settingsStore = useSettingsStore()
const toast = useToast()

// Composables
const { clearQueue, serviceStats } = useTranslationQueue()
const { extractContent, applyTranslations } = useEngine()
const ai = useAIProvider()

// State
const untranslatedFiles = ref<ResourceTranslation[]>([])
const isProcessing = ref(false)

// Computed properties
const totalCount = computed(() => props.resources.length)
const translatedCount = computed(() => translationStore.results.length)
const progressPercentage = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((translatedCount.value / totalCount.value) * 100)
})

const getCurrentFile = computed(() => {
  if (props.currentBatch.length === 0) return 'No file in progress'
  return props.currentBatch[0].file || 'Unknown file'
})

const translationStats = computed(() => serviceStats.value)
const estimatedCost = computed(() => {
  return (translationStats.value?.totalTokens || 0) * 0.00002
})

const canStart = computed(() => {
  return engineStore.projectFiles.length > 0 && 
         settingsStore.sourceLanguage && 
         settingsStore.targetLanguage && 
         settingsStore.aiProvider &&
         !props.isTranslating
})

const averageProcessingTime = computed(() => {
  if (!translationStats.value?.totalProcessingTime || !translationStats.value?.successCount) return 0
  return Math.round(translationStats.value.totalProcessingTime / translationStats.value.successCount)
})

// Methods
async function loadTranslatableFiles() {
  try {
    const texts = await extractContent()
    untranslatedFiles.value = texts
  } catch (error) {
    handleError('Error loading translatable files', error)
    untranslatedFiles.value = []
  }
}

async function startTranslation() {
  if (!canStart.value) return
  
  isProcessing.value = true
  try {
    // Initialize the AI provider first
    await ai.initialize({
      provider: {
        providerType: settingsStore.aiProvider as AIProviderType,
        model: settingsStore.aiModel,
        apiKey: settingsStore.apiKey,
        baseUrl: settingsStore.baseUrl,
        temperature: settingsStore.qualitySettings.temperature,
        maxTokens: settingsStore.qualitySettings.maxTokens,
        contentRating: settingsStore.allowNSFWContent ? 'nsfw' : 'sfw'
      },
      sourceLanguage: settingsStore.sourceLanguage,
      targetLanguage: settingsStore.targetLanguage,
      contentRating: settingsStore.allowNSFWContent ? 'nsfw' : 'sfw',
      quality: {
        temperature: settingsStore.qualitySettings.temperature,
        maxTokens: settingsStore.qualitySettings.maxTokens,
        retryCount: settingsStore.qualitySettings.retryCount,
        batchSize: settingsStore.qualitySettings.batchSize,
        timeout: settingsStore.qualitySettings.timeout
      }
    })
    
    // Get all texts and filter out already translated ones
    const texts = await extractContent()
    const untranslated = texts.filter(text => 
      !translationStore.results.some(t => 
        t.resourceId === text.resourceId && 
        t.field === text.field && 
        t.file === text.file
      )
    )
    
    if (untranslated.length === 0) {
      showToast('info', 'Complete', 'All files are already translated')
      return
    }
    
    // Create a wrapper function that returns void to match the expected type
    const applyTranslationsWrapper = async (translations: ResourceTranslation[]): Promise<void> => {
      await applyTranslations(translations)
    }
    
    // Use the translation store to handle the entire process
    await translationStore.translateAll(
      untranslated, 
      applyTranslationsWrapper, 
      'general'
    )
    
    showToast('success', 'Success', 'Translation completed')
  } catch (error) {
    handleError('Translation error', error)
  } finally {
    isProcessing.value = false
  }
}

function cancelTranslation() {
  clearQueue()
  translationStore.resetTranslation()
  showToast('info', 'Cancelled', 'Translation process cancelled')
}

function handleError(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error occurred'
  console.error(`${context}:`, error)
  showToast('error', context, message)
}

function showToast(severity: 'success' | 'error' | 'info', summary: string, detail: string) {
  toast.add({
    severity,
    summary,
    detail,
    life: severity === 'error' ? 8000 : 5000
  })
}

// Lifecycle hooks
onMounted(async () => {
  try {
    await loadTranslatableFiles()
    // Try to initialize the AI provider if settings are available
    if (settingsStore.isAIConfigValid) {
      try {
        await ai.initialize({
          provider: {
            providerType: settingsStore.aiProvider as AIProviderType,
            model: settingsStore.aiModel,
            apiKey: settingsStore.apiKey,
            baseUrl: settingsStore.baseUrl,
            temperature: settingsStore.qualitySettings.temperature,
            maxTokens: settingsStore.qualitySettings.maxTokens,
            contentRating: settingsStore.allowNSFWContent ? 'nsfw' : 'sfw'
          },
          sourceLanguage: settingsStore.sourceLanguage,
          targetLanguage: settingsStore.targetLanguage,
          contentRating: settingsStore.allowNSFWContent ? 'nsfw' : 'sfw',
          quality: {
            temperature: settingsStore.qualitySettings.temperature,
            maxTokens: settingsStore.qualitySettings.maxTokens,
            retryCount: settingsStore.qualitySettings.retryCount,
            batchSize: settingsStore.qualitySettings.batchSize,
            timeout: settingsStore.qualitySettings.timeout
          }
        })
      } catch (aiError) {
        console.warn('AI initialization deferred:', aiError)
      }
    }
  } catch (error) {
    handleError('Error initializing', error)
  }
})

defineExpose({
  startTranslation,
  cancelTranslation
})
</script>

<template>
  <Card class="w-full">
    <template #title>
      <div class="flex items-center gap-2">
        <i class="pi pi-sync text-blue-500"></i>
        <span>Translation Progress</span>
      </div>
    </template>
    <template #content>
      <div class="flex flex-col gap-4">
        <!-- Engine and Model Info -->
        <Message severity="info">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-cog"></i>
              <span><strong>Engine:</strong> {{ engineStore.engineName }}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="pi pi-file"></i>
              <span><strong>Translatable files:</strong> {{ totalCount }} found</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="pi pi-brain"></i>
              <span><strong>AI Model:</strong> {{ settingsStore.aiProvider }} ({{ settingsStore.aiModel }})</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="pi pi-globe"></i>
              <span><strong>Languages:</strong> {{ settingsStore.sourceLanguage }} → {{ settingsStore.targetLanguage }}</span>
            </div>
          </div>
        </Message>

        <!-- Progress Section -->
        <div v-if="totalCount > 0" class="space-y-3">
          <!-- Progress Header -->
          <div class="flex justify-between items-center">
            <div class="text-sm font-medium text-gray-700">
              Translation Progress
            </div>
            <div class="text-sm text-gray-600">
              {{ translatedCount }} / {{ totalCount }} files
            </div>
          </div>

          <!-- Progress Bar -->
          <ProgressBar 
            :value="progressPercentage" 
            :showValue="true"
            class="h-3"
            :class="{
              'bg-gray-100': !isTranslating,
              'bg-blue-50': isTranslating
            }"
          />

          <!-- Progress Details -->
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ progressPercentage }}%</span>
              <i v-if="isTranslating" class="pi pi-spin pi-spinner text-blue-500"></i>
            </div>
            <div class="text-gray-600">
              {{ translatedCount }} / {{ totalCount }} files
            </div>
          </div>
          
          <!-- Current File Info -->
          <div v-if="isTranslating" class="flex items-center gap-2 text-sm text-blue-600">
            <i class="pi pi-file"></i>
            <span>Processing: {{ getCurrentFile }}</span>
          </div>

          <!-- Processing Time -->
          <div v-if="averageProcessingTime > 0" class="text-sm text-gray-500">
            <i class="pi pi-clock mr-2"></i>
            Average time: {{ averageProcessingTime }}ms
          </div>
        </div>

        <!-- Stats Section -->
        <div v-if="translationStats?.totalTokens > 0" class="grid grid-cols-2 gap-4">
          <div class="p-3 bg-blue-50 rounded-lg">
            <div class="text-sm text-blue-600">Total Tokens</div>
            <div class="text-lg font-semibold">{{ translationStats.totalTokens }}</div>
          </div>
          <div class="p-3 bg-green-50 rounded-lg">
            <div class="text-sm text-green-600">Estimated Cost</div>
            <div class="text-lg font-semibold">${{ estimatedCost.toFixed(2) }}</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end items-center">
          <div class="flex gap-2">
            <Button 
              v-if="!isTranslating"
              label="Start Translation"
              icon="pi pi-play"
              @click="startTranslation"
              :disabled="!canStart"
            />
            <Button 
              v-else
              label="Cancel"
              icon="pi pi-stop"
              severity="danger"
              @click="cancelTranslation"
            />
          </div>
        </div>

        <!-- Error Messages -->
        <div v-if="translationStore.error" class="mt-2">
          <Message severity="error">
            {{ translationStore.error }}
          </Message>
        </div>
      </div>
    </template>
  </Card>
</template>
