/**
 * Whisper model configuration and settings
 * Supports all Whisper model sizes
 */

export interface WhisperConfig {
  model: string
  language?: string
  task: 'transcribe' | 'translate'
  temperature: number
  bestOf: number
  beamSize: number
  patience: number
  lengthPenalty: number
  suppressTokens: string
  initialPrompt?: string
  conditionOnPreviousText: boolean
  fp16: boolean
  compressionRatioThreshold: number
  logprobThreshold: number
  noSpeechThreshold: number
  sampleRate: number
}

// All available Whisper models with sizes
export const WHISPER_MODELS: Record<string, { size: string; name: string; label: string; englishOnly?: boolean }> = {
  // Tiny models - Fastest, lowest accuracy
  tiny: { size: '39 MB', name: 'tiny', label: 'Tiny' },
  'tiny.en': { size: '39 MB', name: 'tiny.en', label: 'Tiny (English)', englishOnly: true },
  
  // Base models - Very fast, low accuracy
  base: { size: '74 MB', name: 'base', label: 'Base' },
  'base.en': { size: '74 MB', name: 'base.en', label: 'Base (English)', englishOnly: true },
  
  // Small models - Fast, moderate accuracy (RECOMMENDED)
  small: { size: '244 MB', name: 'small', label: 'Small' },
  'small.en': { size: '244 MB', name: 'small.en', label: 'Small (English)', englishOnly: true },
  
  // Medium models - Medium speed, good accuracy
  medium: { size: '769 MB', name: 'medium', label: 'Medium' },
  'medium.en': { size: '769 MB', name: 'medium.en', label: 'Medium (English)', englishOnly: true },
  
  // Large models - Slow, best accuracy
  'large-v1': { size: '1550 MB', name: 'large-v1', label: 'Large v1' },
  large: { size: '1550 MB', name: 'large', label: 'Large v3' },
  'large-v3-turbo': { size: '1550 MB', name: 'large-v3-turbo', label: 'Large v3 Turbo' },
} as const

export const DEFAULT_CONFIG: WhisperConfig = {
  model: 'small',
  task: 'transcribe',
  temperature: 0,
  bestOf: 5,
  beamSize: 5,
  patience: -1,
  lengthPenalty: 1,
  suppressTokens: '-1',
  conditionOnPreviousText: true,
  fp16: true,
  compressionRatioThreshold: 2.4,
  logprobThreshold: -1.0,
  noSpeechThreshold: 0.6,
  sampleRate: 16000
}

// Get list of all model names
export function getAllModelNames(): string[] {
  return Object.keys(WHISPER_MODELS)
}

// Get model info by name
export function getModelInfo(modelName: string) {
  return WHISPER_MODELS[modelName]
}

// Get model download URL (for whisper.cpp models)
export function getModelUrl(model: string): string {
  return `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${model}.bin`
}

// Get local model path
export function getModelPath(model: string): string {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '.'
  return `${homeDir}/.voice-tui/models/ggml-${model}.bin`
}

// Get nodejs-whisper model path (stored in node_modules)
export function getNodejsWhisperModelPath(model: string): string {
  // nodejs-whisper stores models in its own directory
  return `node_modules/nodejs-whisper/whisperModels/ggml-${model}.bin`
}

// Recommended models by use case
export const RECOMMENDED_MODELS = {
  fastest: 'tiny',
  balanced: 'small',
  accurate: 'medium',
  best: 'large'
}
