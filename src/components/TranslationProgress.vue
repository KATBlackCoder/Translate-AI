<template>
  <Card>
    <template #title>Translation Progress</template>
    <template #content>
      <div class="flex flex-col gap-4">
        <!-- Progress Bar -->
        <div v-if="store.extractedTexts.length > 0">
          <ProgressBar 
            :value="progressPercentage" 
            :showValue="true"
            class="h-2"
          />
          <div class="text-sm text-gray-600 mt-1">
            {{ translatedCount }} / {{ totalCount }} translations
          </div>
        </div>

        <!-- Current File -->
        <div v-if="store.currentFile" class="flex items-center gap-2">
          <i class="pi pi-file"></i>
          <span class="text-sm">{{ store.currentFile }}</span>
        </div>

        <!-- Translation Stats -->
        <div v-if="store.translatedTexts.length > 0" class="grid grid-cols-2 gap-4">
          <div class="p-3 bg-blue-50 rounded">
            <div class="text-sm text-blue-600">Total Tokens</div>
            <div class="text-lg font-semibold">{{ totalTokens }}</div>
          </div>
          <div class="p-3 bg-green-50 rounded">
            <div class="text-sm text-green-600">Estimated Cost</div>
            <div class="text-lg font-semibold">${{ estimatedCost.toFixed(2) }}</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-between items-center">
          <div class="flex gap-2">
            <Button
              v-if="store.translatedTexts.length > 0"
              label="Save to Files"
              icon="pi pi-save"
              severity="success"
              :loading="isSaving"
              @click="saveTranslations"
            />
            <Button
              v-if="store.translatedTexts.length > 0"
              label="Export JSON"
              icon="pi pi-download"
              severity="info"
              :loading="isExporting"
              @click="exportTranslations"
            />
          </div>
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
        <div v-if="store.errors.length" class="mt-2">
          <Message severity="error" v-for="error in store.errors" :key="error">
            {{ error }}
          </Message>
        </div>
      </div>
    </template>
  </Card>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTranslationStore } from '@/stores/translation'
import { useToast } from 'primevue/usetoast'

const store = useTranslationStore()
const toast = useToast()
const isSaving = ref(false)
const isExporting = ref(false)

// Computed properties
const totalCount = computed(() => store.extractedTexts.length)
const translatedCount = computed(() => store.translatedTexts.length)
const progressPercentage = computed(() => {
  if (totalCount.value === 0) return 0
  return (translatedCount.value / totalCount.value) * 100
})

const totalTokens = computed(() => {
  return store.translatedTexts.reduce((sum, t) => sum + (t.tokens?.total || 0), 0)
})

const estimatedCost = computed(() => {
  // Rough estimate: $0.0001 per token
  return totalTokens.value * 0.0001
})

const isTranslating = computed(() => store.progress > 0 && store.progress < 100)
const canStart = computed(() => {
  return store.extractedTexts.length > 0 && 
         store.sourceLanguage && 
         store.targetLanguage && 
         store.aiProvider
})

// Methods
async function startTranslation() {
  // TODO: Implement translation start
}

function cancelTranslation() {
  // TODO: Implement translation cancel
}

async function saveTranslations() {
  try {
    isSaving.value = true
    const success = await store.saveTranslations()
    if (success) {
      toast.add({
        severity: 'success',
        summary: 'Saved',
        detail: 'Translations saved successfully',
        life: 5000
      })
    } else if (store.errors.length > 0) {
      toast.add({
        severity: 'error',
        summary: 'Save Failed',
        detail: store.errors[store.errors.length - 1],
        life: 8000
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: error instanceof Error ? error.message : 'Unknown error occurred',
      life: 8000
    })
  } finally {
    isSaving.value = false
  }
}

async function exportTranslations() {
  try {
    isExporting.value = true
    const success = await store.exportTranslations()
    if (success) {
      toast.add({
        severity: 'success',
        summary: 'Exported',
        detail: `Translations exported to ${store.projectPath}/translations.json`,
        life: 5000
      })
    } else if (store.errors.length > 0) {
      toast.add({
        severity: 'error',
        summary: 'Export Failed',
        detail: store.errors[store.errors.length - 1],
        life: 8000
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Export Failed',
      detail: error instanceof Error ? error.message : 'Unknown error occurred',
      life: 8000
    })
  } finally {
    isExporting.value = false
  }
}
</script> 