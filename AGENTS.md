# AGENTS.md

## Setup commands
- Install dependencies: `bun install`
- Start development: `bun run dev`
- Build for production: `bun run build`
- Run type check: `bun run typecheck`
- Run linter: `bun run lint`

## Project overview

Voice-TUI is a proof-of-concept terminal user interface (TUI) application that demonstrates voice capture and dictation using OpenTUI. The app pushes the envelope on what's possible in terminal interfaces by integrating real-time audio capture, waveform visualization, and AI-powered transcription via OpenAI Whisper - all within a text-based UI.

**Key Features:**
- Real-time microphone capture with device selection
- Live waveform visualization (16-32 animated bars at 30fps)
- Toggle recording with mouse click or Space key
- Local transcription using Whisper Small (~150MB model)
- Elapsed time display with 60-second recording limit
- Copy/save transcription functionality

**Architecture:**
- **Framework**: OpenTUI with React reconciler
- **Runtime**: Bun with TypeScript
- **Audio**: `node-record-lpcm16` for cross-platform recording, WAV encoding
- **AI**: `whisper-node` or ONNX runtime with quantized Whisper Small
- **UI**: Custom FrameBufferRenderable for waveform visualization

## Development workflow discipline

- **CRITICAL**: NEVER commit or push changes without explicit user approval
- **ALWAYS** ask for user confirmation before any git operations
- **DEBUGGING**: Use console logs and testing to verify fixes before committing
- **WORKFLOW**: Make changes → Test → Get user approval → Then (and only then) commit → Push
- **Branch management**: Only commit to the correct feature branch
- **Code quality**: Ensure all changes work and are properly tested before seeking approval

## Version Bumping Protocol

**CRITICAL**: AI agents MUST follow this semantic versioning workflow when creating PRs.

### Semantic Versioning Format

Version numbers follow the format: **MAJOR.MINOR.PATCH** (e.g., 1.2.3)

- **MAJOR** (X.0.0): Breaking changes, API changes, architectural overhauls
  - Example: 1.5.2 → 2.0.0
- **MINOR** (0.X.0): New features, new components, significant enhancements (backwards compatible)
  - Example: 1.5.2 → 1.6.0
- **PATCH** (0.0.X): Bug fixes, typos, minor tweaks, performance improvements (backwards compatible)
  - Example: 1.5.2 → 1.5.3

### AI Agent Workflow for Version Bumping

**Step 1: Analyze Changes**
Before creating a PR, review all changes in your branch and categorize them.

**Step 2: Ask User for Confirmation**
Present your analysis to the user and ask for confirmation:
```
Based on the changes in this branch, I've identified:
- [List key changes]

I recommend a [PATCH/MINOR/MAJOR] version bump because [reasoning].

Current version: X.Y.Z
Proposed version: X.Y.Z

Does this classification seem correct? Should I proceed with this version bump?
```

**Step 3: Apply Version Bump**
After user confirmation, bump the version IN the feature branch BEFORE creating PR:
```bash
npm version patch  # or minor, or major
```

**Step 4: Document in PR**
- Update PR title to include new version (e.g., "Add waveform visualization (v1.1.0)")
- Mention version bump and reasoning in PR description
- List what changed to justify the bump type

### Decision Tree for AI Agents

**MAJOR bump (X.0.0)** - Use when:
- Removing or renaming public components or APIs
- Changing component props in breaking ways
- Restructuring application architecture
- Changing build output or deployment requirements
- Any change that requires users/developers to modify their code

**MINOR bump (0.X.0)** - Use when:
- Adding new feature or component
- Adding new props or options (backwards compatible)
- Significant enhancement to existing feature
- Adding new audio processing capabilities
- Adding new UI components or views
- New user-facing functionality

**PATCH bump (0.0.X)** - Use when:
- Fixing bugs or errors in audio capture
- Correcting typos in UI text
- Improving error messages or logging
- UI styling fixes or adjustments
- Performance optimizations (no API changes)
- Accessibility improvements
- Dependency updates (no breaking changes)

**SKIP version bump** - Use when:
- Updating documentation only (README, AGENTS.md)
- Modifying .gitignore or similar tooling files
- Changing CI/CD configurations

## Key directories

- `src/components/` - React components (Waveform, RecordButton, DeviceSelector, Timer, TranscriptionView, Settings)
- `src/audio/` - Audio capture and processing (recorder.ts, devices.ts, waveform.ts)
- `src/whisper/` - Whisper model integration (model.ts, transcribe.ts, config.ts)
- `src/utils/` - Utility functions (clipboard.ts, file.ts)

## Code style

- TypeScript strict mode enabled
- Functional components with hooks
- Single quotes, no semicolons
- Component files use PascalCase naming
- Service/module files use camelCase naming
- Interfaces exported separately from implementations
- Use OpenTUI's JSX components (box, text, input)

## UI/UX patterns

- **Layout**: Flexbox-based layouts using OpenTUI's Yoga integration
- **Colors**: Dark theme with slate blue (#6a5acd) primary accent
- **Real-time updates**: Use `renderer.setFrameCallback()` for 30fps waveform animation
- **Mouse support**: All buttons clickable, hover states where applicable
- **Keyboard shortcuts**: Space (toggle record), Tab (navigate), ? (settings), Ctrl+Q (quit)
- **State management**: React useState/useEffect for component state

## Audio implementation

- **Recording**: Use `node-record-lpcm16` for cross-platform PCM capture
- **Format**: 16kHz, 16-bit mono WAV (Whisper requirement)
- **Devices**: Auto-detect default, allow switching via UI dropdown
- **Visualization**: Analyze PCM data in real-time, calculate amplitude per frequency band
- **Buffering**: Stream to temp file, load into memory for transcription

## Whisper integration

- **Model**: Whisper Small (~150MB) for initial implementation
- **Download**: Automatic on first use with progress indicator
- **Storage**: `~/.voice-tui/models/` directory
- **Inference**: Use `whisper-node` wrapper or ONNX runtime
- **Processing**: Non-streaming (full audio file after recording)

## OpenTUI specific guidelines

- **Renderer**: Use `createCliRenderer()` with debug console disabled in production
- **FrameBuffer**: Extend `FrameBufferRenderable` for custom waveform visualization
- **Layout**: Use `flexDirection: "column"` for main layout, `position: "absolute"` for overlays
- **Mouse events**: Override `onMouseEvent()` in custom renderables for click handling
- **Z-index**: Use zIndex layering for overlapping elements (waveform over background)
- **Performance**: Minimize re-renders in animation loop, use refs for mutable data

## Testing approach

- Test audio capture on target platforms (Linux/macOS priority)
- Test device enumeration and switching
- Verify waveform animation performance (maintain 30fps)
- Test recording limits (60s auto-stop)
- Verify Whisper model download and transcription accuracy
- Test keyboard shortcuts and mouse interactions
- Error handling: No mic, no model, transcription failures

## Dependencies to avoid

- Do NOT use `node:fs/promises` - use `Bun.file()` instead
- Do NOT use `express` - Bun has built-in server capabilities
- Do NOT use `dotenv` - Bun automatically loads .env files
- Do NOT use external UI libraries - stick to OpenTUI components
- Do NOT use heavy audio libraries - keep dependencies minimal

## Git workflow

- **Branch naming**: `feature/description` or `fix/description`
- **Commits**: Clear, descriptive messages (e.g., "Add waveform visualization component")
- **PRs**: Include version bump, reference this AGENTS.md for patterns
- **DO NOT MERGE**: User handles all merges

## Debugging tips

- **TUI apps**: You cannot see console.log output when running. Use `renderer.console.toggle()` for debug output.
- **Audio issues**: Check device permissions, sample rates, and platform-specific quirks
- **Performance**: Profile with `renderer.setDebugOverlay(true)` to see frame times
- **Whisper**: First run downloads model - be patient, it's ~150MB

## Environment

- **Required**: Bun runtime (not Node.js)
- **Optional**: Zig compiler (if building OpenTUI from source)
- **Audio**: System microphone access permissions required
- **Storage**: ~200MB free space for Whisper model

## External repositories

This project uses local copies of:
- `opentui/` - Terminal UI framework (DO NOT MODIFY)
- `opencode/` - Reference UI patterns (DO NOT MODIFY)

Both are gitignored and should not be committed to this repository.
