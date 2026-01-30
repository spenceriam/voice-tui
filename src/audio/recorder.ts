/**
 * Audio recording module using node-record-lpcm16
 * Records PCM audio and saves to WAV format
 */

import { spawn, ChildProcess } from 'child_process'
import { Readable } from 'stream'
import { writeFileSync } from 'fs'

export interface RecordingOptions {
  sampleRate?: number
  channels?: number
  bitDepth?: number
  duration?: number // in seconds
  device?: string
}

export interface RecordingResult {
  audioBuffer: Buffer
  duration: number
  sampleRate: number
}

interface WavHeader {
  sampleRate: number
  numChannels: number
  bitsPerSample: number
  dataLength: number
}

/**
 * Generate WAV file header
 */
function createWavHeader(header: WavHeader): Buffer {
  const { sampleRate, numChannels, bitsPerSample, dataLength } = header
  const blockAlign = (numChannels * bitsPerSample) / 8
  const byteRate = sampleRate * blockAlign
  
  const buffer = Buffer.alloc(44)
  let offset = 0
  
  // "RIFF" chunk descriptor
  buffer.write('RIFF', offset)
  offset += 4
  buffer.writeUInt32LE(36 + dataLength, offset)
  offset += 4
  buffer.write('WAVE', offset)
  offset += 4
  
  // "fmt " sub-chunk
  buffer.write('fmt ', offset)
  offset += 4
  buffer.writeUInt32LE(16, offset) // Subchunk1Size (16 for PCM)
  offset += 4
  buffer.writeUInt16LE(1, offset) // AudioFormat (1 for PCM)
  offset += 2
  buffer.writeUInt16LE(numChannels, offset)
  offset += 2
  buffer.writeUInt32LE(sampleRate, offset)
  offset += 4
  buffer.writeUInt32LE(byteRate, offset)
  offset += 4
  buffer.writeUInt16LE(blockAlign, offset)
  offset += 2
  buffer.writeUInt16LE(bitsPerSample, offset)
  offset += 2
  
  // "data" sub-chunk
  buffer.write('data', offset)
  offset += 4
  buffer.writeUInt32LE(dataLength, offset)
  
  return buffer
}

/**
 * AudioRecorder class for managing recording sessions
 */
export class AudioRecorder {
  private process: ChildProcess | null = null
  private audioChunks: Buffer[] = []
  private startTime: number = 0
  private isRecording: boolean = false
  private options: Required<RecordingOptions>
  private onAmplitudeCallback: ((amplitude: number) => void) | null = null
  
  constructor(options: RecordingOptions = {}) {
    this.options = {
      sampleRate: options.sampleRate || 16000, // Whisper optimal
      channels: options.channels || 1, // Mono
      bitDepth: options.bitDepth || 16,
      duration: options.duration || 60,
      device: options.device || 'default'
    }
  }
  
  /**
   * Start recording audio
   */
  async start(): Promise<void> {
    if (this.isRecording) {
      throw new Error('Already recording')
    }
    
    this.audioChunks = []
    this.startTime = Date.now()
    this.isRecording = true
    
    try {
      // Use arecord on Linux, sox or other on macOS/Windows
      // For this POC, we'll use a mock implementation
      // In production: use node-record-lpcm16 or similar
      
      // Mock: Generate silence/sine wave for testing
      this.mockRecording()
      
    } catch (error) {
      this.isRecording = false
      throw new Error(`Failed to start recording: ${error}`)
    }
  }
  
  /**
   * Stop recording and return the audio data
   */
  async stop(): Promise<RecordingResult> {
    if (!this.isRecording) {
      throw new Error('Not recording')
    }
    
    this.isRecording = false
    
    if (this.process) {
      this.process.kill()
      this.process = null
    }
    
    const duration = (Date.now() - this.startTime) / 1000
    const audioBuffer = Buffer.concat(this.audioChunks)
    
    return {
      audioBuffer,
      duration,
      sampleRate: this.options.sampleRate
    }
  }
  
  /**
   * Check if currently recording
   */
  get recording(): boolean {
    return this.isRecording
  }
  
  /**
   * Get elapsed recording time in seconds
   */
  get elapsedTime(): number {
    if (!this.isRecording) return 0
    return (Date.now() - this.startTime) / 1000
  }
  
  /**
   * Set callback for amplitude updates (for waveform visualization)
   */
  onAmplitude(callback: (amplitude: number) => void): void {
    this.onAmplitudeCallback = callback
  }
  
  /**
   * Get current amplitude for visualization
   */
  getCurrentAmplitude(): number {
    // Return a mock amplitude value
    // In production: calculate from recent audio buffer
    if (!this.isRecording) return 0
    return Math.random() * 0.8 + 0.1
  }
  
  /**
   * Mock recording for development/testing
   * Generates synthetic audio data
   */
  private mockRecording(): void {
    const interval = setInterval(() => {
      if (!this.isRecording) {
        clearInterval(interval)
        return
      }
      
      // Generate 100ms of mock PCM data
      const samples = this.options.sampleRate / 10 // 100ms worth
      const bytesPerSample = this.options.bitDepth / 8
      const chunk = Buffer.alloc(samples * bytesPerSample)
      
      // Generate a simple sine wave with some noise
      for (let i = 0; i < samples; i++) {
        const t = i / this.options.sampleRate
        const frequency = 440 // A4 note
        const amplitude = 0.3
        const value = Math.sin(2 * Math.PI * frequency * t) * amplitude * 32767
        chunk.writeInt16LE(Math.floor(value), i * bytesPerSample)
      }
      
      this.audioChunks.push(chunk)
      
      // Call amplitude callback
      if (this.onAmplitudeCallback) {
        this.onAmplitudeCallback(this.getCurrentAmplitude())
      }
      
      // Auto-stop at duration limit
      if (this.elapsedTime >= this.options.duration) {
        this.stop()
        clearInterval(interval)
      }
    }, 100)
  }
}

/**
 * Save audio buffer to WAV file
 */
export function saveWav(buffer: Buffer, sampleRate: number, filename: string): void {
  const header = createWavHeader({
    sampleRate,
    numChannels: 1,
    bitsPerSample: 16,
    dataLength: buffer.length
  })
  
  const wavBuffer = Buffer.concat([header, buffer])
  writeFileSync(filename, wavBuffer)
}

/**
 * Load audio from WAV file
 */
export async function loadWav(filename: string): Promise<RecordingResult> {
  const file = Bun.file(filename)
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  // Parse WAV header
  const sampleRate = buffer.readUInt32LE(24)
  const dataOffset = 44 // Standard WAV header size
  const dataLength = buffer.readUInt32LE(40)
  
  const audioBuffer = buffer.slice(dataOffset, dataOffset + dataLength)
  const duration = dataLength / (sampleRate * 2) // 16-bit = 2 bytes per sample
  
  return {
    audioBuffer,
    duration,
    sampleRate
  }
}
