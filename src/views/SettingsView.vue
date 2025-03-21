<script setup lang="ts">
import { ref } from 'vue'

const settings = ref({
  defaultLanguage: 'en',
  autoSave: true,
  theme: 'light'
})

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' }
]

const themes = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' }
]
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-semibold text-gray-800">Settings</h2>

    <Card>
      <template #title>General</template>
      <template #content>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">Default Language</label>
            <Select 
              v-model="settings.defaultLanguage"
              :options="languages"
              optionLabel="label"
              optionValue="value"
              class="w-48"
            />
          </div>

          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">Theme</label>
            <Select 
              v-model="settings.theme"
              :options="themes"
              optionLabel="label"
              optionValue="value"
              class="w-48"
            />
          </div>

          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">Auto Save</label>
            <InputSwitch v-model="settings.autoSave" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template> 