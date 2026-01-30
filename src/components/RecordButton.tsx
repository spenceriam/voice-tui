/**
 * RecordButton component for toggling recording state
 */

import { useCallback } from 'react'

interface RecordButtonProps {
  isRecording: boolean
  onToggle: () => void
  disabled?: boolean
}

export function RecordButton({ isRecording, onToggle, disabled }: RecordButtonProps) {
  const handlePress = useCallback(() => {
    if (!disabled) {
      onToggle()
    }
  }, [onToggle, disabled])

  const buttonStyle = isRecording
    ? {
        backgroundColor: disabled ? '#4a2a2a' : '#ff6b6b',
        fg: '#ffffff',
        border: true
      }
    : {
        backgroundColor: disabled ? '#2a2a4a' : '#6a5acd',
        fg: '#ffffff',
        border: true
      }

  const label = isRecording ? '⏹️  STOP RECORDING' : '🔴 START RECORDING'
  const sublabel = isRecording ? '(or press Space)' : '(or press Space)'

  return (
    <box 
      style={{
        marginTop: 1,
        marginBottom: 1,
        alignItems: 'center'
      }}
      onPress={handlePress}
    >
      <box
        style={{
          ...buttonStyle,
          padding: 1,
          width: 35,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <text style={{ fg: buttonStyle.fg, bold: true }}>
          {label}
        </text>
        <text style={{ fg: '#cccccc', marginTop: 1, italic: true }}>
          {sublabel}
        </text>
      </box>
    </box>
  )
}
