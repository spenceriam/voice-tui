/**
 * Whisper transcription engine using nodejs-whisper
 * Real transcription with support for multiple model sizes
 */

import { isModelDownloaded, downloadModel } from './model.ts'
import type { WhisperConfig } from './config.ts'
import { DEFAULT_CONFIG, WHISPER_MODELS } from './config.ts'
import { saveWav } from '../audio/recorder.ts'

// Import nodejs-whisper - will throw if not available
import { nodewhisper } from 'nodejs-whisper'

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
  
  const result = await runTranscription(audioBuffer, mergedConfig, onProgress)
  
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
 * Run transcription using nodejs-whisper
 */
async function runTranscription(
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
 * Simple heuristic based on text characteristics
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
