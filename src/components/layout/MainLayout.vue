<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import { RouterView } from 'vue-router'
import Toast from 'primevue/toast'

// State for sidebar
const isSidebarCollapsed = ref(false)

// Toggle sidebar
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Header -->
    <AppHeader @toggle-sidebar="toggleSidebar"/>

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <AppSidebar :is-collapsed="isSidebarCollapsed" class="flex-shrink-0" />

      <!-- Main Content -->
      <main 
        class="flex-1 overflow-auto p-4 transition-all ml-auto duration-300"
      >
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </main>
    </div>

    <!-- Footer -->
    <AppFooter />

  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 