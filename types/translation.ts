export interface SourceStringData {
  objectId: number;
  originalText: string;
  sourceFile: string;
  jsonPath: string;
}

export interface WorkingTranslation {
  objectId: number;
  originalText: string;
  translatedText: string;
  sourceFile: string;
  jsonPath: string;
  translationSource: string;
  error: string | null;
}
