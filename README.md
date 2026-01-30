# Voice-TUI

A proof-of-concept terminal user interface (TUI) application that demonstrates voice capture and dictation using [OpenTUI](https://github.com/anomalyco/opentui) and OpenAI Whisper. This project pushes the envelope on what's possible in terminal interfaces by integrating real-time audio capture, waveform visualization, and AI-powered transcription - all within a text-based UI.

![Voice-TUI Demo](demo-screenshot.png)

## Features

- 🎤 **Real-time Audio Capture**: Record from any microphone with device selection
- 📊 **Live Waveform Visualization**: Animated frequency bars at 30fps during recording
- 🚀 **Local AI Transcription**: Uses Whisper Small (~244MB) - no cloud required
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

# Run the application
bun run dev
```

## ⚠️ First Time Setup - Important!

**The first time you transcribe, the app will download the Whisper "small" model (~244MB).**

This is **normal** and expected! The UI will show:
```
Status: Downloading Whisper small model... 45%
```

This is **NOT** the app freezing - it's downloading the AI model from HuggingFace. Depending on your internet speed, this may take 1-5 minutes. Subsequent transcriptions will be instant.

### Option A: Pre-download the Model (Recommended)

Avoid the wait by downloading the model before your first recording:

```bash
# Download the default "small" model (~244MB) - best balance of speed/accuracy
bun run download:model small

# Or choose a different model:
bun run download:model tiny    # Fastest, ~39MB (lower accuracy)
bun run download:model base    # ~74MB (moderate speed/accuracy)
bun run download:model medium  # ~769MB (slower, better accuracy)
bun run download:model large   # ~1550MB (slowest, best accuracy)
```

### Option B: Let It Download Automatically

Just use the app normally. When you finish your first recording, the app will:
1. Show "Downloading Whisper small model... 0%"
2. Display download progress
3. Automatically transcribe once downloaded
4. Save the model for future use

**Note:** The model is downloaded from HuggingFace (https://huggingface.co/ggerganov/whisper.cpp). Ensure you have a stable internet connection for the first use.

## Available Models

| Model | Size | Speed | Accuracy | Command |
|-------|------|-------|----------|---------|
| `tiny` | ~39 MB | Fastest | Basic | `bun run download:model tiny` |
| `base` | ~74 MB | Very Fast | Low | `bun run download:model base` |
| `small` | ~244 MB | Fast | Good | `bun run download:model small` |
| `medium` | ~769 MB | Medium | Better | `bun run download:model medium` |
| `large` | ~1550 MB | Slow | Best | `bun run download:model large` |

**Default:** The app uses `small` if no model is pre-downloaded.

## Requirements

- [Bun](https://bun.sh) runtime (Node.js alternative)
- Microphone access permissions
- ~250MB free space for Whisper model (downloaded on first run)
- Internet connection (for first-time model download)

## Usage

1. **Start the app** - Auto-detects your default microphone
2. **Press `Space`** or click "🔴 Record" to start recording
3. **Speak** - Watch the waveform bars animate with your voice
4. **Press `Space`** again or click "⏹️ Stop" to stop (auto-stops at 60s)
5. **Wait for transcription** - First time: model downloads automatically
6. **View result** - Copy text (Ctrl+C) or save to file (Ctrl+S)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Toggle recording |
| `Tab` | Navigate between controls |
| `Enter` | Activate selected button |
| `M` | Change Whisper model (when idle) |
| `Ctrl+C` | Copy transcription to clipboard (when viewing result) |
| `Ctrl+S` | Save transcription to file (when viewing result) |
| `Ctrl+Q` | Quit application |

## Model Storage

Downloaded models are stored at:
- **Location:** `node_modules/nodejs-whisper/whisperModels/`
- **Files:** `ggml-tiny.bin`, `ggml-small.bin`, etc.
- **Persistence:** Models persist across app restarts
- **Re-download:** Delete the `.bin` file to re-download

## Troubleshooting

**"Downloading model..." seems stuck:**
- This is normal for first use - the model is large (~244MB for small)
- Wait 1-5 minutes depending on internet speed
- Check your connection to huggingface.co

**"No audio devices found":**
- Ensure microphone is connected
- Grant microphone permissions in system settings
- On Linux: ensure user is in `audio` group

**Transcription is slow:**
- Try a smaller model: `bun run download:model tiny`
- Large models (medium/large) require more processing time

## Technical Details

- **Framework**: OpenTUI with React reconciler
- **Audio**: 16kHz, 16-bit mono WAV (Whisper optimal format)
- **Model**: OpenAI Whisper (local processing, no cloud)
- **UI**: Custom FrameBufferRenderable for waveform visualization

## Architecture

```
voice-tui/
├── src/
│   ├── components/     # UI components (Waveform, RecordButton, etc.)
│   ├── audio/          # Recording and device management
│   ├── whisper/        # Model download and transcription
│   └── utils/          # Clipboard and file utilities
├── scripts/            # Utility scripts (download-model.ts)
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
