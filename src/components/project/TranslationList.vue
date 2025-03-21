<template>
  <Card>
    <template #title>
      <div class="flex items-center justify-between">
        <span>Extracted Texts</span>
        <div class="text-sm text-gray-500">
          {{ translatedCount }}/{{ totalCount }} translated
        </div>
      </div>
    </template>
    <template #content>
      <DataTable 
        v-model:selection="selectedTexts"
        :value="projectStore.extractedTexts" 
        :paginator="true" 
        :rows="10"
        :scrollable="true"
        scrollHeight="400px"
        selectionMode="multiple"
        dataKey="id"
        :loading="isTranslating"
        class="p-datatable-sm"
      >
        <Column field="id" header="ID" style="width: 8%">
          <template #body="{ data }">
            {{ data.id }}
          </template>
        </Column>
        
        <Column field="context" header="Context" style="width: 15%">
          <template #body="{ data }">
            <Tag :value="data.context" />
          </template>
        </Column>

        <Column field="source" header="Source Text" style="width: 35%">
          <template #body="{ data }">
            <div class="whitespace-pre-wrap">{{ data.source }}</div>
          </template>
        </Column>

        <Column field="target" header="Translation" style="width: 35%">
          <template #body="{ data }">
            <div v-if="getTranslation(data)" class="whitespace-pre-wrap">
              {{ getTranslation(data)?.target }}
            </div>
            <div v-else class="text-gray-400 italic">Not translated</div>
          </template>
        </Column>

        <Column style="width: 7%">
          <template #body="{ data }">
            <Button
              v-if="!getTranslation(data)"
              icon="pi pi-play"
              text
              rounded
              @click="translateSingle(data)"
              :disabled="!canTranslate || isTranslating"
              :loading="currentText?.id === data.id"
            />
            <Button 
              v-else
              icon="pi pi-sync"
              text
              rounded
              severity="warning"
              @click="translateSingle(data)"
              :disabled="!canTranslate || isTranslating"
              :loading="currentText?.id === data.id"
            />
          </template>
        </Column>
      </DataTable>

      <div class="flex justify-end gap-2 mt-4">
        <Button
          label="Translate Selected"
          icon="pi pi-play"
          :disabled="!canTranslateSelected || isTranslating"
          :loading="isTranslatingSelected"
          @click="translateSelected"
        />
        <Button
          label="Translate All"
          icon="pi pi-play"
          severity="success"
          :disabled="!canTranslate || isTranslating"
          :loading="isTranslatingAll"
          @click="translateAll"
        />
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
import { ref, computed } from 'vue'
import { useTranslationStore } from '@/stores/translation'
import { useProjectStore } from '@/stores/project'
import { useSettingsStore } from '@/stores/settings'
import type { TranslationTarget } from '@/types/engines/base'
import { useAIStore } from '@/stores/ai'

const translationStore = useTranslationStore()
const projectStore = useProjectStore()
const settingsStore = useSettingsStore()
const selectedTexts = ref<TranslationTarget[]>([])
const currentText = ref<TranslationTarget | null>(null)
const isTranslatingSelected = ref(false)
const isTranslatingAll = ref(false)
const aiStore = useAIStore()

const totalCount = computed(() => projectStore.extractedTexts.length)
const translatedCount = computed(() => translationStore.translatedTexts.length)
const isTranslating = computed(() => translationStore.progress > 0 && translationStore.progress < 100)

const canTranslate = computed(() => 
  projectStore.extractedTexts.length > 0 && 
  settingsStore.isTranslationConfigValid && 
  settingsStore.isAIConfigValid
)

const canTranslateSelected = computed(() => 
  canTranslate.value && selectedTexts.value.length > 0
)

function getTranslation(text: TranslationTarget) {
  return translationStore.translatedTexts.find(t => 
    t.id === text.id && 
    t.field === text.field && 
    t.file === text.file
  )
}

async function translateSingle(text: TranslationTarget) {
  try {
    currentText.value = text
    const result = await aiStore.translate(text)
    if (result) {
      translationStore.translatedTexts.push(result)
    }
  } finally {
    currentText.value = null
  }
}

async function translateSelected() {
  try {
    isTranslatingSelected.value = true
    const result = await aiStore.translateBatch(selectedTexts.value)
    if (result.translations.length > 0) {
      translationStore.translatedTexts.push(...result.translations)
    }
  } finally {
    isTranslatingSelected.value = false
    selectedTexts.value = []
  }
}

async function translateAll() {
  try {
    isTranslatingAll.value = true
    await translationStore.translateAll()
  } finally {
    isTranslatingAll.value = false
  }
}
</script> 