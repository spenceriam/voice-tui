# Voice-TUI Product Requirements Document (PRD)

## Project Vision

**Voice-TUI** is a proof-of-concept terminal user interface (TUI) application that demonstrates voice capture and dictation capabilities using OpenTUI. The project pushes the envelope on what's possible in terminal interfaces by integrating real-time audio capture, waveform visualization, and AI-powered transcription (OpenAI Whisper) - all within a text-based UI.

**Primary Goal**: Prove that voice capture and dictation can work seamlessly within an OpenTUI environment, creating a foundation for future conversational interfaces and voice-enabled terminal applications.

---

## Core Functionality

### 1. Audio Input Detection & Selection
- **Auto-detect default microphone** on application startup
- **List available input devices** (USB microphones, built-in mics, Bluetooth headsets)
- **Device switching** via dropdown selector in UI
- **Test audio levels** with live waveform preview even when not recording

### 2. Real-Time Waveform Visualization
- **16-32 frequency bands** displayed as animated bars
- **Real-time amplitude visualization** at 30fps during recording
- **Custom FrameBufferRenderable** for direct pixel-level drawing
- **Visual feedback** showing audio is being captured (bars animate with sound)

### 3. Recording Controls
- **Toggle recording** via mouse click on large button or Space key
- **Elapsed time display** (00:00 format) with 60-second maximum
- **Progress bar** showing recording duration vs. max limit
- **Visual state changes**: Button shows "🔴 Record" vs "⏹️ Stop"
- **Auto-stop** at 60 seconds to prevent excessive memory usage

### 4. Whisper Integration
- **Model**: OpenAI Whisper Small (~150MB) for optimal accuracy/speed balance
- **Audio format**: WAV (16kHz, 16-bit) - optimal for Whisper
- **Local processing**: All transcription happens on-device, no cloud required
- **Download-on-first-use**: Model downloads automatically on first run
- **Progress indicators**: Show download status and transcription progress

### 5. Transcription Display
- **Text output area** showing transcribed speech
- **Confidence score** display (percentage)
- **Word-level timestamps** (future enhancement)
- **Copy to clipboard** functionality
- **Save to file** option

### 6. UI States
1. **Initial/Idle**: Ready to record, shows device selector, waveform preview (static)
2. **Recording**: Live waveform animation, timer counting up, stop button active
3. **Transcribing**: Progress indicators while Whisper processes audio
4. **Result**: Display transcribed text with confidence score, action buttons
5. **Settings**: Device configuration, model selection, preferences
6. **Error**: User-friendly error messages with recovery actions

---

## Technical Stack

- **Framework**: OpenTUI (React reconciler)
- **Runtime**: Bun with TypeScript
- **Audio Capture**: `node-record-lpcm16` for cross-platform recording
- **Audio Encoding**: `wav` library for format conversion
- **AI Model**: `whisper-node` or ONNX runtime with quantized Whisper Small
- **Layout**: Yoga/Flexbox via OpenTUI's layout engine
- **Visualization**: Custom FrameBufferRenderable for waveform bars

---

## UI Design Philosophy

### Layout Structure
```
┌─ Voice-TUI ─────────────────────────┐
│ Device Selector                     │
├─ Waveform Visualization ────────────┤
│ ▓▓▓░░▓▓▓▓░░░▓▓░░▓▓▓▓░  [Record]   │
│ Timer: 00:23 / 60s                  │
├─ Transcription ─────────────────────┤
│ "The quick brown fox..."            │
│ Confidence: 94%                     │
├─ Actions ───────────────────────────┤
│ [Copy] [Save] [New]                 │
└─────────────────────────────────────┘
```

### Color Scheme (Dark Theme)
- Background: `#1a1a2e` (Dark blue-gray)
- Borders: `#4a4a4a` (Medium gray)
- Primary accent: `#6a5acd` (Slate blue)
- Recording indicator: `#ff6b6b` (Red)
- Success: `#4ecdc4` (Teal)
- Text primary: `#e0e0e0`
- Text secondary: `#a0a0a0`
- Waveform bars: Gradient from `#4682b4` to `#6a5acd`

### User Interaction Model
- **Mouse**: Click buttons, select devices, scroll transcription
- **Keyboard**: Space to toggle record, Tab to navigate, ? for settings
- **Real-time feedback**: Waveform animates, timer updates, status changes

---

## User Flow

```
App Launch
    ↓
Auto-detect Default Microphone
    ↓
┌─────────────────┐
│  IDLE STATE     │◄─────────────┐
│  Ready to use   │              │
└────────┬────────┘              │
         │                       │
         │ Space/Click           │
         ↓                       │
┌─────────────────┐              │
│ RECORDING STATE │              │
│ Live waveform   │              │
│ 60s max         │──────────────┤
└────────┬────────┘              │
         │ Space/Click/60s       │
         ↓                       │
┌─────────────────┐              │
│TRANSCRIBING     │              │
│Processing audio │              │
└────────┬────────┘              │
         ↓                       │
┌─────────────────┐              │
│  RESULT STATE   │──────────────┘
│ Show text       │ (New recording)
│ Copy/Save       │
└─────────────────┘
```

---

## Success Criteria

1. ✅ **Audio Capture**: Successfully capture microphone input on Linux/macOS/Windows
2. ✅ **Device Detection**: List and switch between available input devices
3. ✅ **Waveform Visualization**: Real-time animated bars during recording (30fps)
4. ✅ **Recording Control**: Toggle on/off with click or Space, 60s max enforced
5. ✅ **Whisper Integration**: Download model, transcribe audio, show results
6. ✅ **UI Polish**: Professional appearance using OpenTUI components, keyboard shortcuts work
7. ✅ **Proof of Concept**: Demonstrates voice dictation is viable in TUI environment

---

## Future Enhancements (Out of Scope for POC)

- **Conversation Mode**: Multi-turn dialogue with context retention
- **Streaming Transcription**: Real-time transcription while recording
- **Custom Vocabulary**: Fine-tuned models for specific domains
- **Voice Commands**: Control the TUI itself via voice (e.g., "stop recording")
- **Multiple Languages**: Support for non-English transcription
- **Export Formats**: JSON, SRT subtitles, markdown

---

## Repository Structure

```
voice-tui/
├── AGENTS.md           # Project brain for AI agents
├── PRD.md             # This document
├── README.md          # User-facing documentation
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── .gitignore         # Git ignore rules
└── src/
    ├── index.tsx      # Entry point
    ├── App.tsx        # Root component
    ├── components/
    │   ├── Waveform.tsx       # Audio visualization
    │   ├── RecordButton.tsx   # Toggle control
    │   ├── DeviceSelector.tsx # Input device picker
    │   ├── Timer.tsx          # Elapsed time display
    │   ├── TranscriptionView.tsx # Text output
    │   └── Settings.tsx       # Configuration panel
    ├── audio/
    │   ├── recorder.ts        # Recording logic
    │   ├── devices.ts         # Device enumeration
    │   └── waveform.ts        # Audio analysis
    ├── whisper/
    │   ├── model.ts           # Model download/management
    │   ├── transcribe.ts      # Transcription engine
    │   └── config.ts          # Whisper settings
    └── utils/
        ├── clipboard.ts       # Copy functionality
        └── file.ts            # Save to file
```

---

## Dependencies

### Production
- `@opentui/core` - Core TUI library
- `@opentui/react` - React reconciler
- `node-record-lpcm16` - Cross-platform audio recording
- `wav` - WAV file encoding
- `whisper-node` or `onnxruntime-node` - Whisper inference
- `react` - UI framework

### Development
- `bun` - Runtime and package manager
- `typescript` - Type checking
- `@types/node` - Node.js types

---

## Development Approach

1. **Phase 1**: Project setup, OpenTUI integration, basic UI layout
2. **Phase 2**: Audio capture module (device detection, recording to WAV)
3. **Phase 3**: Waveform visualization (FrameBuffer custom renderable)
4. **Phase 4**: Whisper integration (model download, transcription)
5. **Phase 5**: UI polish (keyboard shortcuts, error handling, settings)
6. **Phase 6**: Testing and documentation

---

## Proof of Concept Statement

**Voice-TUI proves that modern terminal user interfaces can handle real-time audio capture, visualization, and AI-powered transcription - all within a text-based environment. This opens the door for voice-enabled developer tools, accessibility improvements for terminal workflows, and conversational interfaces in traditionally keyboard-only environments.**

---

*Document Version: 1.0*
*Created: January 30, 2026*
*Status: Implementation Ready*
