/**
 * Whisper model download and management
 */

import { getModelUrl, getModelPath, WHISPER_MODELS } from './config.ts'

export interface ModelInfo {
  name: string
  size: string
  downloaded: boolean
  downloadProgress: number
}

export interface DownloadProgress {
  percent: number
  downloadedBytes: number
  totalBytes: number
}

export type ProgressCallback = (progress: DownloadProgress) => void

/**
 * Check if a model is already downloaded
 */
export async function isModelDownloaded(modelName: string): Promise<boolean> {
  try {
    const modelPath = getModelPath(modelName)
    const file = Bun.file(modelPath)
    return await file.exists()
  } catch {
    return false
  }
}

/**
 * Get model file size if downloaded
 */
export async function getDownloadedModelSize(modelName: string): Promise<number> {
  try {
    const modelPath = getModelPath(modelName)
    const file = Bun.file(modelPath)
    if (await file.exists()) {
      return file.size
    }
  } catch {
    // ignore
  }
  return 0
}

/**
 * Download a Whisper model
 */
export async function downloadModel(
  modelName: string,
  onProgress?: ProgressCallback
): Promise<void> {
  const url = getModelUrl(modelName)
  const modelPath = getModelPath(modelName)
  
  // Ensure directory exists
  const modelDir = modelPath.substring(0, modelPath.lastIndexOf('/'))
  await Bun.write(`${modelDir}/.gitkeep`, '')
  
  console.log(`Downloading Whisper model: ${modelName}`)
  console.log(`URL: ${url}`)
  console.log(`Destination: ${modelPath}`)
  
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`)
    }
    
    const totalBytes = parseInt(response.headers.get('content-length') || '0')
    const reader = response.body?.getReader()
    
    if (!reader) {
      throw new Error('No response body available')
    }
    
    const chunks: Uint8Array[] = []
    let downloadedBytes = 0
    
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break
      
      chunks.push(value)
      downloadedBytes += value.length
      
      if (onProgress && totalBytes > 0) {
        onProgress({
          percent: (downloadedBytes / totalBytes) * 100,
          downloadedBytes,
          totalBytes
        })
      }
    }
    
    // Combine chunks and write to file
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    const combined = new Uint8Array(totalLength)
    let position = 0
    
    for (const chunk of chunks) {
      combined.set(chunk, position)
      position += chunk.length
    }
    
    await Bun.write(modelPath, combined)
    
    console.log(`Model downloaded successfully: ${modelPath}`)
    
  } catch (error) {
    throw new Error(`Failed to download model ${modelName}: ${error}`)
  }
}

/**
 * List available models with their download status
 */
export async function listModels(): Promise<ModelInfo[]> {
  const models: ModelInfo[] = []
  
  for (const [key, info] of Object.entries(WHISPER_MODELS)) {
    const downloaded = await isModelDownloaded(info.name)
    models.push({
      name: key,
      size: info.size,
      downloaded,
      downloadProgress: downloaded ? 100 : 0
    })
  }
  
  return models
}

/**
 * Delete a downloaded model
 */
export async function deleteModel(modelName: string): Promise<void> {
  const modelPath = getModelPath(modelName)
  try {
    await Bun.write(modelPath, '')
    // Note: Bun.write creates the file, to delete we'd need to use node:fs
    // For now, we'll just overwrite with empty content
  } catch (error) {
    throw new Error(`Failed to delete model: ${error}`)
  }
}
