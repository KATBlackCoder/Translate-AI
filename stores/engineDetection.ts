import { defineStore } from 'pinia'
import { ref } from 'vue'

type EngineDetectionResult = {
  engine: string | null
  error?: string
}

export const useEngineDetectionStore = defineStore('engineDetection', () => {
  const result = ref<EngineDetectionResult | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const detectEngine = async (folderPath: string) => {
    isLoading.value = true
    error.value = null
    result.value = null
    try {
      // @ts-expect-error: Tauri global
      const detected = await window.__TAURI__.invoke<EngineDetectionResult>('engine_detection', { folderPath })
      result.value = detected
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Engine detection failed'
    } finally {
      isLoading.value = false
    }
  }

  return { result, isLoading, error, detectEngine }
})
