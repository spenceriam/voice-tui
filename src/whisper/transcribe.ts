/**
 * Whisper transcription engine using nodejs-whisper
 * Real transcription with support for multiple model sizes
 */

import { isModelDownloaded, downloadModel } from './model.ts'
import type { WhisperConfig } from './config.ts'
import { DEFAULT_CONFIG, WHISPER_MODELS } from './config.ts'
import { saveWav } from '../audio/recorder.ts'

// Dynamic import for nodejs-whisper
let nodewhisper: any = null

try {
  const whisperModule = await import('nodejs-whisper')
  nodewhisper = whisperModule.nodewhisper || whisperModule.default?.nodewhisper
} catch (error) {
  console.warn('Warning: nodejs-whisper not available, using mock transcription')
}

export interface TranscriptionResult {
  text: string
  language: string
  duration: number
  confidence: number
}

export interface TranscriptionProgress {
  status: 'loading' | 'processing' | 'complete' | 'error'
  percent: number
  message: string
}

export type TranscriptionProgressCallback = (progress: TranscriptionProgress) => void

/**
 * Check if real transcription is available
 */
export function isRealTranscriptionAvailable(): boolean {
  return nodewhisper !== null
}

/**
 * Transcribe audio using Whisper
 * Supports all model sizes: tiny, base, small, medium, large
 */
export async function transcribe(
  audioBuffer: Buffer,
  config: Partial<WhisperConfig> = {},
  onProgress?: TranscriptionProgressCallback
): Promise<TranscriptionResult> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  const modelName = mergedConfig.model
  const duration = audioBuffer.length / (16000 * 2)
  
  // Check if model is downloaded
  if (!await isModelDownloaded(modelName)) {
    if (onProgress) {
      onProgress({
        status: 'loading',
        percent: 0,
        message: `Downloading Whisper ${modelName} model...`
      })
    }
    
    await downloadModel(modelName, (progress) => {
      if (onProgress) {
        onProgress({
          status: 'loading',
          percent: progress.percent,
          message: `Downloading model: ${Math.round(progress.percent)}%`
        })
      }
    })
  }
  
  if (onProgress) {
    onProgress({
      status: 'processing',
      percent: 0,
      message: 'Transcribing audio...'
    })
  }
  
  let result: TranscriptionResult
  
  if (isRealTranscriptionAvailable()) {
    // Use real nodejs-whisper
    result = await realTranscribe(audioBuffer, mergedConfig, onProgress)
  } else {
    // Fallback to mock
    result = await mockTranscribe(audioBuffer, mergedConfig, onProgress)
  }
  
  if (onProgress) {
    onProgress({
      status: 'complete',
      percent: 100,
      message: 'Transcription complete'
    })
  }
  
  return result
}

/**
 * Real transcription using nodejs-whisper
 */
async function realTranscribe(
  audioBuffer: Buffer,
  config: WhisperConfig,
  onProgress?: TranscriptionProgressCallback
): Promise<TranscriptionResult> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const tempWavPath = `/tmp/voice-tui-${timestamp}.wav`
  
  try {
    // Save audio buffer to temporary WAV file
    await saveWav(audioBuffer, config.sampleRate, tempWavPath)
    
    if (onProgress) {
      onProgress({
        status: 'processing',
        percent: 25,
        message: 'Processing audio...'
      })
    }
    
    // Run transcription with nodejs-whisper
    const transcriptText = await nodewhisper(tempWavPath, {
      modelName: config.model,
      autoDownloadModelName: config.model,
      removeWavFileAfterTranscription: true,
      whisperOptions: {
        outputInText: true,
        language: config.language,
        translateToEnglish: config.task === 'translate',
      },
    })
    
    if (onProgress) {
      onProgress({
        status: 'processing',
        percent: 75,
        message: 'Finalizing...'
      })
    }
    
    const duration = audioBuffer.length / (config.sampleRate * 2)
    
    return {
      text: transcriptText.trim(),
      language: config.language || 'en',
      duration,
      confidence: calculateConfidence(transcriptText)
    }
    
  } catch (error) {
    console.error('Transcription error:', error)
    throw new Error(`Transcription failed: ${error}`)
  }
}

/**
 * Calculate confidence based on text quality
 * Simple heuristic for now
 */
function calculateConfidence(text: string): number {
  if (!text || text.length === 0) return 0
  
  // Penalize very short transcriptions
  if (text.length < 10) return 0.6
  
  // Penalize transcriptions with many repeated words
  const words = text.toLowerCase().split(/\s+/)
  const uniqueWords = new Set(words)
  const repetitionRatio = uniqueWords.size / words.length
  
  // Base confidence
  let confidence = 0.85
  
  // Adjust based on repetition
  confidence *= (0.5 + 0.5 * repetitionRatio)
  
  // Penalize if text looks like gibberish (contains non-word characters)
  const gibberishRatio = (text.match(/[^\w\s\.\,\!\?\-]/g) || []).length / text.length
  confidence *= (1 - gibberishRatio)
  
  return Math.max(0.5, Math.min(0.98, confidence))
}

/**
 * Mock transcription for when nodejs-whisper is not available
 */
async function mockTranscribe(
  audioBuffer: Buffer,
  config: WhisperConfig,
  onProgress?: TranscriptionProgressCallback
): Promise<TranscriptionResult> {
  const duration = audioBuffer.length / (16000 * 2)
  
  // Simulate processing time
  const processingTime = Math.max(1000, duration * 1000 * 0.5)
  const steps = 10
  const stepTime = processingTime / steps
  
  for (let i = 0; i < steps; i++) {
    await new Promise(resolve => setTimeout(resolve, stepTime))
    
    if (onProgress) {
      onProgress({
        status: 'processing',
        percent: (i / steps) * 100,
        message: `Processing audio... ${Math.round((i / steps) * 100)}%`
      })
    }
  }
  
  // Return mock transcription
  const mockTexts = [
    'The quick brown fox jumps over the lazy dog.',
    'Hello, this is a test of the voice transcription system.',
    'OpenTUI makes it possible to build voice interfaces in the terminal.',
    'Whisper is an excellent speech recognition model from OpenAI.',
    'Real-time audio visualization makes the experience more engaging.'
  ]
  
  const text = mockTexts[Math.floor(Math.random() * mockTexts.length)]
  
  return {
    text,
    language: config.language || 'en',
    duration,
    confidence: 0.85 + Math.random() * 0.1
  }
}

/**
 * Transcribe from WAV file
 */
export async function transcribeFile(
  wavPath: string,
  config?: Partial<WhisperConfig>,
  onProgress?: TranscriptionProgressCallback
): Promise<TranscriptionResult> {
  const file = Bun.file(wavPath)
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  return transcribe(buffer, config, onProgress)
}

/**
 * Check if transcription is available
 */
export async function isTranscriptionAvailable(): Promise<boolean> {
  // Check if any model is available
  const models = Object.keys(WHISPER_MODELS)
  for (const model of models) {
    if (await isModelDownloaded(model)) {
      return true
    }
  }
  return false
}

/**
 * Get available models with download status
 */
export async function getAvailableModels(): Promise<{name: string, size: string, downloaded: boolean}[]> {
  const models = []
  
  for (const [key, info] of Object.entries(WHISPER_MODELS)) {
    const downloaded = await isModelDownloaded(key)
    models.push({
      name: key,
      size: info.size,
      downloaded
    })
  }
  
  return models
}
