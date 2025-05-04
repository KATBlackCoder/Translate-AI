<template>
  <div class="container mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold mb-6">Game Translator</h1>

    <div class="max-w-2xl">
      <FileSelector
        @update:path="onPathSelected"
        @detection-complete="onDetectionComplete"
      />
    </div>

    <div v-if="detectionResult && detectionResult.engine" class="mt-8">
      <!-- This section will be expanded to show translation options when we build Phase 1.3 -->
      <UCard>
        <template #header>
          <div class="font-medium">Ready for Translation</div>
        </template>
        <p>Your {{ detectionResult.engine }} game is ready for translation.</p>
        <template #footer>
          <UButton color="primary" :disabled="!detectionResult.actors_path">
            Start Translation
          </UButton>
        </template>
      </UCard>
    </div>
    <div>
      <ProviderConfigEditor />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const selectedPath = ref<string | null>(null);
const detectionResult = ref<{
  engine: string | null;
  actors_path: string | null;
} | null>(null);

const onPathSelected = (path: string) => {
  selectedPath.value = path;
};

const onDetectionComplete = (result: {
  engine: string | null;
  actors_path: string | null;
}) => {
  detectionResult.value = result;
};
</script>

<style>
/* Add any global styles here */
</style>
