<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Provider Configuration</h2>
          <UBadge v-if="providerStore.isConfigured" color="success">Configured</UBadge>
          <UBadge v-else color="warning">Not Configured</UBadge>
        </div>
      </template>

      <UForm :state="form" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="Provider Type" name="type">
          <USelect
            v-model="form.type"
            :options="providerTypes"
            :disabled="true"
            placeholder="Select provider type"
          />
          <template #hint>
            Currently only Ollama is supported
          </template>
        </UFormGroup>

        <UFormGroup label="Endpoint URL" name="endpoint_url" required>
          <UInput
            v-model="form.config.endpoint_url"
            :disabled="providerStore.isLoading"
            placeholder="http://localhost:11434"
          />
          <template #hint>
            The URL of your Ollama API server
          </template>
        </UFormGroup>

        <UFormGroup label="Model Name" name="model_name" required>
          <UInput
            v-model="form.config.model_name"
            :disabled="providerStore.isLoading"
            placeholder="mistral"
          />
          <template #hint>
            The name of the model to use for translation (e.g., mistral, llama2)
          </template>
        </UFormGroup>

        <div class="flex justify-between">
          <UButton
            color="neutral"
            variant="soft"
            :loading="providerStore.isLoading"
            :disabled="providerStore.isLoading"
            @click="resetToDefaults"
          >
            Reset to Defaults
          </UButton>
          
          <UButton
            type="submit"
            color="primary"
            :loading="providerStore.isLoading"
            :disabled="providerStore.isLoading"
          >
            Save Configuration
          </UButton>
        </div>
      </UForm>

      <UAlert
        v-if="saveSuccess"
        class="mt-4"
        color="success"
        variant="soft"
        icon="i-heroicons-check-circle"
      >
        Configuration saved successfully!
      </UAlert>

      <UAlert
        v-if="providerStore.hasError"
        class="mt-4"
        color="error"
        variant="soft"
        icon="i-heroicons-exclamation-triangle"
      >
        {{ providerStore.errorMessage }}
      </UAlert>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useProviderConfigStore, type ProviderConfig } from '~/stores/providerConfig'

const providerStore = useProviderConfigStore()
const saveSuccess = ref(false)

// Initialize the form with default values
const form = reactive<ProviderConfig>({
  type: 'ollama',
  config: {
    endpoint_url: 'http://localhost:11434',
    model_name: 'mistral'
  }
})

// Provider type options (for future extension)
const providerTypes = [
  { label: 'Ollama', value: 'ollama' }
]

// Load the current configuration
onMounted(async () => {
  if (!providerStore.isInitialized) {
    await providerStore.init()
  }
  
  if (providerStore.config) {
    // Clone the store config to avoid direct mutation
    form.type = providerStore.config.type
    form.config.endpoint_url = providerStore.config.config.endpoint_url
    form.config.model_name = providerStore.config.config.model_name
  }
})

// Submit handler
const onSubmit = async () => {
  saveSuccess.value = false
  
  const success = await providerStore.saveConfig({
    type: form.type,
    config: {
      endpoint_url: form.config.endpoint_url,
      model_name: form.config.model_name
    }
  })
  
  if (success) {
    saveSuccess.value = true
    // Hide success message after 3 seconds
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  }
}

// Reset to defaults
const resetToDefaults = async () => {
  saveSuccess.value = false
  
  const success = await providerStore.resetToDefaults()
  
  if (success && providerStore.config) {
    // Update form with reset values
    form.type = providerStore.config.type
    form.config.endpoint_url = providerStore.config.config.endpoint_url
    form.config.model_name = providerStore.config.config.model_name
    
    saveSuccess.value = true
    // Hide success message after 3 seconds
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  }
}
</script>

<style>

</style>