<script setup lang="ts">
import { computed } from 'vue'
import { useTranslationStore } from '@/stores/translation'
import { useProjectStore } from '@/stores/project'
import { useRouter } from 'vue-router'

const router = useRouter()
const translationStore = useTranslationStore()
const projectStore = useProjectStore()

// Redirect if no project
if (!projectStore.projectPath) {
  router.push('/')
}

const translations = computed(() => projectStore.extractedTexts.map(text => ({
  resourceId: text.resourceId,
  key: `${text.file}:${text.field}`,
  source: text.source,
  target: translationStore.translatedTexts.find(t => 
    t.resourceId === text.resourceId && 
    t.field === text.field && 
    t.file === text.file
  )?.target || ''
})))

const progress = computed(() => {
  const total = projectStore.extractedTexts.length
  const translated = translationStore.translatedTexts.length
  return total > 0 ? Math.round((translated / total) * 100) : 0
})

const isTranslating = computed(() => translationStore.progress > 0 && translationStore.progress < 100)
const isComplete = computed(() => progress.value === 100)

async function exportTranslations() {
  await translationStore.exportTranslations()
}

function goBack() {
  router.push('/')
}

</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 v-if="!isComplete" class="text-2xl font-semibold text-gray-800 dark:text-gray-200">Translation Progress</h2>
      <h2 v-else class="text-2xl font-semibold text-gray-800 dark:text-gray-200">Translation Completed</h2>
      <div class="space-x-2">
        <Button label="Export" icon="pi pi-download" @click="exportTranslations" :disabled="!translations.length || !isComplete" />
        <Button label="Back" icon="pi pi-arrow-left" @click="goBack" :disabled="!isComplete" />
      </div>
    </div>

    <!-- Progress Bar -->
    <Card v-if="!isComplete && projectStore.extractedTexts.length > 0">
      <template #content>
        <div class="space-y-4">
          <ProgressBar :value="progress" :showValue="true" class="h-2" />
          <div class="text-sm text-gray-600">
            {{ translationStore.translatedTexts.length }} / {{ projectStore.extractedTexts.length }} texts translated
          </div>
          <div v-if="translationStore.currentFile" class="text-sm text-blue-600">
            <i class="pi pi-file mr-2"></i>
            Currently translating: {{ translationStore.currentFile }}
          </div>
        </div>
      </template>
    </Card>

    <!-- Translation Table -->
    <Card v-if="!isComplete">
      <template #content>
        <DataTable 
          :value="translations" 
          class="p-datatable-sm"
          :paginator="true"
          :rows="10"
          :loading="isTranslating"
          sortField="key"
          :sortOrder="1"
        >
          <Column header="#" style="width: 8%">
            <template #body="{ index }">
              {{ index + 1 }}
            </template>
          </Column>
          <Column field="key" header="Path" sortable style="width: 25%" />
          <Column field="source" header="Source Text" style="width: 35%">
            <template #body="{ data }">
              <div class="whitespace-pre-wrap">{{ data.source }}</div>
            </template>
          </Column>
          <Column field="target" header="Translation" style="width: 35%">
            <template #body="{ data }">
              <div v-if="data.target" class="whitespace-pre-wrap">{{ data.target }}</div>
              <div v-else class="text-gray-400 italic">Not translated</div>
            </template>
          </Column>
          <Column style="width: 5%">
            <template #body="{ data }">
              <i v-if="data.target" class="pi pi-check text-green-500"></i>
              <i v-else-if="isTranslating" class="pi pi-spin pi-spinner text-blue-500"></i>
              <i v-else class="pi pi-minus text-gray-400"></i>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Translated List -->
    <TranslatedList v-if="isComplete" />
  </div>
</template> 