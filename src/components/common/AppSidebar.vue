<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useEngineStore } from '@/stores/engine'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps<{
  isCollapsed?: boolean
}>()

const router = useRouter()
const engineStore = useEngineStore()
const settingsStore = useSettingsStore()

const hasActiveProject = computed(() => engineStore.hasProjectFiles)

</script>

<template>
  <aside 
    class="bg-white dark:bg-gray-800 shadow-sm transition-all duration-300"
    :class="{ 'w-64': !props.isCollapsed, 'w-20': props.isCollapsed }"
  >
    <div class="h-full flex flex-col">
      <!-- Logo -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-center">
          <i class="pi pi-language text-2xl text-blue-500"></i>
          <span v-if="!props.isCollapsed" class="ml-2 font-semibold text-gray-800 dark:text-gray-200">Translation AI</span>
        </div>
      </div>
      
      <!-- Project Status -->
      <div v-if="!props.isCollapsed && hasActiveProject" class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex flex-col gap-2">
          <div class="flex items-center">
            <i class="pi pi-cog text-gray-500 dark:text-gray-400 w-6"></i>
            <span class="text-xs text-gray-600 dark:text-gray-400">{{ engineStore.engineName }}</span>
          </div>
          <div class="flex items-center">
            <i class="pi pi-globe text-gray-500 dark:text-gray-400 w-6"></i>
            <span class="text-xs text-gray-600 dark:text-gray-400">{{ settingsStore.sourceLanguage }} → {{ settingsStore.targetLanguage }}</span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4">
        <div class="space-y-2">
          <button 
            class="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            @click="router.push('/')"
          >
            <i class="pi pi-home text-lg w-6"></i>
            <span v-if="!props.isCollapsed" class="ml-2">Home</span>
          </button>
          
          <button 
            v-if="hasActiveProject"
            class="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            @click="router.push('/translation')"
          >
            <i class="pi pi-sync text-lg w-6"></i>
            <span v-if="!props.isCollapsed" class="ml-2">Translation</span>
          </button>

          <button 
            class="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            @click="router.push('/settings')"
          >
            <i class="pi pi-cog text-lg w-6"></i>
            <span v-if="!props.isCollapsed" class="ml-2">Settings</span>
          </button>
          
          <button 
            class="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            @click="router.push('/about')"
          >
            <i class="pi pi-info-circle text-lg w-6"></i>
            <span v-if="!props.isCollapsed" class="ml-2">About</span>
          </button>
        </div>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700">
        <div v-if="!props.isCollapsed" class="text-xs text-center text-gray-500 dark:text-gray-400">
          Translation AI v0.1.0
        </div>
        <div v-else class="flex justify-center">
          <i class="pi pi-info text-gray-500 dark:text-gray-400"></i>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Fix the width transition */
aside {
  min-height: 100vh;
}

/* Smooth hover effects */
button {
  transition: all 0.2s ease;
}
</style> 