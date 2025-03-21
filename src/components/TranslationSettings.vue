<template>
  <Card>
    <template #title>Translation Settings</template>
    <template #content>
      <div class="flex flex-col gap-4">
        <!-- Language Selection -->
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block mb-2">Source Language</label>
            <Dropdown 
              v-model="store.sourceLanguage"
              :options="languages"
              optionLabel="name"
              optionValue="code"
              placeholder="Select source language"
              class="w-full"
            />
          </div>
          <div class="flex-1">
            <label class="block mb-2">Target Language</label>
            <Dropdown 
              v-model="store.targetLanguage"
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
          <label class="block mb-2">AI Provider</label>
          <Dropdown 
            v-model="store.aiProvider"
            :options="aiProviders"
            optionLabel="name"
            optionValue="type"
            placeholder="Select AI provider"
            class="w-full"
          />
        </div>

        <!-- AI Model Selection -->
        <div v-if="store.aiProvider === 'ollama'">
          <label class="block mb-2">Ollama Model</label>
          <Dropdown 
            v-model="store.aiModel"
            :options="ollamaModels"
            optionLabel="name"
            optionValue="id"
            placeholder="Select Ollama model"
            class="w-full"
          />
        </div>

        <!-- API Key Input -->
        <div v-if="store.aiProvider === 'chatgpt'">
          <label class="block mb-2">OpenAI API Key</label>
          <Password 
            v-model="store.apiKey"
            :feedback="false"
            placeholder="Enter your OpenAI API key"
            class="w-full"
          />
        </div>

        <!-- Validation -->
        <div v-if="!isValid" class="text-red-500">
          <i class="pi pi-exclamation-circle mr-2"></i>
          Please fill in all required settings
        </div>
      </div>
    </template>
  </Card>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useTranslationStore } from '@/stores/translation'

const store = useTranslationStore()

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
const isValid = computed(() => {
  if (!store.sourceLanguage || !store.targetLanguage || !store.aiProvider) {
    return false
  }
  if (store.aiProvider === 'chatgpt' && !store.apiKey) {
    return false
  }
  return true
})
</script> 