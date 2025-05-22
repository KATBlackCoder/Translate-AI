<template>
  <div class="space-y-6">
    <!-- Source Language and Text Area -->
    <UFormField label="Source Language & Text" name="source">
      <div class="flex items-center space-x-2 mb-2">
        <USelectMenu 
          v-model="sourceLanguage" 
          :items="languageOptions"
          value-key="id" 
          placeholder="Select source language"
          class="w-1/2"
        />
        <span class="text-sm text-gray-500 dark:text-gray-400">(Source)</span>
      </div>
      <UTextarea 
        v-model="sourceTextModel" 
        placeholder="Enter text to translate..."
        :rows="6"
        autoresize
      />
    </UFormField>

    <!-- Action Buttons -->
    <div class="flex justify-center space-x-3">
      <UButton icon="i-lucide-repeat" label="Swap" color="neutral" @click="store.swapLanguages()" />
      <UButton 
        icon="i-lucide-languages" 
        label="Translate" 
        :disabled="!canTranslate"
        :loading="isLoading"
        @click="store.handleTranslate()" 
      />
      <UButton icon="i-lucide-trash-2" label="Clear" color="error" variant="outline" @click="store.clearTexts()" />
    </div>

    <!-- Target Language and Text Area -->
    <UFormField label="Target Language & Translation" name="target">
      <div class="flex items-center space-x-2 mb-2">
        <USelectMenu 
          v-model="targetLanguage" 
          :items="languageOptions"
          value-key="id" 
          placeholder="Select target language"
          class="w-1/2"
        />
        <span class="text-sm text-gray-500 dark:text-gray-400">(Target)</span>
      </div>
      <UTextarea 
        v-model="targetText" 
        placeholder="Translation will appear here..."
        :rows="6"
        autoresize
        readonly
      />
    </UFormField>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useTranslationStore } from '@/stores/translation'; // Adjusted path if needed, Nuxt usually handles `@/`
import { storeToRefs } from 'pinia';

const store = useTranslationStore();

const { 
  sourceLanguage, 
  targetLanguage, 
  targetText, 
  isLoading, 
  languageOptions, 
  canTranslate 
} = storeToRefs(store);

// Computed property for v-model on sourceText to use the store's action
const sourceTextModel = computed({
  get: () => store.sourceText,
  set: (value) => {
    store.setSourceText(value);
  }
});
</script>

<style>
/* Component-specific styles can go here if needed */
</style>