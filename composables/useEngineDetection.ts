type EngineDetectionResult = {
  engine: string | null;
  actors_path: string | null;
  error?: string;
};

export const useEngineDetection = () => {
  const result = ref<EngineDetectionResult | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const detectEngine = async (folderPath: string) => {
    isLoading.value = true;
    error.value = null;
    result.value = null;
    console.log("detectEngine", folderPath);
    try {
      // @ts-expect-error: Tauri global
      const detected = await window.__TAURI__.core.invoke<EngineDetectionResult>(
          "detect_engine_and_find_actors",
          { folder_path: folderPath }
        );
      result.value = detected;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Engine detection failed";
    } finally {
      isLoading.value = false;
    }
  };

  return { detectEngine, result, isLoading, error };
};
