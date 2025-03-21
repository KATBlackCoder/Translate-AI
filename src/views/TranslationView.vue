<script setup lang="ts">
import { ref } from 'vue'

const translations = ref([
  { id: 1, key: 'menu.start', source: 'Start', target: '' },
  { id: 2, key: 'menu.settings', source: 'Settings', target: '' },
  { id: 3, key: 'menu.quit', source: 'Quit', target: '' }
])
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-semibold text-gray-800">Translation</h2>
      <div class="space-x-2">
        <Button label="Import" icon="pi pi-upload" />
        <Button label="Export" icon="pi pi-download" />
      </div>
    </div>

    <Card>
      <template #content>
        <DataTable :value="translations" class="p-datatable-sm">
          <Column field="key" header="Key" />
          <Column field="source" header="Source" />
          <Column field="target" header="Target">
            <template #body="{ data }">
              <input 
                type="text" 
                v-model="data.target"
                class="w-full p-2 border rounded"
                placeholder="Enter translation..."
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template> 