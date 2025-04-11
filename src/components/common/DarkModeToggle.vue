<script setup lang="ts">
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

onMounted(() => {
  settingsStore.initializeTheme()
})
</script>

<template>
  <div class="flex items-center">
    <Button
      :icon="settingsStore.isDark ? 'pi pi-moon' : 'pi pi-sun'"
      text
      rounded
      @click="settingsStore.toggleDarkMode"
      :class="settingsStore.isDark ? 'text-gray-300' : 'text-gray-700'"
      v-tooltip.bottom="settingsStore.isDark ? 'Light Mode' : 'Dark Mode'"
    />

  </div>
</template> 