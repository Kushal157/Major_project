# SYNAPSE OS: AEGIS PRIME — Documentation Index

> High-Fidelity Glassmorphic AI Orchestration Kernel

---

## Project Structure

```
docs/
├── README.md                               ← You are here
├── frontend/
│   ├── ui_layout_and_panels.md             ← Panel system, App shell, TopNav, theme
│   ├── forge_and_mixer_modules.md          ← Forge wizard, ForgePanel, MixerPopup, API Key modal
│   └── state_management_kernel_context.md  ← KernelContext, state machine, API pipelines
├── backend/
│   ├── api_routes_and_boilerplate.md       ← Chat & Forge API route templates
│   └── security_and_cryptography.md        ← PQC, HSM, ZK-Auth, tamper detection
└── llms/
    └── model_registry_and_providers.md     ← 9 models, 4 providers, fusion mode, extension guide
```

---

## Quick Links

### Frontend

| Document | Key Topics |
|----------|-----------|
| [UI Layout & Panels](frontend/ui_layout_and_panels.md) | App.tsx, TopNav, LeftPanel, CentralPanel, KernelPanel, RightPanel, ThemeContext, boot sequence |
| [Forge & Mixer Modules](frontend/forge_and_mixer_modules.md) | SynapseForgeWizard, ForgePanel (IDE), MixerPopup (fusion), ApiKeyModal |
| [State Management](frontend/state_management_kernel_context.md) | KernelContext API, system state machine, chat/forge/mixer pipelines, persistence |

### Backend

| Document | Key Topics |
|----------|-----------|
| [API Routes & Boilerplate](backend/api_routes_and_boilerplate.md) | Chat route, Forge route, request/response formats, provider routing |
| [Security & Cryptography](backend/security_and_cryptography.md) | PQC handshake, HSM tamper detection, ZK-Auth, lattice density, key rotation |

### LLMs

| Document | Key Topics |
|----------|-----------|
| [Model Registry & Providers](llms/model_registry_and_providers.md) | 9 models, Groq/OpenAI/OpenRouter/Google APIs, fusion mode, adding new models |

---

## Source Code Map

```
src/
├── app/
│   ├── App.tsx                           ← Root shell, boot sequence, aurora
│   └── components/
│       ├── aegis/
│       │   ├── KernelContext.tsx          ← Central state (800+ lines)
│       │   ├── ThemeContext.tsx           ← Dark/Light toggle
│       │   ├── TopNav.tsx                ← Navigation bar
│       │   ├── LeftPanel.tsx             ← Model selector (620 lines)
│       │   ├── KernelPanel.tsx           ← Microkernel + HSM (478 lines)
│       │   ├── CentralPanel.tsx          ← Chat/Forge workspace (779 lines)
│       │   ├── RightPanel.tsx            ← Telemetry dashboard (674 lines)
│       │   ├── ForgePanel.tsx            ← IDE workspace (657 lines)
│       │   ├── SynapseForgeWizard.tsx    ← Forge entry wizard (526 lines)
│       │   ├── MixerPopup.tsx            ← Fusion popup (632 lines)
│       │   └── ApiKeyModal.tsx           ← API key vault (355 lines)
│       └── ui/                           ← Reusable UI primitives (Radix-based)
├── boilerplate/
│   ├── api-chat-route.ts                 ← Chat API template (143 lines)
│   └── api-forge-route.ts               ← Forge API template (247 lines)
└── styles/                               ← Tailwind config, glassmorphism CSS
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 18.x |
| Build Tool | Vite | Latest |
| Styling | Tailwind CSS | v4 |
| Animations | Motion (framer-motion) | Latest |
| Charts | Recharts | Latest |
| Icons | Lucide React | Latest |
| UI Components | Radix UI | Latest |
