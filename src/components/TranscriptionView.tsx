/**
 * TranscriptionView component for displaying transcribed text
 */

interface TranscriptionViewProps {
  text: string
  confidence?: number
  isTranscribing?: boolean
}

export function TranscriptionView({ text, confidence, isTranscribing }: TranscriptionViewProps) {
  if (isTranscribing) {
    return (
      <box style={{ border: true, padding: 1, marginTop: 1, minHeight: 5 }}>
        <text style={{ fg: '#6a5acd' }}>⚡ Transcribing...</text>
      </box>
    )
  }

  if (!text) {
    return (
      <box style={{ border: true, padding: 1, marginTop: 1, minHeight: 5 }}>
        <text style={{ fg: '#666666' }}>
          [No transcription yet. Click record to start.]
        </text>
      </box>
    )
  }

  return (
    <box style={{ border: true, padding: 1, marginTop: 1, minHeight: 5 }}>
      <text style={{ fg: '#e0e0e0' }}>{text}</text>
      {confidence !== undefined && (
        <text style={{ fg: '#4ecdc4', marginTop: 1 }}>
          Confidence: {(confidence * 100).toFixed(1)}%
        </text>
      )}
    </box>
  )
}
