/**
 * DeviceSelector component for choosing audio input device
 */

import { useState, useCallback } from 'react'
import type { AudioDevice } from '../audio/devices.ts'

interface DeviceSelectorProps {
  devices: AudioDevice[]
  selectedDevice: string
  onDeviceChange: (deviceId: string) => void
}

export function DeviceSelector({ devices, selectedDevice, onDeviceChange }: DeviceSelectorProps) {
  const handleSelect = useCallback((value: string) => {
    onDeviceChange(value)
  }, [onDeviceChange])

  if (devices.length === 0) {
    return (
      <box style={{ border: true, padding: 1, marginBottom: 1 }}>
        <text style={{ fg: '#ff6b6b' }}>No audio devices found</text>
      </box>
    )
  }

  return (
    <box style={{ border: true, padding: 1, marginBottom: 1 }}>
      <box style={{ flexDirection: 'row', alignItems: 'center' }}>
        <text style={{ fg: '#a0a0a0', marginRight: 1 }}>🎤 Input:</text>
        <select
          options={devices.map(d => ({ name: d.name, value: d.id }))}
          value={selectedDevice}
          onChange={handleSelect}
          style={{
            width: 40,
            fg: '#e0e0e0'
          }}
        />
      </box>
    </box>
  )
}
