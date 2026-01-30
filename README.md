# Voice-TUI

A proof-of-concept terminal user interface (TUI) application that demonstrates voice capture and dictation using [OpenTUI](https://github.com/anomalyco/opentui) and OpenAI Whisper. This project pushes the envelope on what's possible in terminal interfaces by integrating real-time audio capture, waveform visualization, and AI-powered transcription - all within a text-based UI.

![Voice-TUI Demo](demo-screenshot.png)

## Features

- 🎤 **Real-time Audio Capture**: Record from any microphone with device selection
- 📊 **Live Waveform Visualization**: Animated frequency bars at 30fps during recording
- 🚀 **Local AI Transcription**: Uses Whisper Small (~150MB) - no cloud required
- ⏱️ **Smart Recording**: 60-second limit with elapsed time display
- 🖱️ **Mouse & Keyboard**: Click to record or press Space, Tab to navigate
- 💾 **Export Options**: Copy to clipboard or save to file

## Quick Start

```bash
# Clone the repository
git clone https://github.com/spenceriam/voice-tui.git
cd voice-tui

# Install dependencies (requires Bun)
bun install

# Optional: Download Whisper model beforehand (recommended)
# This avoids waiting during first transcription
bun run download:model small

# Run the application
bun run dev
```

### Model Download

You can download the Whisper model before running to avoid waiting during first use:

```bash
# Download specific model (tiny, base, small, medium, large)
bun run download:model tiny    # Fastest, ~39MB
bun run download:model small   # Balanced, ~244MB  
bun run download:model medium  # Better accuracy, ~769MB

# Models are downloaded automatically on first use if not pre-downloaded
```

## Requirements

- [Bun](https://bun.sh) runtime (Node.js alternative)
- Microphone access permissions
- ~200MB free space for Whisper model (downloaded on first run)

## Usage

1. **Start the app** - Auto-detects your default microphone
2. **Click "🔴 Record"** or press **Space** to start recording
3. **Speak** - Watch the waveform bars animate with your voice
4. **Click "⏹️ Stop"** or press **Space** again (auto-stops at 60s)
5. **Wait** - Whisper transcribes your audio locally
6. **View result** - Copy text or save to file

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Toggle recording |
| `Tab` | Navigate between controls |
| `Enter` | Activate selected button |
| `?` | Open settings |
| `Ctrl+Q` | Quit application |

## Technical Details

- **Framework**: OpenTUI with React reconciler
- **Audio**: 16kHz, 16-bit mono WAV (Whisper optimal format)
- **Model**: OpenAI Whisper Small (~150MB)
- **UI**: Custom FrameBufferRenderable for waveform visualization

## Architecture

```
voice-tui/
├── src/
│   ├── components/     # UI components (Waveform, RecordButton, etc.)
│   ├── audio/          # Recording and device management
│   ├── whisper/        # Model download and transcription
│   └── utils/          # Clipboard and file utilities
├── AGENTS.md          # Development guidelines for AI agents
└── PRD.md             # Product requirements document
```

## Why Voice-TUI?

This project proves that modern terminal user interfaces can handle real-time audio capture, visualization, and AI-powered transcription. It opens the door for:

- Voice-enabled developer tools
- Accessibility improvements for terminal workflows
- Conversational interfaces in traditionally keyboard-only environments

## License

MIT

## Acknowledgments

- [OpenTUI](https://github.com/anomalyco/opentui) - The TUI framework
- [OpenAI Whisper](https://github.com/openai/whisper) - The transcription model
- [OpenCode](https://opencode.ai) - UI pattern inspiration
