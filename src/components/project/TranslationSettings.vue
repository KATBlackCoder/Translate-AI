<template>
  <Card class="h-full">
    <template #title>
      <div class="text-lg font-medium">Translation Settings</div>
    </template>
    <template #content>
      <div class="flex flex-col gap-6">
        <!-- Language Selection -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Source Language</label>
            <Select 
              v-model="settingsStore.sourceLanguage"
              :options="languages"
              optionLabel="name"
              optionValue="code"
              placeholder="Select source language"
              class="w-full"
            />
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">Target Language</label>
            <Select 
              v-model="settingsStore.targetLanguage"
              :options="languages"
              optionLabel="name"
              optionValue="code"
              placeholder="Select target language"
              class="w-full"
            />
          </div>
        </div>

        <!-- AI Provider Selection -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700">AI Provider</label>
          <Select 
            v-model="settingsStore.aiProvider"
            :options="aiProviders"
            optionLabel="name"
            optionValue="type"
            placeholder="Select AI provider"
            class="w-full"
          />
        </div>

        <!-- AI Model Selection -->
        <div v-if="settingsStore.aiProvider === 'ollama'">
          <label class="block mb-2 text-sm font-medium text-gray-700">Ollama Model</label>
          <Select 
            v-model="settingsStore.aiModel"
            :options="ollamaModels"
            optionLabel="name"
            optionValue="id"
            placeholder="Select Ollama model"
            class="w-full"
          />
        </div>

        <!-- API Key Input -->
        <div v-if="settingsStore.aiProvider === 'chatgpt'">
          <label class="block mb-2 text-sm font-medium text-gray-700">OpenAI API Key</label>
          <Password 
            v-model="settingsStore.apiKey"
            :feedback="false"
            placeholder="Enter your OpenAI API key"
            class="w-full"
          />
        </div>

        <!-- Validation -->
        <div v-if="!isValid" class="text-red-600 flex items-center gap-2">
          <i class="pi pi-exclamation-circle"></i>
          <span>Please fill in all required settings</span>
        </div>
      </div>
    </template>
  </Card>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

// Language options
const languages = [
  { name: 'Japanese', code: 'ja' },
  { name: 'English', code: 'en' },
  { name: 'Chinese', code: 'zh' },
  { name: 'Korean', code: 'ko' },
  { name: 'French', code: 'fr' },
  { name: 'German', code: 'de' },
  { name: 'Spanish', code: 'es' },
  { name: 'Italian', code: 'it' },
  { name: 'Portuguese', code: 'pt' },
  { name: 'Russian', code: 'ru' }
]

// AI Provider options
const aiProviders = [
  { name: 'Ollama (Local)', type: 'ollama' },
  { name: 'ChatGPT', type: 'chatgpt' }
]

// Ollama model options
const ollamaModels = [
  { name: 'Mistral', id: 'mistral' },
  { name: 'Llama 2', id: 'llama2' },
  { name: 'Code Llama', id: 'codellama' },
  { name: 'Neural Chat', id: 'neural-chat' }
]

// Validation
const isValid = computed(() => settingsStore.isTranslationConfigValid && settingsStore.isAIConfigValid)
</script> 