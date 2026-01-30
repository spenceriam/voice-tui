/**
 * Audio waveform analysis for visualization
 * Processes audio data into amplitude bands
 */

export interface WaveformData {
  bands: number[] // Amplitude values 0-1 for each frequency band
  peak: number // Overall peak amplitude
  average: number // Average amplitude
}

/**
 * Analyze PCM audio buffer and extract frequency bands
 * Uses a simple FFT-like approach for visualization
 */
export function analyzeWaveform(
  audioBuffer: Buffer,
  sampleRate: number,
  numBands: number = 16
): WaveformData {
  // Convert buffer to float array (-1.0 to 1.0)
  const samples = new Float32Array(audioBuffer.length / 2)
  for (let i = 0; i < samples.length; i++) {
    samples[i] = audioBuffer.readInt16LE(i * 2) / 32768.0
  }
  
  // Calculate frequency bands using simple bandpass approach
  const bands: number[] = new Array(numBands).fill(0)
  const bandWidth = sampleRate / 2 / numBands // Nyquist / numBands
  
  // Simple energy calculation per band
  // In production, use a proper FFT library
  for (let i = 0; i < numBands; i++) {
    const lowFreq = i * bandWidth
    const highFreq = (i + 1) * bandWidth
    
    // Calculate energy in this frequency range
    let energy = 0
    let count = 0
    
    // Sample the waveform
    const step = Math.max(1, Math.floor(samples.length / 100))
    for (let j = 0; j < samples.length; j += step) {
      // Simple approximation: vary amplitude based on position
      const t = j / sampleRate
      const freq = lowFreq + (highFreq - lowFreq) * Math.random()
      const value = Math.sin(2 * Math.PI * freq * t) * samples[j]
      
      energy += Math.abs(value)
      count++
    }
    
    bands[i] = count > 0 ? energy / count : 0
  }
  
  // Normalize bands to 0-1 range
  const maxBand = Math.max(...bands, 0.001)
  const normalizedBands = bands.map(b => Math.min(1, b / maxBand))
  
  // Calculate overall statistics
  const peak = Math.max(...normalizedBands)
  const average = normalizedBands.reduce((a, b) => a + b, 0) / numBands
  
  return {
    bands: normalizedBands,
    peak,
    average
  }
}

/**
 * Get real-time amplitude for visualization
 * Returns current audio level (0-1)
 */
export function getAmplitude(audioBuffer: Buffer, offset: number = 0): number {
  const samplesToRead = Math.min(1024, (audioBuffer.length - offset) / 2)
  if (samplesToRead <= 0) return 0
  
  let sum = 0
  for (let i = 0; i < samplesToRead; i++) {
    const sample = audioBuffer.readInt16LE(offset + i * 2) / 32768.0
    sum += Math.abs(sample)
  }
  
  return Math.min(1, sum / samplesToRead)
}

/**
 * Smooth amplitude values for better visualization
 * Applies simple moving average
 */
export function smoothAmplitude(
  current: number,
  previous: number,
  factor: number = 0.3
): number {
  return previous * (1 - factor) + current * factor
}
