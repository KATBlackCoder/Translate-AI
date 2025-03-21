<script setup lang="ts">
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-semibold text-gray-800">About</h2>

    <Card>
      <template #content>
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-medium text-gray-900">Game Translation</h3>
            <p class="text-sm text-gray-500">Version 0.1.0</p>
          </div>

          <div>
            <h4 class="text-sm font-medium text-gray-700">Description</h4>
            <p class="text-sm text-gray-600 mt-1">
              A modern desktop application for managing and translating game content.
              Built with Vue.js, Tauri, and PrimeVue.
            </p>
          </div>

          <div>
            <h4 class="text-sm font-medium text-gray-700">Features</h4>
            <ul class="mt-1 space-y-1 text-sm text-gray-600">
              <li>• Project management</li>
              <li>• Translation interface</li>
              <li>• File tree navigation</li>
              <li>• Import/Export support</li>
              <li>• Settings customization</li>
            </ul>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template> 