#!/usr/bin/env bun
/**
 * Standalone script to download Whisper models
 * Run before first use to avoid downloading during transcription
 * 
 * Usage: bun run download:model [model-name]
 * Example: bun run download:model small
 * Example: bun run download:model tiny
 * 
 * If no model specified, defaults to 'small'
 */

import { nodewhisper } from 'nodejs-whisper'
import { WHISPER_MODELS } from '../src/whisper/config.ts'

const modelName = process.argv[2] || 'small'

// Validate model name
if (!WHISPER_MODELS[modelName]) {
  console.error(`❌ Error: Invalid model "${modelName}"`)
  console.error('\nAvailable models:')
  Object.entries(WHISPER_MODELS).forEach(([key, info]) => {
    console.error(`  - ${key.padEnd(12)} (${info.size}) ${info.englishOnly ? '[English only]' : ''}`)
  })
  process.exit(1)
}

const modelInfo = WHISPER_MODELS[modelName]

console.log('🎤 Voice-TUI Model Downloader')
console.log('==============================\n')
console.log(`Model: ${modelInfo.label} (${modelName})`)
console.log(`Size: ${modelInfo.size}`)
console.log(`Location: node_modules/nodejs-whisper/whisperModels/\n`)
console.log('Downloading...\n')

// Create a dummy wav file for the download process
const dummyWav = new Uint8Array(44)
dummyWav.set([82, 73, 70, 70], 0) // "RIFF"
dummyWav.set([0, 0, 0, 0], 4) // file size
dummyWav.set([87, 65, 86, 69], 8) // "WAVE"

// Use nodewhisper to trigger model download
// We pass a dummy file but the model will download regardless
try {
  await nodewhisper('/tmp/voice-tui-dummy.wav', {
    modelName: modelName,
    autoDownloadModelName: modelName,
    whisperOptions: {
      outputInText: false,
    },
  })
  
  console.log('✅ Model downloaded successfully!')
  console.log('\nYou can now run:')
  console.log('  bun run dev')
  console.log('\nThe model will be used automatically for transcription.')
} catch (error) {
  console.error('❌ Download failed:', error)
  console.error('\nTroubleshooting:')
  console.error('  - Check internet connection')
  console.error('  - Ensure you have enough disk space')
  console.error('  - Try a smaller model first (tiny or base)')
  process.exit(1)
}
