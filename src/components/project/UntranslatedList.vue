<template>
  <Card>
    <template #title>
      <div class="flex items-center justify-between">
        <span>Files to Translate</span>
        <div class="text-sm text-gray-500">
          {{ totalCount }} files
        </div>
      </div>
    </template>
    <template #content>
      <DataTable 
        :value="untranslatedFiles" 
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

        <Column style="width: 7%">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button
                icon="pi pi-play"
                text
                rounded
                @click="translateSingle(data)"
                :disabled="!translationStore.canTranslate || translationStore.isTranslating"
                :loading="currentText?.resourceId === data.resourceId"
                tooltip="Translate"
                tooltipOptions="{ position: 'top' }"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <div class="flex justify-between items-center mt-4">
        <ProgressBar 
          v-if="translationStore.isTranslating" 
          :value="translationStore.progress" 
          :showValue="true"
          class="w-2/5 h-2"
        />
        <span v-else-if="translationStore.progress === 100" class="text-sm text-green-600">
          <i class="pi pi-check-circle mr-1"></i>
          Translation complete!
        </span>
        <span v-else class="text-sm"></span>

        <div class="flex gap-2">
          <Button
            label="Translate All"
            icon="pi pi-play"
            severity="success"
            :disabled="!translationStore.canTranslate || translationStore.isTranslating"
            :loading="isTranslatingAll"
            @click="translationStore.translateAll"
          />
        </div>
      </div>

      <!-- Error Messages -->
      <div v-if="translationStore.errors.length" class="mt-4">
        <Message v-for="error in translationStore.errors" :key="error" severity="error">
          {{ error }}
        </Message>
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
const isTranslatingAll = ref(false)
const aiStore = useAIStore()

const totalCount = computed(() => projectStore.extractedTexts.length)
const untranslatedFiles = computed(() => 
  projectStore.extractedTexts.filter(text => !getTranslation(text))
)

function getTranslation(text: ResourceTranslation) {
  return translationStore.translatedTexts.find(t => 
    t.resourceId === text.resourceId && 
    t.field === text.field && 
    t.file === text.file
  )
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