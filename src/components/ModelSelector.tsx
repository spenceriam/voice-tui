import { useState, useEffect, useCallback } from 'react'

interface ModelInfo {
  name: string
  size: string
  isRecommended: boolean
}

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
  downloadedModels: string[]
}

const availableModels: ModelInfo[] = [
  { name: 'tiny', size: '~39 MB', isRecommended: false },
  { name: 'base', size: '~74 MB', isRecommended: false },
  { name: 'small', size: '~244 MB', isRecommended: true },
  { name: 'medium', size: '~769 MB', isRecommended: false },
  { name: 'large', size: '~1550 MB', isRecommended: false },
]

export function ModelSelector({
  selectedModel,
  onModelChange,
  downloadedModels,
}: ModelSelectorProps) {
  const [focusedIndex, setFocusedIndex] = useState(0)

  const handleKeyPress = useCallback(
    (key: string) => {
      if (key === 'ArrowDown' || key === 'Tab') {
        setFocusedIndex((prev) => (prev + 1) % availableModels.length)
      } else if (key === 'ArrowUp') {
        setFocusedIndex((prev) =>
          prev === 0 ? availableModels.length - 1 : prev - 1
        )
      } else if (key === 'Enter' || key === ' ') {
        onModelChange(availableModels[focusedIndex].name)
      }
    },
    [focusedIndex, onModelChange]
  )

  useEffect(() => {
    const currentIndex = availableModels.findIndex(
      (m) => m.name === selectedModel
    )
    if (currentIndex !== -1) {
      setFocusedIndex(currentIndex)
    }
  }, [selectedModel])

  return (
    <box style={{ border: true, borderColor: '#6a5acd', padding: 1, margin: 1 }}>
      <text style={{ fg: '#6a5acd' }}>Select Whisper Model</text>
      <box style={{ flexDirection: 'column', marginTop: 1 }}>
        {availableModels.map((model, index) => {
          const isDownloaded = downloadedModels.includes(model.name)
          const isSelected = model.name === selectedModel
          const isFocused = index === focusedIndex

          const bgColor = isSelected ? '#6a5acd' : isFocused ? '#3a3a5a' : undefined
          const textColor = isSelected ? '#ffffff' : isFocused ? '#ffffff' : '#cccccc'
          const modelName = model.name.charAt(0).toUpperCase() + model.name.slice(1)

          return (
            <box
              key={model.name}
              style={{
                flexDirection: 'row',
                padding: 1,
                backgroundColor: bgColor,
              }}
            >
              <text style={{ fg: textColor }}>
                {isSelected ? '● ' : '○ '}
              </text>
              <text style={{ fg: textColor }}>
                {modelName} {model.size}
              </text>
              {model.isRecommended && (
                <text style={{ fg: '#ffd700', marginLeft: 1 }}> [Recommended]</text>
              )}
              <text style={{ fg: isDownloaded ? '#00ff00' : '#6a5acd', marginLeft: 1 }}>
                {isDownloaded ? ' ✓' : ' ⬇'}
              </text>
            </box>
          )
        })}
      </box>
      <box style={{ marginTop: 1 }}>
        <text style={{ fg: '#888888' }}>
          Tab/↑↓ to navigate, Enter/Space to select
        </text>
      </box>
    </box>
  )
}
