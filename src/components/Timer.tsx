/**
 * Timer component for displaying recording duration
 */

interface TimerProps {
  elapsed: number // in seconds
  maxDuration: number
  isRecording: boolean
}

export function Timer({ elapsed, maxDuration, isRecording }: TimerProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = Math.min(100, (elapsed / maxDuration) * 100)
  const progressColor = progress > 80 ? '#ff6b6b' : progress > 50 ? '#ffe66d' : '#6a5acd'

  return (
    <box style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}>
      <text style={{ fg: isRecording ? '#ff6b6b' : '#a0a0a0', marginRight: 1 }}>
        {isRecording ? '⏱️ ' : '⏱️ '}
      </text>
      <text style={{ fg: '#e0e0e0', marginRight: 1 }}>
        {formatTime(elapsed)} / {formatTime(maxDuration)}
      </text>
      <box style={{ flexGrow: 1, height: 1, backgroundColor: '#333333' }}>
        <box
          style={{
            width: `${progress}%`,
            height: 1,
            backgroundColor: progressColor
          }}
        />
      </box>
    </box>
  )
}
