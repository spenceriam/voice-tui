/**
 * Type declarations for node-record-lpcm16
 */

declare module 'node-record-lpcm16' {
  export interface RecordOptions {
    sampleRate?: number
    channels?: number
    audioType?: string
    device?: string | null
    threshold?: number
    thresholdStart?: number
    thresholdEnd?: number
    silence?: number
    verbose?: boolean
  }

  export interface Recording {
    stream(): NodeJS.ReadableStream
    stop(): void
  }

  export function record(options: RecordOptions): Recording
}
