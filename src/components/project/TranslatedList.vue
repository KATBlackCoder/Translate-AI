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
        :value="translatedFiles" 
        :paginator="true" 
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        :scrollable="true"
        scrollHeight="400px"
        dataKey="resourceId"
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
                :disabled="!translationStore.canTranslate || translationStore.isTranslating"
                :loading="currentText?.resourceId === data.resourceId"
                tooltip="Retranslate"
                tooltipOptions="{ position: 'top' }"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <div class="flex justify-end mt-4">
        <Button
          label="Save Translations"
          icon="pi pi-save"
          severity="info"
          :disabled="translatedCount === 0"
          @click="translationStore.saveTranslations"
        />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTranslationStore } from '@/stores/translation'
import { useProjectStore } from '@/stores/project'
import { useTranslationStats } from '@/composables/useTranslationStats'
import type { ResourceTranslation } from '@/types/shared/translation'
import { useAIStore } from '@/stores/ai'

const translationStore = useTranslationStore()
const projectStore = useProjectStore()
const translationStats = useTranslationStats()
const currentText = ref<ResourceTranslation | null>(null)
const aiStore = useAIStore()

const translatedCount = computed(() => translationStore.translatedTexts.length)
const formattedStats = computed(() => translationStats.formattedStats.value)
const translatedFiles = computed(() => 
  projectStore.extractedTexts.filter(text => getTranslation(text))
)

function getTranslation(text: ResourceTranslation) {
  return translationStore.translatedTexts.find(t => 
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
    const result = await aiStore.translate(text)
    const endTime = performance.now()
    
    if (result) {
      // Update stats
      translationStats.updateStats(
        endTime - startTime,
        (result as any).tokens?.total || 0,
        true,
        1,
        0 // Don't use confidence for now
      )
      
      // Remove existing translation if any
      const existingIndex = translationStore.translatedTexts.findIndex(t => 
        t.resourceId === text.resourceId && 
        t.field === text.field && 
        t.file === text.file
      )
      if (existingIndex >= 0) {
        translationStore.translatedTexts.splice(existingIndex, 1)
      }
      translationStore.translatedTexts.push(result)
    }
  } catch (error) {
    translationStats.updateStats(0, 0, false, 1)
    console.error('Translation error:', error)
  } finally {
    currentText.value = null
  }
}

// Initialize statistics from existing translations
onMounted(() => {
  // Try to restore stats if they exist in the store
  if ((translationStore as any).stats) {
    translationStats.stats.value = { ...(translationStore as any).stats }
  }
})
</script> 