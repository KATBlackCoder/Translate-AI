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
          <div class="mt-1 text-sm text-gray-500">
            Server URL: 
            <InputText 
              v-model="settingsStore.baseUrl" 
              placeholder="http://localhost:11434"
              class="w-full mt-1"
            />
          </div>
        </div>

        <!-- ChatGPT Settings -->
        <div v-if="settingsStore.aiProvider === 'chatgpt'">
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-700">OpenAI Model</label>
            <Select 
              v-model="settingsStore.aiModel"
              :options="chatgptModels"
              optionLabel="name"
              optionValue="id"
              placeholder="Select OpenAI model"
              class="w-full"
            />
          </div>
          
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-700">OpenAI API Key</label>
            <Password 
              v-model="settingsStore.apiKey"
              :feedback="false"
              placeholder="Enter your OpenAI API key"
              class="w-full"
              toggleMask
            />
          </div>
          
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-700">API Base URL (Optional)</label>
            <InputText 
              v-model="settingsStore.baseUrl" 
              placeholder="https://api.openai.com/v1"
              class="w-full"
            />
          </div>
        </div>
        
        <!-- DeepSeek Settings -->
        <div v-if="settingsStore.aiProvider === 'deepseek'">
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-700">DeepSeek Model</label>
            <Select 
              v-model="settingsStore.aiModel"
              :options="deepseekModels"
              optionLabel="name"
              optionValue="id"
              placeholder="Select DeepSeek model"
              class="w-full"
            />
          </div>
          
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-700">API Key</label>
            <Password 
              v-model="settingsStore.apiKey"
              :feedback="false"
              placeholder="Enter your DeepSeek API key"
              class="w-full"
              toggleMask
            />
          </div>
          
          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-700">API Base URL</label>
            <InputText 
              v-model="settingsStore.baseUrl" 
              placeholder="https://api.deepseek.com/v1"
              class="w-full"
            />
          </div>
        </div>

        <!-- Quality Settings -->
        <Accordion :activeIndex="0">
          <AccordionTab header="Advanced Settings">
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">Temperature</label>
                <div class="flex items-center gap-2">
                  <Slider 
                    v-model="settingsStore.qualitySettings.temperature" 
                    :min="0" 
                    :max="2" 
                    :step="0.1"
                    class="w-full" 
                  />
                  <span class="text-sm">{{ settingsStore.qualitySettings.temperature }}</span>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  Lower values are more focused, higher values more creative
                </div>
              </div>
              
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">Max Tokens</label>
                <InputNumber 
                  v-model="settingsStore.qualitySettings.maxTokens" 
                  :min="100" 
                  :max="8000"
                  class="w-full"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">Batch Size</label>
                <InputNumber 
                  v-model="settingsStore.qualitySettings.batchSize" 
                  :min="1" 
                  :max="50"
                  class="w-full"
                />
                <div class="text-xs text-gray-500 mt-1">
                  Number of texts to translate in one batch
                </div>
              </div>
              
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">Retry Count</label>
                <InputNumber 
                  v-model="settingsStore.qualitySettings.retryCount" 
                  :min="0" 
                  :max="10"
                  class="w-full"
                />
              </div>
            </div>
          </AccordionTab>
        </Accordion>

        <!-- Validation -->
        <div v-if="!isValid" class="text-red-600 flex items-center gap-2">
          <i class="pi pi-exclamation-circle"></i>
          <span>Please fill in all required settings</span>
        </div>

        <div v-if="isValid" class="text-green-600 flex items-center gap-2">
          <i class="pi pi-check-circle"></i>
          <span>Settings valid</span>
        </div>
        
        <!-- Reset Button -->
        <div class="flex justify-end mt-4">
          <Button 
            label="Reset Settings" 
            icon="pi pi-refresh" 
            severity="secondary" 
            @click="resetSettings"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
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
  { name: 'ChatGPT', type: 'chatgpt' },
  { name: 'DeepSeek', type: 'deepseek' }
]

// Default base URLs
const defaultBaseUrls = {
  ollama: 'http://localhost:11434',
  chatgpt: 'https://api.openai.com/v1',
  deepseek: 'https://api.deepseek.com/v1'
}

// Ollama model options
const ollamaModels = [
  { name: 'Mistral', id: 'mistral' },
  { name: 'Llama 2', id: 'llama2' },
  { name: 'Code Llama', id: 'codellama' },
  { name: 'Neural Chat', id: 'neural-chat' },
  { name: 'Qwen', id: 'qwen' }
]

// ChatGPT model options
const chatgptModels = [
  { name: 'GPT-3.5 Turbo', id: 'gpt-3.5-turbo' },
  { name: 'GPT-4', id: 'gpt-4' },
  { name: 'GPT-4 Turbo', id: 'gpt-4-turbo' }
]

// DeepSeek model options
const deepseekModels = [
  { name: 'DeepSeek Chat', id: 'deepseek-chat' },
  { name: 'DeepSeek Coder', id: 'deepseek-coder' }
]

// Set default base URL when provider changes
watch(() => settingsStore.aiProvider, (newProvider) => {
  if (newProvider && (!settingsStore.baseUrl || settingsStore.baseUrl === '')) {
    settingsStore.baseUrl = defaultBaseUrls[newProvider as keyof typeof defaultBaseUrls] || ''
  }
}, { immediate: true })

// Validation
const isValid = computed(() => settingsStore.isTranslationConfigValid && settingsStore.isAIConfigValid)

// Add resetSettings function
function resetSettings() {
  // Reset language settings
  settingsStore.sourceLanguage = 'ja'
  settingsStore.targetLanguage = 'en'
  
  // Reset AI provider settings
  settingsStore.aiProvider = 'ollama'
  settingsStore.aiModel = 'mistral'
  settingsStore.baseUrl = defaultBaseUrls.ollama
  settingsStore.apiKey = ''
  
  // Reset quality settings
  settingsStore.qualitySettings = {
    temperature: 0.3,
    maxTokens: 1000,
    retryCount: 3,
    batchSize: 10,
    timeout: 30000
  }
}
</script> 