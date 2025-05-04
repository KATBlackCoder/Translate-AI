<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <UButton
        color="primary"
        :loading="isLoading"
        size="lg"
        @click="selectFolder"
      >
        Select Game Folder
      </UButton>
      <div v-if="selectedPath" class="text-xs text-gray-500 truncate">
        {{ selectedPath }}
      </div>
    </div>

    <div v-if="isLoading" class="text-sm">Detecting game engine...</div>

    <UAlert v-if="detectionError" color="error" variant="soft" class="mt-2">
      <div class="font-medium">Detection failed</div>
      <div class="text-sm">{{ detectionError }}</div>
    </UAlert>

    <div v-if="detectionResult && !detectionError" class="mt-2">
      <UCard>
        <template #header>
          <div class="font-medium">Detection Results</div>
        </template>

        <div v-if="detectionResult.engine" class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-500">Engine:</span>
            <span class="font-medium">{{ detectionResult.engine }}</span>
          </div>

          <div class="flex justify-between">
            <span class="text-gray-500">Actors.json:</span>
            <span
              class="font-medium"
              :class="{
                'text-green-600': detectionResult.actors_path,
                'text-red-500': !detectionResult.actors_path,
              }"
            >
              {{ detectionResult.actors_path ? "Found" : "Not found" }}
            </span>
          </div>
        </div>

        <div v-else class="text-amber-500">
          No supported game engine detected in this folder
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useEngineDetection } from "~/composables/useEngineDetection";

const emit = defineEmits<{
  (e: "update:path", path: string): void;
  (
    e: "detection-complete",
    result: { engine: string | null; actors_path: string | null }
  ): void;
}>();

const selectedPath = ref<string | null>(null);
const {
  detectEngine,
  result: detectionResult,
  isLoading,
  error,
} = useEngineDetection();
// @ts-expect-error: Tauri global
const { open } = window.__TAURI__.dialog;
const detectionError = computed(() => error.value);

const selectFolder = async () => {
  const path = await open({ directory: true, multiple: false });
  if (typeof path === "string") {
    selectedPath.value = path;
    emit("update:path", path);

    // Start engine detection
    await detectEngine(path);
    // Emit detection result when complete
    if (detectionResult.value) {
      emit("detection-complete", {
        engine: detectionResult.value.engine,
        actors_path: detectionResult.value.actors_path,
      });
    }
  }
};
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
