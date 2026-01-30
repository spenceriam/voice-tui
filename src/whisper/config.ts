/**
 * Whisper model configuration and settings
 */

export interface WhisperConfig {
  model: 'tiny' | 'base' | 'small' | 'medium' | 'large'
  language?: string // Auto-detect if not specified
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
}

export const WHISPER_MODELS = {
  tiny: { size: '39 MB', name: 'tiny', label: 'Tiny' },
  base: { size: '74 MB', name: 'base', label: 'Base' },
  small: { size: '244 MB', name: 'small', label: 'Small' },
  medium: { size: '769 MB', name: 'medium', label: 'Medium' },
  large: { size: '1550 MB', name: 'large-v3', label: 'Large v3' }
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
  noSpeechThreshold: 0.6
}

export function getModelUrl(model: string): string {
  return `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${model}.bin`
}

export function getModelPath(model: string): string {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '.'
  return `${homeDir}/.voice-tui/models/ggml-${model}.bin`
}
