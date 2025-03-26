<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold dark:text-white">Settings</h1>
      <p class="text-gray-600 dark:text-gray-400">Configure your translation environment</p>
    </div>
    
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-1">
      <TranslationSettings />
    </div>
  </div>
</template>

<script setup lang="ts">
import TranslationSettings from '@/components/project/TranslationSettings.vue'
</script>
