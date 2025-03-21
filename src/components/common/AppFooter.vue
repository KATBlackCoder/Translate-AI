<script setup lang="ts">
import { ref } from 'vue'
import ProgressBar from 'primevue/progressbar'

const progress = ref(0)
const status = ref('Ready')
</script>

<template>
  <footer class="bg-white border-t">
    <div class="flex items-center justify-between h-12 px-4">
      <!-- Left side -->
      <div class="text-sm text-gray-500">
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
      <div class="text-sm text-gray-500">
        v0.1.0
      </div>
    </div>
  </footer>
</template>

<style scoped>
.p-progressbar {
  background: #e5e7eb;
  border-radius: 9999px;
}

.p-progressbar-value {
  background: #3b82f6;
  border-radius: 9999px;
}
</style> 