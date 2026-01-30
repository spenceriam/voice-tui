/**
 * Audio recording module using node-record-lpcm16
 * Records PCM audio from microphone and saves to WAV format
 */

import { ChildProcess } from 'child_process'

// Dynamic import for node-record-lpcm16 since it's a CommonJS module
let record: any = null

// Try to load the module
try {
  const recordModule = await import('node-record-lpcm16')
  record = recordModule.default || recordModule
} catch (error) {
  console.warn('Warning: node-record-lpcm16 not available, using mock recording')
}

export interface RecordingOptions {
  sampleRate?: number
  channels?: number
  bitDepth?: number
  duration?: number
  device?: string
  silenceThreshold?: number
}

export interface RecordingResult {
  audioBuffer: Buffer
  duration: number
  sampleRate: number
  filename?: string
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
  
  buffer.write('RIFF', offset)
  offset += 4
  buffer.writeUInt32LE(36 + dataLength, offset)
  offset += 4
  buffer.write('WAVE', offset)
  offset += 4
  
  buffer.write('fmt ', offset)
  offset += 4
  buffer.writeUInt32LE(16, offset)
  offset += 4
  buffer.writeUInt16LE(1, offset)
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
  
  buffer.write('data', offset)
  offset += 4
  buffer.writeUInt32LE(dataLength, offset)
  
  return buffer
}

/**
 * AudioRecorder class for managing recording sessions
 */
export class AudioRecorder {
  private recordingProcess: any = null
  private audioChunks: Buffer[] = []
  private startTime: number = 0
  private isRecording: boolean = false
  private options: Required<RecordingOptions>
  private onAmplitudeCallback: ((amplitude: number) => void) | null = null
  private tempFilename: string = ''
  
  constructor(options: RecordingOptions = {}) {
    this.options = {
      sampleRate: options.sampleRate || 16000,
      channels: options.channels || 1,
      bitDepth: options.bitDepth || 16,
      duration: options.duration || 60,
      device: options.device || null,
      silenceThreshold: options.silenceThreshold || 0.5
    }
  }
  
  /**
   * Check if real recording is available
   */
  isRealRecordingAvailable(): boolean {
    return record !== null
  }
  
  /**
   * Start recording audio from microphone
   */
  async start(): Promise<void> {
    if (this.isRecording) {
      throw new Error('Already recording')
    }
    
    this.audioChunks = []
    this.startTime = Date.now()
    this.isRecording = true
    
    try {
      if (this.isRealRecordingAvailable()) {
        await this.startRealRecording()
      } else {
        this.startMockRecording()
      }
    } catch (error) {
      this.isRecording = false
      throw new Error(`Failed to start recording: ${error}`)
    }
  }
  
  /**
   * Start real microphone recording using node-record-lpcm16
   */
  private async startRealRecording(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    this.tempFilename = `/tmp/voice-tui-recording-${timestamp}.wav`
    
    const recordingOptions = {
      sampleRate: this.options.sampleRate,
      channels: this.options.channels,
      audioType: 'wav',
      ...(this.options.device && { device: this.options.device })
    }
    
    this.recordingProcess = record.record(recordingOptions)
    
    // Collect audio data
    this.recordingProcess.stream()
      .on('data', (chunk: Buffer) => {
        this.audioChunks.push(chunk)
        
        // Calculate amplitude from audio chunk
        const amplitude = this.calculateAmplitude(chunk)
        if (this.onAmplitudeCallback) {
          this.onAmplitudeCallback(amplitude)
        }
        
        // Check duration limit
        if (this.elapsedTime >= this.options.duration) {
          this.stop()
        }
      })
      .on('error', (err: Error) => {
        console.error('Recording error:', err)
        this.isRecording = false
      })
      .on('end', () => {
        // Recording ended
      })
  }
  
  /**
   * Calculate amplitude from audio buffer
   */
  private calculateAmplitude(buffer: Buffer): number {
    if (buffer.length < 2) return 0
    
    let sum = 0
    let samples = 0
    
    // Sample every 100th sample for performance
    for (let i = 0; i < buffer.length; i += 200) {
      if (i + 1 < buffer.length) {
        const sample = buffer.readInt16LE(i)
        sum += Math.abs(sample)
        samples++
      }
    }
    
    if (samples === 0) return 0
    
    // Normalize to 0-1 range
    const average = sum / samples
    return Math.min(1, average / 32768)
  }
  
  /**
   * Stop recording and return the audio data
   */
  async stop(): Promise<RecordingResult> {
    if (!this.isRecording) {
      throw new Error('Not recording')
    }
    
    this.isRecording = false
    
    // Stop the recording process
    if (this.recordingProcess && this.isRealRecordingAvailable()) {
      this.recordingProcess.stop()
    }
    
    const duration = (Date.now() - this.startTime) / 1000
    const audioBuffer = Buffer.concat(this.audioChunks)
    
    return {
      audioBuffer,
      duration,
      sampleRate: this.options.sampleRate,
      filename: this.tempFilename
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
   * Set callback for amplitude updates
   */
  onAmplitude(callback: (amplitude: number) => void): void {
    this.onAmplitudeCallback = callback
  }
  
  /**
   * Get current amplitude
   */
  getCurrentAmplitude(): number {
    if (!this.isRecording || this.audioChunks.length === 0) return 0
    const lastChunk = this.audioChunks[this.audioChunks.length - 1]
    return this.calculateAmplitude(lastChunk)
  }
  
  /**
   * Mock recording for testing when real audio not available
   */
  private startMockRecording(): void {
    console.log('Using mock recording (no microphone available)')
    
    const interval = setInterval(() => {
      if (!this.isRecording) {
        clearInterval(interval)
        return
      }
      
      // Generate synthetic audio data
      const samples = this.options.sampleRate / 10
      const bytesPerSample = this.options.bitDepth / 8
      const chunk = Buffer.alloc(samples * bytesPerSample)
      
      for (let i = 0; i < samples; i++) {
        const t = i / this.options.sampleRate
        const frequency = 440
        const amplitude = 0.3
        const value = Math.sin(2 * Math.PI * frequency * t) * amplitude * 32767
        chunk.writeInt16LE(Math.floor(value), i * bytesPerSample)
      }
      
      this.audioChunks.push(chunk)
      
      if (this.onAmplitudeCallback) {
        this.onAmplitudeCallback(0.3 + Math.random() * 0.2)
      }
      
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
export async function saveWav(buffer: Buffer, sampleRate: number, filename: string): Promise<void> {
  const header = createWavHeader({
    sampleRate,
    numChannels: 1,
    bitsPerSample: 16,
    dataLength: buffer.length
  })
  
  const wavBuffer = Buffer.concat([header, buffer])
  await Bun.write(filename, wavBuffer)
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
  const dataOffset = 44
  const dataLength = buffer.readUInt32LE(40)
  
  const audioBuffer = buffer.slice(dataOffset, dataOffset + dataLength)
  const duration = dataLength / (sampleRate * 2)
  
  return {
    audioBuffer,
    duration,
    sampleRate
  }
}
