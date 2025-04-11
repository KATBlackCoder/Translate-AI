<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEngineStore } from '@/stores/engine'
import { useSettingsStore } from '@/stores/settings'
import DarkModeToggle from './DarkModeToggle.vue'

const router = useRouter()
const menu = ref()
const engineStore = useEngineStore()
const settingsStore = useSettingsStore()

const items = [
  {
    label: 'Home',
    icon: 'pi pi-home',
    command: () => router.push('/')
  },
  {
    label: 'Settings',
    icon: 'pi pi-cog',
    command: () => router.push('/settings')
  },
  {
    label: 'About',
    icon: 'pi pi-info-circle',
    command: () => router.push('/about')
  }
]

// Computed properties
const projectName = computed(() => {
  if (!engineStore.hasProjectFiles) return 'No Project Selected'
  return 'Active Project'
})

const hasActiveProject = computed(() => engineStore.hasProjectFiles)

const toggleMenu = (event: Event) => {
  menu.value?.toggle(event)
}
</script>

<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm">
    <div class="flex items-center justify-between h-16 px-4">
      <!-- Left side -->
      <div class="flex items-center space-x-4">
        <Button 
          icon="pi pi-bars" 
          text 
          @click="$emit('toggle-sidebar')"
          class="dark:text-gray-300"
        />
        <h1 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Game Translation</h1>
      </div>

      <!-- Center -->
      <div class="flex-1 max-w-2xl mx-4">
        <div class="flex items-center">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Project: <span class="font-medium text-gray-700 dark:text-gray-300">{{ projectName }}</span>
          </div>
          <div v-if="hasActiveProject" class="ml-2 flex items-center">
            <Badge value="Active" severity="success" class="ml-2" />
            
            <div class="ml-4 text-xs text-gray-500 dark:text-gray-400">
              <span class="ml-2">{{ engineStore.engineName }}</span> | 
              <span>{{ settingsStore.sourceLanguage }} → {{ settingsStore.targetLanguage }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side -->
      <div class="flex items-center space-x-4">
        <Button 
          v-if="hasActiveProject"
          icon="pi pi-sync" 
          text 
          @click="router.push('/translation')"
          class="dark:text-gray-300"
          tooltip="Go to Translation"
          tooltipOptions="{ position: 'bottom' }"
        />
        <DarkModeToggle />
        <Button 
          icon="pi pi-ellipsis-v" 
          text 
          @click="toggleMenu"
          class="dark:text-gray-300"
        />
        <Menu 
          ref="menu" 
          :model="items" 
          popup 
          class="w-48"
        />
      </div>
    </div>
  </header>
</template>

<style scoped>
.p-button.p-button-text:not(.p-disabled):hover {
  background: rgba(0, 0, 0, 0.04);
}

:deep(.dark) .p-button.p-button-text:not(.p-disabled):hover {
  background: rgba(255, 255, 255, 0.04);
}
</style> 