<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTranslationStore } from '@/stores/translation'
import { useEngineStore } from '@/stores/engine'
import { useSettingsStore } from '@/stores/settings'
import { useTranslationQueue } from '@/composables/useTranslationQueue'
import { useEngine } from '@/composables/useEngine'
import { useToast } from 'primevue/usetoast'
import { exportAsZip } from '@/utils/fileUtils'
import type { ResourceTranslation } from '@/types/shared/translation'
import { useFileExport } from '@/composables/useFileExport'

interface TranslationStats {
  totalTokens: number;
  totalCost: number;
  successCount: number;
  failedCount: number;
  totalProcessingTime: number;
  lastTranslationTime: number;
}

// Create a translation stats composable for reuse
function useTranslationStats() {
  const stats = ref<TranslationStats>({
    totalTokens: 0,
    totalCost: 0,
    successCount: 0,
    failedCount: 0,
    totalProcessingTime: 0,
    lastTranslationTime: Date.now()
  })

  // Computed formatting for stats display
  const formattedStats = computed(() => {
    const totalTranslations = stats.value.successCount + stats.value.failedCount
    const successRate = totalTranslations > 0 
      ? `${Math.round((stats.value.successCount / totalTranslations) * 100)}%` 
      : '0%'
    
    const avgTime = totalTranslations > 0 
      ? `${Math.round(stats.value.totalProcessingTime / totalTranslations)}ms` 
      : '0ms'
    
    return {
      totalTranslations,
      successRate,
      averageTime: avgTime,
      totalCost: `$${stats.value.totalCost.toFixed(4)}`,
      tokensUsed: stats.value.totalTokens.toLocaleString()
    }
  })

  function updateStats(
    processingTime: number,
    tokens: number,
    success: boolean,
    count: number = 1,
    confidence: number = 0.8
  ) {
    // Update the statistics
    if (success) {
      stats.value.successCount += count
    } else {
      stats.value.failedCount += count
    }
    
    stats.value.totalTokens += tokens
    stats.value.totalProcessingTime = (stats.value.totalProcessingTime || 0) + processingTime
    stats.value.lastTranslationTime = Date.now()
    
    // Estimate cost (a very rough estimate)
    const costPerToken = 0.00002 // $0.00002 per token for simple calculation
    stats.value.totalCost += tokens * costPerToken
  }

  return {
    stats,
    updateStats,
    formattedStats
  }
}

const translationStore = useTranslationStore()
const engineStore = useEngineStore()
const settingsStore = useSettingsStore()
const { queue, processQueue, serviceStatus, serviceStats } = useTranslationQueue()
const { extractContent, applyTranslations } = useEngine()
const translationStats = useTranslationStats()
const currentText = ref<ResourceTranslation | null>(null)
const translatedResources = ref<ResourceTranslation[]>([])
const toast = useToast()
const isSaving = ref(false)
const { isExporting, exportTranslations } = useFileExport()
// Load translated files list when mounted
onMounted(async () => {
  try {
    const allResources = await extractContent()
    translatedResources.value = allResources
  } catch (error) {
    console.error("Error loading resources:", error)
    translatedResources.value = []
  }
})

const translatedCount = computed(() => translationStore.results.length)
const formattedStats = computed(() => translationStats.formattedStats.value)

// Check if translation is possible
const canTranslate = computed(() => {
  return engineStore.projectFiles.length > 0 && 
    serviceStatus.value.isInitialized && 
    !translationStore.isTranslating
})

const translatedFiles = computed(() => 
  translatedResources.value.filter(text => getTranslation(text))
)

// Create files with unique keys
const translatedFilesWithUniqueKeys = computed(() => {
  return translatedFiles.value.map((file, index) => ({
    ...file,
    uniqueId: `${file.resourceId}-${file.field}-${file.file}-${index}`
  }))
})

function getTranslation(text: ResourceTranslation) {
  return translationStore.results.find(t => 
    t.resourceId === text.resourceId && 
    t.field === text.field && 
    t.file === text.file
  )
}

function getTranslationStatus(text: ResourceTranslation) {
  const translation = getTranslation(text)
  if (!translation) return 'Not Translated'
  
  // Check if it was manually edited
  if ((translation as any).customData?.translationType === 'manual') {
    return 'Manual Edit'
  }
  
  return 'Translated'
}

function getStatusSeverity(text: ResourceTranslation) {
  const status = getTranslationStatus(text)
  switch (status) {
    case 'Translated': return 'success'
    case 'Manual Edit': return 'info'
    default: return 'warning'
  }
}

function getContextSeverity(context?: string) {
  if (!context) return 'secondary'
  
  switch (context.toLowerCase()) {
    case 'dialog': return 'info'
    case 'menu': return 'success'
    case 'battle': return 'danger'
    case 'event': return 'warning'
    default: return 'secondary'
  }
}

async function translateSingle(text: ResourceTranslation) {
  try {
    currentText.value = text
    const startTime = performance.now()
    
    // Use translation queue for single text translation with batch size 1
    const result = await processQueue({
      promptType: 'general',
      batchSize: 1
    })
    
    const endTime = performance.now()
    
    if (result?.stats) {
      // Update stats with the result
      translationStats.updateStats(
        endTime - startTime,
        result.stats.totalTokens || 0,
        result.stats.successCount > 0,
        1,
        0.8 // Default confidence
      )
    }
  } catch (error) {
    translationStats.updateStats(0, 0, false, 1)
    console.error('Translation error:', error)
  } finally {
    currentText.value = null
  }
}

/**
 * Save translations to the project files
 */
async function saveTranslations() {
  try {
    isSaving.value = true
    if (translationStore.results.length === 0) {
      showToast('warn', 'No Translations', 'There are no translations to save')
      return
    }
    
    await applyTranslations(translationStore.results)
    showToast('success', 'Saved', 'Translations have been saved to the project files')
  } catch (error) {
    console.error('Error saving translations:', error)
    showToast('error', 'Save Error', error instanceof Error ? error.message : 'Failed to save translations')
  } finally {
    isSaving.value = false
  }
}

/**
 * Export translations as ZIP
 */
async function handleExportZip() {
  try {
    isExporting.value = true
    if (translationStore.results.length === 0) {
      showToast('warn', 'No Translations', 'There are no translations to export')
      return
    }
    
    // Create a JSON file for metadata
    const metadata = {
      engine: engineStore.engineName,
      timestamp: new Date().toISOString(),
      sourceLanguage: settingsStore.sourceLanguage,
      targetLanguage: settingsStore.targetLanguage,
      fileCount: translationStore.results.length,
      stats: {
        totalTokens: translationStats.stats.value.totalTokens,
        totalCost: translationStats.stats.value.totalCost,
        successCount: translationStats.stats.value.successCount,
        failedCount: translationStats.stats.value.failedCount
      }
    }
    
    // Group translations by file while preserving original structure
    const fileGroups: Record<string, any[]> = {}
    for (const translation of translationStore.results) {
      const fileKey = translation.file || 'unknown'
      if (!fileGroups[fileKey]) {
        fileGroups[fileKey] = []
      }
      
      // Create a deep copy of the translation object to preserve its structure
      // Using any type to avoid linter errors with custom properties
      const translationCopy = JSON.parse(JSON.stringify(translation))
      
      fileGroups[fileKey].push(translationCopy)
    }
    
    // Create files for the ZIP
    const zipFiles: Record<string, string> = {
      'metadata.json': JSON.stringify(metadata, null, 2)
    }
    
    // Add each file's translations with structure preservation
    for (const [fileKey, translations] of Object.entries(fileGroups)) {
      // Create path structure that mirrors the original files
      // Make safe filename by replacing problematic characters but preserve path structure
      const safeFileName = fileKey.replace(/[<>:"|?*]/g, '_')
      zipFiles[`translations/${safeFileName}.json`] = JSON.stringify(translations, null, 2)
    }
    
    // Create one combined file with all translations, preserving original structure
    zipFiles['all_translations.json'] = JSON.stringify(translationStore.results, null, 2)
    
    const fileName = `translations_${engineStore.engineName}_${new Date().toISOString().slice(0, 10)}.zip`
    const savedPath = await exportAsZip(zipFiles, fileName)
    
    if (savedPath) {
      showToast('success', 'Export Complete', `Translations exported to: ${savedPath}`)
    }
  } catch (error) {
    console.error('Error exporting translations as ZIP:', error)
    showToast('error', 'Export Error', error instanceof Error ? error.message : 'Failed to export translations')
  } finally {
    isExporting.value = false
  }
}

/**
 * Display a toast notification
 */
function showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) {
  toast.add({
    severity,
    summary,
    detail,
    life: severity === 'error' ? 8000 : 3000
  })
}

// Initialize statistics from existing translations
onMounted(() => {
  // Try to restore stats if they exist in the service
  const stats = serviceStats.value
  if (stats) {
    // Update stats with service stats
    translationStats.stats.value = {
      totalTokens: stats.totalTokens || 0,
      totalCost: stats.totalCost || 0,
      successCount: stats.successCount || 0,
      failedCount: stats.failedCount || 0,
      totalProcessingTime: stats.totalProcessingTime || 0,
      lastTranslationTime: stats.lastTranslationTime || Date.now()
    }
  }
})
</script>

<template>
  <Card>
    <template #title>
      <div class="flex items-center justify-between">
        <span>Translated Files</span>
        <div class="text-sm text-gray-500">
          {{ translatedCount }} files
        </div>
      </div>
    </template>
    <template #content>
      <!-- Translation Statistics -->
      <div v-if="formattedStats.totalTranslations > 0" class="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
        <div class="flex flex-wrap gap-3 text-sm">
          <div class="flex items-center">
            <i class="pi pi-check-circle text-green-500 mr-2"></i>
            <span>Success rate: {{ formattedStats.successRate }}</span>
          </div>
          <div class="flex items-center">
            <i class="pi pi-clock text-blue-500 mr-2"></i>
            <span>Avg time: {{ formattedStats.averageTime }}</span>
          </div>
          <div class="flex items-center">
            <i class="pi pi-dollar text-amber-500 mr-2"></i>
            <span>Cost: {{ formattedStats.totalCost }}</span>
          </div>
          <div class="flex items-center">
            <i class="pi pi-hashtag text-purple-500 mr-2"></i>
            <span>Tokens: {{ formattedStats.tokensUsed }}</span>
          </div>
        </div>
      </div>

      <DataTable 
        :value="translatedFilesWithUniqueKeys" 
        :paginator="true" 
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        :scrollable="true"
        scrollHeight="400px"
        dataKey="uniqueId"
        :loading="translationStore.isTranslating"
        class="p-datatable-sm"
      >
        <Column header="#" style="width: 8%">
          <template #body="{ index }">
            {{ index + 1 }}
          </template>
        </Column>

        <Column field="resourceId" header="Resource ID" style="width: 15%">
          <template #body="{ data }">
            {{ data.resourceId }}
          </template>
        </Column>
        
        <Column field="context" header="Context" style="width: 15%">
          <template #body="{ data }">
            <Tag :value="data.context || 'None'" :severity="getContextSeverity(data.context)" />
          </template>
        </Column>

        <Column field="source" header="Source Text" style="width: 30%">
          <template #body="{ data }">
            <div class="whitespace-pre-wrap">{{ data.source }}</div>
          </template>
        </Column>

        <Column field="target" header="Translation" style="width: 30%">
          <template #body="{ data }">
            <div class="whitespace-pre-wrap">
              {{ getTranslation(data)?.target }}
            </div>
          </template>
        </Column>

        <Column field="translationStatus" header="Status" style="width: 10%">
          <template #body="{ data }">
            <Tag :value="getTranslationStatus(data)" :severity="getStatusSeverity(data)" />
          </template>
        </Column>

        <Column style="width: 7%">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button 
                icon="pi pi-sync"
                text
                rounded
                severity="warning"
                @click="translateSingle(data)"
                :disabled="!canTranslate"
                :loading="currentText?.resourceId === data.resourceId"
                tooltip="Retranslate"
                tooltipOptions="{ position: 'top' }"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <div class="flex justify-end mt-4 gap-2">
        <Button
          label="Export as ZIP"
          icon="pi pi-file-o"
          outlined
          severity="info"
          :disabled="translatedCount === 0"
          :loading="isExporting"
          @click="exportTranslations"
          tooltip="Export translations with metadata as a ZIP archive"
          tooltipOptions="{ position: 'top' }"
        />
        <Button
          label="Save to Project"
          icon="pi pi-save"
          severity="success"
          :disabled="translatedCount === 0"
          :loading="isSaving"
          @click="saveTranslations"
          tooltip="Apply translations to the project files"
          tooltipOptions="{ position: 'top' }"
        />
      </div>
    </template>
  </Card>
</template>
