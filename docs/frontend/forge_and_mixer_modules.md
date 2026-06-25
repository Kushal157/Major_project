# Frontend — Forge & Mixer Modules

> SYNAPSE OS: AEGIS PRIME — Agentic Build Studio & Multi-Model Fusion

---

## Overview

Synapse OS has two advanced interaction modes beyond standard chat:

1. **Synapse Forge** — Agentic code generation (scaffolding, file tree, terminal, code editor)
2. **Synapse Fusion Mixer** — Multi-model consensus synthesis (query multiple LLMs, fuse results)

---

## File: `SynapseForgeWizard.tsx`

**Path:** `src/app/components/aegis/SynapseForgeWizard.tsx`  
**Lines:** 526  
**Role:** Full-screen forge wizard overlay — project builder entry point

### Wizard Phases

| Phase | Duration | Description |
|-------|----------|-------------|
| `intro` | ~1s | Animated loading screen with spinning gear, "INITIALIZING BUILD STUDIO..." |
| `wizard` | User-driven | Main prompt entry UI — input field, model selector, quick-start template grid |
| `building` | Post-submit | Renders `ForgePanel` with the submitted prompt |

### Quick Start Templates

8 pre-built project templates:

| Template | Tech Stack |
|----------|-----------|
| Secure Login Portal | OAuth2 + JWT + PQC |
| REST API Backend | FastAPI + PostgreSQL |
| AI Chat Interface | Multi-model streaming |
| Blockchain Dashboard | Real-time ledger monitor |
| Microservice Auth | Zero-trust architecture |
| Real-time Dashboard | WebSocket + React |
| PQC Crypto Module | CRYSTALS-Kyber + Dilithium |
| Edge CDN API | Distributed caching |

### Model Picker

- Dropdown selector for all non-mixer models
- Shows model name, tag, and API key status (LIVE / demo)
- Updates `selectedModel` state

### Visual Elements

- `WizardGrid` — CSS grid background with cyan lines
- `FloatingParticle` — 6 floating dots with parallax movement
- Ambient glow radials behind content

---

## File: `ForgePanel.tsx`

**Path:** `src/app/components/aegis/ForgePanel.tsx`  
**Lines:** 657  
**Role:** IDE-like build workspace — file tree, code editor, terminal, live preview

### Layout

```
┌──────────────────────────────────────────────────┐
│              Forge Header Bar                     │
├──────────┬───────────────────────────────────────┤
│ File     │  Code View  or  Live Preview          │
│ Explorer │                                        │
│ (180px)  │                                        │
├──────────┴───────────────────────────────────────┤
│ Terminal Tab   │   Forge Chat Tab                  │
│ (Agent Terminal / Interactive Chat)               │
└──────────────────────────────────────────────────┘
```

### Sub-Components

| Component | Description |
|-----------|-------------|
| `FileIcon` | Returns themed icon based on file type (tsx=React blue, py=Python blue, json=amber, yml=purple, md=slate, env=green) |
| `flattenTree` | Recursively flattens `FileNode[]` with depth tracking for indented rendering |
| `CodeBlock` | Renders syntax-highlighted code lines with line numbers and animated highlight cursor |
| `LivePreview` | File-specific preview — LoginForm (interactive form), auth.py (API docs), package.json (dependency list) |
| `AgentTerminal` | Simulated terminal output — 14 build steps with cumulative delays, blinking cursor, completion checkmark |
| `ForgeChat` | Interactive chat panel — fake "forge assistant" that responds to keywords (button, dark, simple, api) |

### File Tree Structure (Demo)

```
secure-login-portal/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── AuthGuard.tsx
│   │   │   └── SessionBanner.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── models.py
│   └── requirements.txt
├── docker-compose.yml
├── .env.example
└── README.md
```

### Code Samples

Pre-defined syntax-highlighted code for:
- `LoginForm` — React form with PQC-hardened submit handler (25 lines)
- `authpy` — FastAPI OAuth2 + JWT authentication (15 lines)
- `pkgjson` — Package.json with dependencies (9 lines)

### View Modes

- **Code View** — Syntax-highlighted code block with animated highlight line
- **Live Preview** — Interactive rendered preview with browser chrome (traffic light dots, URL bar)

### Bottom Pane Tabs

1. **TERMINAL** — `AgentTerminal` with build step simulation
2. **FORGE CHAT** — `ForgeChat` with model-aware responses

---

## File: `MixerPopup.tsx`

**Path:** `src/app/components/aegis/MixerPopup.tsx`  
**Lines:** 632  
**Role:** Multi-model fusion popup — select 2 models, query both, synthesize

### Phases

| Phase | Description |
|-------|-------------|
| `select` | Model grid (2×4), prompt textarea, model selection (exactly 2 required) |
| `generating` | Per-model response cards with loading states, synthesis progress |
| `done` | Final fused response with deploy option |

### Key Features

- **Model Grid** — 8 models displayed as glassmorphic cards with:
  - Checkbox indicator (animated fill on select)
  - Model name, tag, latency
  - API key status (LIVE / DEMO badge)
  - Shimmer animation when selected
  - Max 2 selections enforced

- **TypewriterText** — Character-by-character response reveal with pink blinking cursor

- **ModelResponseCard** — Individual model response card showing:
  - Model icon (Cloud/Cpu), name, tag
  - Loading state with animated progress bar
  - Response text (truncated to 400 chars)

- **Fusion Synthesis** — Combined response display with:
  - Rotating Zap icon during synthesis
  - Progress shimmer bar
  - "SYNTHESIZING..." / "COMPLETE" status badges

- **Deploy to Dashboard** — Button to deploy mixer config to the main dashboard, auto-closes popup

### Footer Actions

| Phase | Actions |
|-------|---------|
| `select` | Cancel, Deploy to Dashboard (if 2 selected), ⊕ FUSE button |
| `generating/done` | Deploy to Dashboard, Close |

---

## File: `ApiKeyModal.tsx`

**Path:** `src/app/components/aegis/ApiKeyModal.tsx`  
**Lines:** 355  
**Role:** API key vault — manage provider credentials

### Providers

| Provider | Key Prefix | Models | Notes |
|----------|-----------|--------|-------|
| Groq | `gsk_...` | Llama-3.3-70B, Mixtral-8x7B | Free tier, fastest inference |
| OpenAI | `sk-...` | GPT-4o | Requires billing |
| OpenRouter | `sk-or-...` | Claude-3.5-Sonnet, Qwen-2.5-72B | Single key for multiple models |
| Google | `AIzaSy...` | Gemini-1.5-Flash | Free tier on AI Studio |

### Features

- Password-masked input with show/hide toggle
- Per-provider "Get Key" external link
- Security notice about localStorage-only storage
- Save/Cancel with animated feedback
- Clear individual keys with X button
- Visual status: checkmark when key is set
