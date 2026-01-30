/**
 * Main App component
 * Integrates all UI components and manages application state
 */

import { useState, useCallback, useEffect } from 'react'
import { createCliRenderer } from '@opentui/core'
import { useKeyboard, createRoot } from '@opentui/react'
import { AudioRecorder } from './audio/recorder.ts'
import { getAudioDevices, type AudioDevice } from './audio/devices.ts'
import { transcribe, type TranscriptionResult } from './whisper/transcribe.ts'
import { copyToClipboard } from './utils/clipboard.ts'
import { saveTranscriptionWithMetadata } from './utils/file.ts'
import { DeviceSelector } from './components/DeviceSelector.tsx'
import { Waveform } from './components/Waveform.tsx'
import { Timer } from './components/Timer.tsx'
import { RecordButton } from './components/RecordButton.tsx'
import { TranscriptionView } from './components/TranscriptionView.tsx'

type AppState = 'idle' | 'recording' | 'transcribing' | 'result' | 'error'

interface ErrorState {
  message: string
  recoverable: boolean
}

export function App() {
  // State
  const [appState, setAppState] = useState<AppState>('idle')
  const [devices, setDevices] = useState<AudioDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('default')
  const [recorder] = useState(() => new AudioRecorder({ duration: 60 }))
  const [elapsedTime, setElapsedTime] = useState(0)
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null)
  const [error, setError] = useState<ErrorState | null>(null)
  const [transcriptionProgress, setTranscriptionProgress] = useState(0)

  // Initialize devices on mount
  useEffect(() => {
    getAudioDevices().then(devs => {
      setDevices(devs)
      const defaultDev = devs.find(d => d.isDefault) || devs[0]
      if (defaultDev) {
        setSelectedDevice(defaultDev.id)
      }
    })
  }, [])

  // Timer effect for recording
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    
    if (appState === 'recording') {
      interval = setInterval(() => {
        const elapsed = recorder.elapsedTime
        setElapsedTime(elapsed)
        
        // Auto-stop at 60 seconds
        if (elapsed >= 60) {
          handleStopRecording()
        }
      }, 100)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [appState, recorder])

  // Keyboard shortcuts
  useKeyboard((key) => {
    if (key.name === 'space' || key.name === 'return') {
      if (appState === 'idle' || appState === 'recording') {
        handleToggleRecording()
      } else if (appState === 'result') {
        handleNewRecording()
      }
    }
    
    if (key.ctrl && key.name === 'c' && appState === 'result' && transcription) {
      handleCopy()
    }
    
    if (key.ctrl && key.name === 's' && appState === 'result' && transcription) {
      handleSave()
    }
    
    if (key.ctrl && key.name === 'q') {
      process.exit(0)
    }
  })

  // Start/stop recording
  const handleToggleRecording = useCallback(async () => {
    if (appState === 'idle') {
      try {
        await recorder.start()
        setAppState('recording')
        setError(null)
      } catch (err) {
        setError({
          message: `Failed to start recording: ${err}`,
          recoverable: true
        })
        setAppState('error')
      }
    } else if (appState === 'recording') {
      await handleStopRecording()
    }
  }, [appState, recorder])

  // Stop recording and transcribe
  const handleStopRecording = useCallback(async () => {
    try {
      const result = await recorder.stop()
      setAppState('transcribing')
      setElapsedTime(0)

      // Transcribe the audio
      const transcriptionResult = await transcribe(
        result.audioBuffer,
        { model: 'small' },
        (progress) => {
          setTranscriptionProgress(progress.percent)
        }
      )

      setTranscription(transcriptionResult)
      setAppState('result')
    } catch (err) {
      setError({
        message: `Transcription failed: ${err}`,
        recoverable: true
      })
      setAppState('error')
    }
  }, [recorder])

  // Copy transcription to clipboard
  const handleCopy = useCallback(async () => {
    if (transcription) {
      const success = await copyToClipboard(transcription.text)
      if (success) {
        // Could show a brief success message here
      }
    }
  }, [transcription])

  // Save transcription to file
  const handleSave = useCallback(async () => {
    if (transcription) {
      try {
        await saveTranscriptionWithMetadata(
          transcription.text,
          {
            duration: transcription.duration,
            language: transcription.language,
            confidence: transcription.confidence,
            timestamp: new Date().toISOString()
          }
        )
      } catch (err) {
        // Handle error
      }
    }
  }, [transcription])

  // Start a new recording
  const handleNewRecording = useCallback(() => {
    setTranscription(null)
    setAppState('idle')
    setError(null)
  }, [])

  // Handle device change
  const handleDeviceChange = useCallback((deviceId: string) => {
    setSelectedDevice(deviceId)
    // Would update recorder device here in full implementation
  }, [])

  // Get status text
  const getStatusText = () => {
    switch (appState) {
      case 'idle':
        return 'Ready to record'
      case 'recording':
        return 'Recording...'
      case 'transcribing':
        return `Transcribing... ${Math.round(transcriptionProgress)}%`
      case 'result':
        return 'Transcription complete'
      case 'error':
        return error?.message || 'Error occurred'
      default:
        return ''
    }
  }

  // Get status color
  const getStatusColor = () => {
    switch (appState) {
      case 'idle':
        return '#4ecdc4'
      case 'recording':
        return '#ff6b6b'
      case 'transcribing':
        return '#6a5acd'
      case 'result':
        return '#4ecdc4'
      case 'error':
        return '#ff6b6b'
      default:
        return '#e0e0e0'
    }
  }

  return (
    <box style={{ padding: 2, flexDirection: 'column', backgroundColor: '#1a1a2e' }}>
      {/* Header */}
      <box style={{ marginBottom: 2, alignItems: 'center' }}>
        <text style={{ fg: '#6a5acd' }}>
          🎤 Voice-TUI
        </text>
        <text style={{ fg: '#a0a0a0', marginTop: 1 }}>
          Voice capture and transcription with OpenTUI
        </text>
      </box>

      {/* Status */}
      <box style={{ marginBottom: 1 }}>
        <text style={{ fg: getStatusColor() }}>
          Status: {getStatusText()}
        </text>
      </box>

      {/* Device Selector */}
      <DeviceSelector
        devices={devices}
        selectedDevice={selectedDevice}
        onDeviceChange={handleDeviceChange}
      />

      {/* Waveform Visualization */}
      <Waveform isRecording={appState === 'recording'} numBars={24} />

      {/* Timer (show during recording) */}
      {appState === 'recording' && (
        <Timer
          elapsed={elapsedTime}
          maxDuration={60}
          isRecording={true}
        />
      )}

      {/* Record Button */}
      <RecordButton
        isRecording={appState === 'recording'}
        onToggle={handleToggleRecording}
        disabled={appState === 'transcribing'}
      />

      {/* Transcription View */}
      <TranscriptionView
        text={transcription?.text || ''}
        confidence={transcription?.confidence}
        isTranscribing={appState === 'transcribing'}
      />

      {/* Action Buttons (show when result available) */}
      {appState === 'result' && transcription && (
        <box style={{ flexDirection: 'row', marginTop: 1, justifyContent: 'center' }}>
          <box
            style={{
              backgroundColor: '#4682b4',
              padding: 1,
              marginRight: 1,
              border: true
            }}
          >
            <text style={{ fg: '#ffffff' }}>📋 Copy (Ctrl+C)</text>
          </box>
          <box
            style={{
              backgroundColor: '#20b2aa',
              padding: 1,
              marginRight: 1,
              border: true
            }}
          >
            <text style={{ fg: '#ffffff' }}>💾 Save (Ctrl+S)</text>
          </box>
          <box
            style={{
              backgroundColor: '#6a5acd',
              padding: 1,
              border: true
            }}
          >
            <text style={{ fg: '#ffffff' }}>🔄 New</text>
          </box>
        </box>
      )}

      {/* Error Display */}
      {appState === 'error' && error && (
        <box style={{ border: true, borderColor: '#ff6b6b', padding: 1, marginTop: 1 }}>
          <text style={{ fg: '#ff6b6b' }}>
            Error: {error.message}
          </text>
          {error.recoverable && (
            <box
              style={{
                backgroundColor: '#6a5acd',
                padding: 1,
                marginTop: 1,
                border: true
              }}
            >
              <text style={{ fg: '#ffffff' }}>Try Again</text>
            </box>
          )}
        </box>
      )}

      {/* Help Footer */}
      <box style={{ marginTop: 2, border: true, padding: 1 }}>
        <text style={{ fg: '#666666' }}>
          Space/Enter: Record | Ctrl+C: Copy | Ctrl+S: Save | Ctrl+Q: Quit
        </text>
      </box>
    </box>
  )
}

// Create renderer and mount app
const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
