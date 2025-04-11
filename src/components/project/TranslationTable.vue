<script setup lang="ts">
import { computed } from 'vue'
import { useTranslationStore } from '@/stores/translation'
import type { ResourceTranslation } from '@/types/shared/translation'

interface Props {
  resources: ResourceTranslation[]
  isTranslating: boolean
}

const props = defineProps<Props>()
const translationStore = useTranslationStore()

// Computed properties
const translations = computed(() => props.resources.map(text => ({
  resourceId: text.resourceId,
  key: `${text.file}:${text.field}`,
  source: text.source,
  target: translationStore.results.find(t => 
    t.resourceId === text.resourceId && 
    t.field === text.field && 
    t.file === text.file
  )?.target || ''
})))

// Helper function to get status icon class
function getStatusClass(isTranslated: boolean): string {
  if (isTranslated) return 'pi pi-check text-green-500'
  return props.isTranslating ? 'pi pi-spin pi-spinner text-blue-500' : 'pi pi-minus text-gray-400'
}
</script>

<template>
  <Card class="w-full">
    <template #title>
      <div class="flex items-center gap-2">
        <i class="pi pi-list text-blue-500"></i>
        <span>Translation Results</span>
      </div>
    </template>
    <template #content>
      <DataTable 
        :value="translations" 
        class="p-datatable-sm"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        :loading="isTranslating"
        sortField="key"
        :sortOrder="1"
        dataKey="resourceId"
      >
        <Column header="#" style="width: 8%">
          <template #body="{ index }">
            {{ index + 1 }}
          </template>
        </Column>
        
        <Column field="key" header="Path" style="width: 25%">
          <template #body="{ data }">
            <div class="flex items-center">
              <i class="pi pi-file-o mr-2 text-gray-500"></i>
              <span class="text-sm">{{ data.key }}</span>
            </div>
          </template>
        </Column>
        
        <Column field="source" header="Source Text" style="width: 35%">
          <template #body="{ data }">
            <div class="whitespace-pre-wrap text-sm">{{ data.source }}</div>
          </template>
        </Column>
        
        <Column field="target" header="Translation" style="width: 35%">
          <template #body="{ data }">
            <div v-if="data.target" class="whitespace-pre-wrap text-sm">{{ data.target }}</div>
            <div v-else class="text-gray-400 italic text-sm">Not translated</div>
          </template>
        </Column>
        
        <Column style="width: 5%">
          <template #body="{ data }">
            <i :class="getStatusClass(!!data.target)"></i>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template> 