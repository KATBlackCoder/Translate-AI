<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTranslationStore } from '@/stores/translation'
import { useEngineStore } from '@/stores/engine'
import { useRouter } from 'vue-router'
import { useEngine } from '@/composables/useEngine'
import type { ResourceTranslation } from '@/types/shared/translation'
import TranslatedList from '@/components/project/TranslatedList.vue'
import TranslationTable from '@/components/project/TranslationTable.vue'
import TranslationProgress from '@/components/project/TranslationProgress.vue'
import Button from 'primevue/button'

const router = useRouter()
const translationStore = useTranslationStore()
const engineStore = useEngineStore()
const { extractContent } = useEngine()

// Resources state
const resources = ref<ResourceTranslation[]>([])
const currentBatch = ref<ResourceTranslation[]>([])
const isProcessing = ref(false)

// References
const translationProgressRef = ref<InstanceType<typeof TranslationProgress> | null>(null)

// Redirect if no project
if (!engineStore.hasProjectFiles) {
  router.push('/')
}

// Load extracted texts on mount
onMounted(async () => {
  try {
    resources.value = await extractContent()
  } catch (error) {
    console.error('Failed to load translatable content:', error)
  }
})

const translations = computed(() => resources.value.map(text => ({
  resourceId: text.resourceId,
  key: `${text.file}:${text.field}`,
  source: text.source,
  target: translationStore.results.find(t => 
    t.resourceId === text.resourceId && 
    t.field === text.field && 
    t.file === text.file
  )?.target || ''
})))

const progress = computed(() => {
  const total = resources.value.length
  const translated = translationStore.results.length
  return total > 0 ? Math.round((translated / total) * 100) : 0
})

const isTranslating = computed(() => isProcessing.value || translationStore.isTranslating)
const isComplete = computed(() => progress.value === 100)

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between mb-4">
      <h2 v-if="!isComplete" class="text-2xl font-semibold text-gray-800 dark:text-gray-200">Translation</h2>
      <h2 v-else class="text-2xl font-semibold text-gray-800 dark:text-gray-200">Translation Completed</h2>
      
      <Button
        v-if="isComplete"
        label="Back to Home"
        icon="pi pi-home"
        class="p-button-outlined"
        @click="goBack"
      />
    </div>

    <!-- In-Progress Translation View -->
    <div v-if="!isComplete" class="space-y-6">
      <!-- Progress Component -->
      <TranslationProgress 
        ref="translationProgressRef"
        v-if="resources.length > 0"
        :is-translating="isTranslating"
        :current-batch="currentBatch"
        :resources="resources"
      />

      <!-- Translation Table -->
      <TranslationTable 
        :resources="resources"
        :is-translating="isTranslating"
      />
    </div>

    <!-- Completed Translation View -->
    <TranslatedList v-else />
  </div>
</template> 