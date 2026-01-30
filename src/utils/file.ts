/**
 * File utility for saving transcriptions
 */

import { writeFileSync } from 'fs'
import { format } from 'util'

/**
 * Save text to file
 */
export async function saveToFile(text: string, filename?: string): Promise<string> {
  try {
    // Generate filename if not provided
    if (!filename) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      filename = `transcription-${timestamp}.txt`
    }
    
    // Write file using Bun
    await Bun.write(filename, text)
    
    console.log(`Saved transcription to: ${filename}`)
    return filename
    
  } catch (error) {
    throw new Error(`Failed to save file: ${error}`)
  }
}

/**
 * Save transcription with metadata
 */
export async function saveTranscriptionWithMetadata(
  text: string,
  metadata: {
    duration: number
    language: string
    confidence: number
    timestamp: string
  },
  filename?: string
): Promise<string> {
  const content = `# Voice-TUI Transcription

**Date:** ${metadata.timestamp}
**Duration:** ${metadata.duration.toFixed(2)}s
**Language:** ${metadata.language}
**Confidence:** ${(metadata.confidence * 100).toFixed(1)}%

---

${text}
`
  
  if (!filename) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    filename = `transcription-${timestamp}.md`
  }
  
  await Bun.write(filename, content)
  return filename
}

/**
 * Generate a unique filename
 */
export function generateFilename(extension: string = 'txt'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `transcription-${timestamp}.${extension}`
}
