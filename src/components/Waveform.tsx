/**
 * Waveform component for real-time audio visualization
 * Displays animated frequency bars
 */

import { useState, useEffect, useCallback } from 'react'

interface WaveformProps {
  isRecording: boolean
  numBars?: number
  onAmplitudeUpdate?: (amplitude: number) => void
}

export function Waveform({ isRecording, numBars = 20, onAmplitudeUpdate }: WaveformProps) {
  const [amplitudes, setAmplitudes] = useState<number[]>(new Array(numBars).fill(0))
  const [animationFrame, setAnimationFrame] = useState(0)

  // Generate random but smooth amplitude data
  const generateAmplitudes = useCallback(() => {
    const newAmplitudes = amplitudes.map((prevAmp, i) => {
      if (!isRecording) {
        // Decay to 0 when not recording
        return prevAmp * 0.9
      }
      
      // Generate varying amplitude with some smoothing
      const baseFreq = i / numBars
      const noise = Math.random() * 0.5
      const sine = Math.sin(animationFrame * 0.1 + i * 0.5) * 0.3
      const targetAmp = Math.max(0, Math.min(1, baseFreq + noise + sine))
      
      // Smooth transition
      return prevAmp * 0.7 + targetAmp * 0.3
    })
    
    setAmplitudes(newAmplitudes)
    
    // Calculate average amplitude for parent component
    const avgAmplitude = newAmplitudes.reduce((a, b) => a + b, 0) / numBars
    onAmplitudeUpdate?.(avgAmplitude)
  }, [amplitudes, isRecording, numBars, animationFrame, onAmplitudeUpdate])

  // Animation loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    
    if (isRecording) {
      // 30fps animation when recording
      interval = setInterval(() => {
        setAnimationFrame(prev => prev + 1)
        generateAmplitudes()
      }, 33) // ~30fps
    } else {
      // Slower decay when not recording
      interval = setInterval(() => {
        generateAmplitudes()
      }, 100)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording, generateAmplitudes])

  // Get color based on amplitude
  const getBarColor = (amplitude: number, index: number): string => {
    const hue = 240 + (index / numBars) * 60 // Blue to purple range
    const saturation = 70
    const lightness = 30 + amplitude * 40 // Darker when low, brighter when high
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  // Get character for bar height
  const getBarChar = (amplitude: number): string => {
    if (amplitude < 0.125) return '▁'
    if (amplitude < 0.25) return '▂'
    if (amplitude < 0.375) return '▃'
    if (amplitude < 0.5) return '▄'
    if (amplitude < 0.625) return '▅'
    if (amplitude < 0.75) return '▆'
    if (amplitude < 0.875) return '▇'
    return '█'
  }

  return (
    <box 
      style={{ 
        border: true, 
        padding: 1, 
        marginTop: 1,
        height: 5,
        backgroundColor: isRecording ? '#1a1a2e' : '#151525'
      }}
    >
      <box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        {amplitudes.map((amp, i) => (
          <text 
            key={i}
            style={{ 
              fg: getBarColor(amp, i),
              width: 1
            }}
          >
            {isRecording ? getBarChar(amp) : '░'}
          </text>
        ))}
      </box>
      <text style={{ fg: '#666666', marginTop: 1, alignSelf: 'center' }}>
        {isRecording ? '● Live' : '○ Idle'}
      </text>
    </box>
  )
}
