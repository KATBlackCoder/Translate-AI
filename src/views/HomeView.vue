<script setup lang="ts">
import { ref } from 'vue'
import ProjectImport from '../components/project/ProjectImport.vue'

const recentProjects = ref([
  { name: 'Project 1', lastOpened: '2024-03-20' },
  { name: 'Project 2', lastOpened: '2024-03-19' }
])
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-semibold text-gray-800">Welcome</h2>
      <Button label="New Project" icon="pi pi-plus" />
    </div>

    <!-- Project Import -->
    <ProjectImport />

    <Card>
      <template #title>Recent Projects</template>
      <template #content>
        <div class="space-y-4">
          <div v-if="recentProjects.length === 0" class="text-center py-8 text-gray-500">
            No recent projects
          </div>
          <div v-else class="space-y-2">
            <div 
              v-for="project in recentProjects" 
              :key="project.name"
              class="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              <div>
                <div class="font-medium">{{ project.name }}</div>
                <div class="text-sm text-gray-500">Last opened: {{ project.lastOpened }}</div>
              </div>
              <Button icon="pi pi-chevron-right" text />
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template> 