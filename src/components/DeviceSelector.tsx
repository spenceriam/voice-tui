/**
 * DeviceSelector component for choosing audio input device
 * Simplified version without select component for now
 */

import type { AudioDevice } from '../audio/devices.ts'

interface DeviceSelectorProps {
  devices: AudioDevice[]
  selectedDevice: string
  onDeviceChange: (deviceId: string) => void
}

export function DeviceSelector({ devices, selectedDevice, onDeviceChange }: DeviceSelectorProps) {
  if (devices.length === 0) {
    return (
      <box style={{ border: true, padding: 1, marginBottom: 1 }}>
        <text style={{ fg: '#ff6b6b' }}>No audio devices found</text>
      </box>
    )
  }

  // For now, just display the current device
  // In a full implementation, this would use a proper select component
  const currentDevice = devices.find(d => d.id === selectedDevice) || devices[0]

  return (
    <box style={{ border: true, padding: 1, marginBottom: 1 }}>
      <box style={{ flexDirection: 'row', alignItems: 'center' }}>
        <text style={{ fg: '#a0a0a0', marginRight: 1 }}>🎤 Input:</text>
        <text style={{ fg: '#e0e0e0' }}>
          {currentDevice?.name || 'Default Microphone'}
        </text>
        {devices.length > 1 && (
          <text style={{ fg: '#6a5acd', marginLeft: 1 }}>
            (Tab: change)
          </text>
        )}
      </box>
    </box>
  )
}
