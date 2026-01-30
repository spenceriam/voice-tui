/**
 * Whisper transcription engine
 * Runs inference using whisper.cpp or similar
 */

import { getModelPath } from './config.ts'
import { isModelDownloaded, downloadModel } from './model.ts'
import { WhisperConfig, DEFAULT_CONFIG } from './config.ts'

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
 * This is a mock implementation for the POC
 * In production, this would use whisper.cpp bindings or ONNX runtime
 */
export async function transcribe(
  audioBuffer: Buffer,
  config: Partial<WhisperConfig> = {},
  onProgress?: TranscriptionProgressCallback
): Promise<TranscriptionResult> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  const modelName = mergedConfig.model
  
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
  
  // Start transcription
  if (onProgress) {
    onProgress({
      status: 'processing',
      percent: 0,
      message: 'Transcribing audio...'
    })
  }
  
  // Mock transcription for POC
  // In production, this would:
  // 1. Load the Whisper model
  // 2. Preprocess audio (resample, normalize)
  // 3. Run inference
  // 4. Decode tokens to text
  
  const result = await mockTranscribe(audioBuffer, mergedConfig, onProgress)
  
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
 * Mock transcription for development
 * Simulates processing time and returns sample text
 */
async function mockTranscribe(
  audioBuffer: Buffer,
  config: WhisperConfig,
  onProgress?: TranscriptionProgressCallback
): Promise<TranscriptionResult> {
  const duration = audioBuffer.length / (16000 * 2) // 16kHz, 16-bit
  
  // Simulate processing time (roughly 0.5x to 1x real-time)
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
  // In production, this comes from actual Whisper inference
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
    confidence: 0.85 + Math.random() * 0.1 // 85-95% confidence
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
  const models = ['tiny', 'base', 'small']
  for (const model of models) {
    if (await isModelDownloaded(model)) {
      return true
    }
  }
  return false
}
