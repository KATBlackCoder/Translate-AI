<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const menu = ref()

const items = [
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

const toggleMenu = (event: Event) => {
  menu.value?.toggle(event)
}
</script>

<template>
  <header class="bg-white shadow-sm">
    <div class="flex items-center justify-between h-16 px-4">
      <!-- Left side -->
      <div class="flex items-center space-x-4">
        <Button 
          icon="pi pi-bars" 
          text 
          @click="$emit('toggle-sidebar')"
        />
        <h1 class="text-xl font-semibold text-gray-800">Game Translation</h1>
      </div>

      <!-- Center -->
      <div class="flex-1 max-w-2xl mx-4">
        <div class="text-sm text-gray-500">
          Project: <span class="font-medium text-gray-700">No Project Selected</span>
        </div>
      </div>

      <!-- Right side -->
      <div class="flex items-center space-x-4">
        <Button 
          icon="pi pi-user" 
          text 
          @click="toggleMenu"
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
</style> 