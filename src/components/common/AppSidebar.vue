<script setup lang="ts">
import { useRouter } from 'vue-router'
const props = defineProps<{
  isCollapsed?: boolean
}>()

const router = useRouter()

</script>

<template>
  <aside 
    class="bg-white dark:bg-gray-800 shadow-sm transition-all duration-300"
    :class="{ 'w-40': !props.isCollapsed, 'w-20': props.isCollapsed }"
  >
    <div class="h-full flex flex-col">
      <!-- Navigation -->
      <nav class="flex-1 p-4" :class="{ 'transition-all delay-700': !props.isCollapsed }">
        <div class="space-y-2">
          <button 
            class="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            @click="router.push('/')"
          >
            <i class="pi pi-home mr-2"></i>
            <span v-if="!props.isCollapsed">Home</span>
          </button>
          <button 
            class="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            @click="router.push('/settings')"
          >
            <i class="pi pi-cog mr-2"></i>
            <span v-if="!props.isCollapsed">Settings</span>
          </button>
        </div>
      </nav>

    </div>
  </aside>
</template>

<style scoped>
.p-tree {
  border: none;
}

.p-tree .p-tree-container {
  padding: 0;
}

.p-tree .p-treenode {
  padding: 0;
}

.p-tree .p-treenode-content {
  padding: 0.5rem;
  border-radius: 0.375rem;
}

.p-tree .p-treenode-content:hover {
  background: #f3f4f6;
}

:deep(.dark) .p-tree .p-treenode-content:hover {
  background: #374151;
}

.p-tree .p-treenode.p-highlight > .p-treenode-content {
  background: #e5e7eb;
}

:deep(.dark) .p-tree .p-treenode.p-highlight > .p-treenode-content {
  background: #4b5563;
}
</style> 