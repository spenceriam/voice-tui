/**
 * Clipboard utility for copying text
 * Uses platform-specific commands
 */

import { spawn } from 'child_process'

/**
 * Copy text to system clipboard
 * Uses platform-specific commands: pbcopy (macOS), xclip (Linux), clip (Windows)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    const platform = process.platform
    
    return new Promise((resolve) => {
      let proc: ReturnType<typeof spawn>
      
      if (platform === 'darwin') {
        // macOS
        proc = spawn('pbcopy')
      } else if (platform === 'linux') {
        // Linux - try xclip
        proc = spawn('xclip', ['-selection', 'clipboard'])
      } else if (platform === 'win32') {
        // Windows
        proc = spawn('clip')
      } else {
        console.error(`Unsupported platform: ${platform}`)
        resolve(false)
        return
      }
      
      proc.stdin?.write(text)
      proc.stdin?.end()
      
      proc.on('close', (code) => {
        resolve(code === 0)
      })
      
      proc.on('error', (err) => {
        console.error('Clipboard copy error:', err)
        resolve(false)
      })
    })
    
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Read text from clipboard
 * Uses platform-specific commands: pbpaste (macOS), xclip (Linux)
 */
export async function readFromClipboard(): Promise<string> {
  try {
    const platform = process.platform
    
    return new Promise((resolve) => {
      let proc: ReturnType<typeof spawn>
      
      if (platform === 'darwin') {
        proc = spawn('pbpaste')
      } else if (platform === 'linux') {
        proc = spawn('xclip', ['-selection', 'clipboard', '-o'])
      } else {
        console.error(`Clipboard read not supported on ${platform}`)
        resolve('')
        return
      }
      
      let data = ''
      proc.stdout?.on('data', (chunk) => {
        data += chunk.toString()
      })
      
      proc.on('close', () => {
        resolve(data)
      })
      
      proc.on('error', (err) => {
        console.error('Clipboard read error:', err)
        resolve('')
      })
    })
    
  } catch (error) {
    console.error('Failed to read clipboard:', error)
    return ''
  }
}
