<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const props = defineProps<{
  isCollapsed: boolean
}>()

const router = useRouter()

// Example tree data - will be replaced with actual project data
const treeData = ref([
  {
    key: '0',
    label: 'Project Files',
    icon: 'pi pi-folder',
    children: [
      {
        key: '0-0',
        label: 'data',
        icon: 'pi pi-folder',
        children: [
          {
            key: '0-0-0',
            label: 'Actors.json',
            icon: 'pi pi-file'
          },
          {
            key: '0-0-1',
            label: 'Classes.json',
            icon: 'pi pi-file'
          },
          {
            key: '0-0-2',
            label: 'Skills.json',
            icon: 'pi pi-file'
          }
        ]
      }
    ]
  }
])

const onNodeSelect = (node: any) => {
  if (node.key.includes('-')) {
    // Handle file selection
    console.log('Selected file:', node.label)
  }
}
</script>

<template>
  <aside 
    class="bg-white shadow-sm transition-all duration-300"
    :class="{ 'w-64': !isCollapsed, 'w-16': isCollapsed }"
  >
    <div class="h-full flex flex-col">
      <!-- Navigation -->
      <nav class="flex-1 p-4">
        <div class="space-y-2">
          <button 
            class="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            @click="router.push('/')"
          >
            <i class="pi pi-home mr-2"></i>
            <span v-if="!isCollapsed">Home</span>
          </button>
          <button 
            class="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            @click="router.push('/translation')"
          >
            <i class="pi pi-language mr-2"></i>
            <span v-if="!isCollapsed">Translation</span>
          </button>
          <button 
            class="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            @click="router.push('/settings')"
          >
            <i class="pi pi-cog mr-2"></i>
            <span v-if="!isCollapsed">Settings</span>
          </button>
        </div>
      </nav>

      <!-- Project Tree -->
      <div class="p-4 border-t">
        <Tree 
          v-if="!isCollapsed"
          :value="treeData" 
          selectionMode="single"
          @node-select="onNodeSelect"
          class="w-full"
        />
        <div v-else class="flex justify-center">
          <i class="pi pi-folder text-gray-500"></i>
        </div>
      </div>
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

.p-tree .p-treenode.p-highlight > .p-treenode-content {
  background: #e5e7eb;
}
</style> 