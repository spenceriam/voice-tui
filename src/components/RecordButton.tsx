/**
 * RecordButton component for toggling recording state
 * Displays recording status and instructions
 */

interface RecordButtonProps {
  isRecording: boolean
  onToggle: () => void
  disabled?: boolean
}

export function RecordButton({ isRecording, disabled }: RecordButtonProps) {
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
  const sublabel = '(press Space)'

  return (
    <box 
      style={{
        marginTop: 1,
        marginBottom: 1,
        alignItems: 'center'
      }}
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
        <text style={{ fg: buttonStyle.fg }}>
          {label}
        </text>
        <text style={{ fg: '#cccccc', marginTop: 1 }}>
          {sublabel}
        </text>
      </box>
    </box>
  )
}
