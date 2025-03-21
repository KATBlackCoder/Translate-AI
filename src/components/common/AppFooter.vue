<script setup lang="ts">
import { ref } from 'vue'
import ProgressBar from 'primevue/progressbar'

const progress = ref(0)
const status = ref('Ready')
</script>

<template>
  <footer class="bg-white dark:bg-gray-800 border-t dark:border-gray-700">
    <div class="flex items-center justify-between h-12 px-4">
      <!-- Left side -->
      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ status }}
      </div>

      <!-- Center -->
      <div class="flex-1 max-w-md mx-4">
        <ProgressBar 
          :value="progress" 
          :showValue="false"
          class="h-1"
        />
      </div>

      <!-- Right side -->
      <div class="text-sm text-gray-500 dark:text-gray-400">
        v0.1.0
      </div>
    </div>
  </footer>
</template>

<style scoped>
.p-progressbar {
  background: #e5e7eb;
}

:deep(.dark) .p-progressbar {
  background: #374151;
}

.p-progressbar-value {
  background: #3b82f6;
}

:deep(.dark) .p-progressbar-value {
  background: #60a5fa;
}
</style> 