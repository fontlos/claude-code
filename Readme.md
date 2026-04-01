# Claude Code

A locally runnable version based on [NanmiCoder/claude-code-haha](https://github.com/NanmiCoder/claude-code-haha), supporting any Anthropic-compatible API.

## Features

- Complete Ink TUI interactive interface
- `--print` headless mode (for scripting/CI scenarios)
- Support for MCP servers, plugins, and Skills
- Support for custom API endpoints and models, with login verification removed
- Fallback Recovery CLI mode

---

## Quick Start

### 1. Install [Bun](https://bun.sh)

```bash
# MacOS / Linux
curl -fsSL https://bun.sh/install | bash
# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

bun --version
```

### 2. Clone the project and install dependencies

```bash
git clone https://github.com/fontlos/claude-code.git
cd claude-code
bun install
```

### 3. Configure environment variables

Copy the example file and edit it:

```bash
cp .env.example .env
```

```env
# API authentication (choose one)
ANTHROPIC_API_KEY=sk-xxx
ANTHROPIC_AUTH_TOKEN=sk-xxx

# API endpoint (optional, defaults to Anthropic)
ANTHROPIC_BASE_URL=https://api.minimaxi.com/anthropic

# Model configuration
ANTHROPIC_MODEL=MiniMax-M2.7-highspeed
ANTHROPIC_DEFAULT_SONNET_MODEL=MiniMax-M2.7-highspeed
ANTHROPIC_DEFAULT_HAIKU_MODEL=MiniMax-M2.7-highspeed
ANTHROPIC_DEFAULT_OPUS_MODEL=MiniMax-M2.7-highspeed

# Timeout (milliseconds)
API_TIMEOUT_MS=3000000

# Disable telemetry and non-essential network requests
DISABLE_TELEMETRY=1
CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
```

Other models can be integrated. Here's a usable example for **DeepSeek**:

```env
ANTHROPIC_API_KEY=sk-xxx
ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
ANTHROPIC_DEFAULT_HAIKU_MODEL=deepseek-chat
ANTHROPIC_DEFAULT_OPUS_MODEL=deepseek-chat
ANTHROPIC_DEFAULT_SONNET_MODEL=deepseek-chat
ANTHROPIC_MODEL=deepseek-chat
API_TIMEOUT_MS=3000000
CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
DISABLE_TELEMETRY=1
```

### 4. Usage

> Windows environment requires Bash to run commands, so you need to install [Git for Windows](https://git-scm.com/download/win) or another Bash
> Some features (voice input, Computer Use, Sandbox isolation, etc.) are not available on Windows, but the core TUI interaction remains functional

```bash
# MacOS / Linux
./bin/claude
# Windows
./bin/claude.bat

# Command examples

# Interactive TUI mode (full interface)
./bin/claude
# Headless mode (single Q&A)
./bin/claude -p "your prompt here"
# Pipe input
echo "explain this code" | ./bin/claude -p
# View all options
./bin/claude --help
```

## Fixes for the Leaked Source Code

The leaked source code cannot run directly. The following issues have been fixed:

| Issue | Root Cause | Fix |
|-------|------------|-----|
| TUI doesn't start | Entry script routes no-argument startup to recovery CLI | Restored to use `cli.tsx` full entry |
| Startup hangs | `verify` skill imports missing `.md` files, Bun text loader hangs indefinitely | Created stub `.md` files |
| `--print` hangs | `filePersistence/types.ts` missing | Created type stub file |
| `--print` hangs | `ultraplan/prompt.txt` missing | Created resource stub file |
| Enter key unresponsive | `modifiers-napi` native package missing, `isModifierPressed()` throws exception causing `handleEnter` to break, `onSubmit` never executes | Added try-catch error handling |
| setup skipped | `preload.ts` automatically sets `LOCAL_RECOVERY=1` skipping all initialization | Removed default setting |

---

## Project Structure

```
bin/claude                  # Entry script
preload.ts                 # Bun preload (sets MACRO global variables)
.env.example               # Environment variable template
src/
├── entrypoints/cli.tsx    # CLI main entry
├── main.tsx               # TUI main logic (Commander.js + React/Ink)
├── localRecoveryCli.ts    # Fallback Recovery CLI
├── setup.ts               # Startup initialization
├── screens/REPL.tsx       # Interactive REPL interface
├── ink/                   # Ink terminal rendering engine
├── components/            # UI components
├── tools/                 # Agent tools (Bash, Edit, Grep, etc.)
├── commands/              # Slash commands (/commit, /review, etc.)
├── skills/                # Skill system
├── services/              # Service layer (API, MCP, OAuth, etc.)
├── hooks/                 # React hooks
└── utils/                 # Utility functions
```

---

## Disclaimer

This repository is based on the Claude Code source code leaked from the Anthropic npm registry on 2026-03-31. All original source code copyright belongs to [Anthropic](https://www.anthropic.com). For learning and research purposes only.