# Frontend — UI Layout & Panel System

> SYNAPSE OS: AEGIS PRIME — Panel Architecture Documentation

---

## Overview

The Aegis-Prime workstation uses a **four-panel layout** wrapped inside a full-screen, kernel-driven shell. The layout is orchestrated by `App.tsx`, which mounts all panels inside a `KernelProvider` context.

```
┌──────────────────────────────────────────────────────────────────┐
│                          TopNav                                  │
├──────┬────────┬──────────────────────────────┬───────────────────┤
│      │        │                              │                   │
│ Left │ Kernel │       CentralPanel           │   RightPanel      │
│Panel │ Panel  │   (Chat / Forge Mode)        │  (Telemetry &     │
│      │        │                              │   Security Log)   │
│      │        │                              │                   │
├──────┴────────┴──────────────────────────────┴───────────────────┤
│                        StatusFooter                              │
└──────────────────────────────────────────────────────────────────┘
```

---

## File: `App.tsx`

**Path:** `src/app/App.tsx`  
**Lines:** 285  
**Role:** Root application shell & visual chrome

### Components Defined Inside App.tsx

| Component       | Description |
|-----------------|-------------|
| `ScanLine`      | A `motion.div` that slowly sweeps a horizontal scan line across the screen (9s loop). Provides a CRT-like visual effect. |
| `DotGrid`       | Fixed-position dot-grid background using CSS `radial-gradient`. Adapts opacity for light/dark mode. |
| `Aurora`         | Animated aurora blobs (5 in dark mode, 5+ in light mode) using `motion.div` with parallax-style movement. Creates the cyberpunk ambient background. |
| `CornerDecor`    | Four corner brackets (TL/TR/BL/BR) — purely decorative border elements positioned fixed. |
| `StatusFooter`   | Bottom status bar showing fake system metrics (CPU, MEM, NET, ENC) as glassmorphic pills, a scrolling block progress bar, and a build version label. |
| `BootScreen`     | 10-step boot sequence animation. Displays lines one-by-one (210ms interval), with a progress bar and PQC certification badge. Calls `onDone` to transition to the main app. |
| `AppContent`     | Reads theme from `ThemeContext`, renders boot screen or the main workstation layout. |
| `App` (default)  | Root export — wraps everything in `<ThemeProvider>`. |

### Boot Sequence Flow

```
BootScreen (2.7s total)
  → "Initializing Aegis-Prime OS kernel..."
  → "Loading PQC cryptographic modules... [OK]"
  → ... (8 more steps)
  → "All systems nominal. Launching workstation..."
  → 600ms delay → AppContent renders
```

### Theme System

- Uses `ThemeProvider` from `ThemeContext.tsx`
- Two modes: **Dark** (`#06030F` bg) and **Light** (`#090f1a` bg)
- Body background transitions with `0.7s ease`
- Aurora blobs change palette per theme

---

## File: `TopNav.tsx`

**Path:** `src/app/components/aegis/TopNav.tsx`  
**Lines:** 332  
**Role:** Top navigation bar — system status, model chips, clock, settings

### Key Features

| Feature | Description |
|---------|-------------|
| **System State Badge** | Animated pill showing current kernel state: Idle (green), PQC-Handshake (orange), Streaming (cyan), Synthesizing (pink). Uses spring animations with configurable pulse rates. |
| **ZK-AUTH Badge** | Green shield icon + "ZK-AUTH" label — always visible. |
| **Active Model Chips** | Shows currently active models as animated pills. In forge mode, shows a "SYNAPSE FORGE" chip with a rotating hammer icon. |
| **PQC Verification Key** | Displays a fake PQC key string for cyber-aesthetic purposes. |
| **Theme Toggle** | Sun/Moon icon button with spring rotation animation. |
| **API Key Settings** | Settings gear icon → opens `ApiKeyModal`. |
| **Live Clock** | Shows current time (HH:MM:SS 24h) and date, updating every 1s. Wrapped in a glassmorphic card. |

---

## File: `LeftPanel.tsx`

**Path:** `src/app/components/aegis/LeftPanel.tsx`  
**Lines:** 620  
**Role:** Model selector sidebar (left side, 192px wide)

### Key Components

| Component | Description |
|-----------|-------------|
| `PQCSpinner` | SVG-based loading spinner shown during PQC-Handshake state. |
| `useRipple` | Custom hook for click ripple effects on model cards. |
| `ModelCard` | Individual model card with glassmorphic styling, hover/tap spring animations, active/handshake states, and spectral highlights. |
| `LeftPanel` | Main container — renders: Lumina-Auth ZK badge, active model banner, model list (8 core models), mixer card, Synapse Forge button, session query counter, and PQC footer. |

### Model Card States

1. **Idle** — Muted appearance, subtle hover effects
2. **Handshaking** — Orange shimmer sweep, PQC spinner, "PQC Tunneling..." label
3. **Active** — Accent-colored glow, pulsing status dot, bottom accent bar, model tag + latency display

### Forge Button

- Opens the `SynapseForgeWizard` overlay
- Has periodic shimmer animation
- Changes appearance when forge mode is active

---

## File: `CentralPanel.tsx`

**Path:** `src/app/components/aegis/CentralPanel.tsx`  
**Lines:** 779  
**Role:** Main workspace — Chat mode or Forge mode

### Sub-Components

| Component | Description |
|-----------|-------------|
| `TypewriterText` | Character-by-character text reveal with blinking cyan cursor. Speed configurable. |
| `SynthesizingOverlay` | Shown during mixer synthesis — rotating concentric rings, cycling status text, shimmer progress bar. |
| `IdlePrompt` | Shown when no query is active — animated glyph (◈ or ⊕), API dispatch hint when loading, or "sandbox ready" message. |
| `ResponsePane` | Renders a single model's response — header with model info/badge, progress bar, typewriter content area, and token/latency footer. Handles both API live responses and demo fallbacks. |

### View Modes

1. **Chat Mode** — Query input → response streaming via `ResponsePane`
2. **Forge Mode** — Query input → `ForgePanel` with file tree, code editor, terminal

### Query Input Bar

- Glassmorphic input with animated border glow
- Forge-keyword detection: if query contains "build", "create", "scaffold", etc. → auto-routes to Forge
- Quick-tag buttons for common queries
- Mode toggle pill (Chat ↔ Forge)
- Dispatch target indicator

---

## File: `KernelPanel.tsx`

**Path:** `src/app/components/aegis/KernelPanel.tsx`  
**Lines:** 478  
**Role:** Microkernel visualization & Hardware Security Module (middle-left, 220px wide)

### Sections

1. **Microkernel & Sandbox Map**
   - Isometric 3D block visualization (9 blocks: CORE, IPC, SCH, FD4, AC1, B07, E33, K09, P12)
   - Blocks animate in one-by-one on each query
   - Tunnel connection lines between blocks
   - Scanning pulse on CORE block
   - Build progress bar during animation

2. **Hardware Security Module (HSM)**
   - Live tamper detection via mouse velocity monitoring
   - DevTools detection (window size delta)
   - Page blur detection
   - Tamper alert state with red flashing overlay
   - Real-time log feed (safe operations + tamper events)
   - Rotating cryptographic key display
   - Hardware health parameters: CPU Temp, DRAM Integrity, Secure Enclave, Bus Encryption, TPM Status

---

## File: `RightPanel.tsx`

**Path:** `src/app/components/aegis/RightPanel.tsx`  
**Lines:** 674  
**Role:** Telemetry & security dashboard (right side, 265px wide)

### Sections

1. **Lattice Density Chart**
   - Three live metrics: Encryption Strength, Key Entropy, Threat Shield (0–100%)
   - Animated Recharts `AreaChart` with custom tooltip
   - Entropy burst on keystroke (via `entropyTick`)
   - Overall integrity percentage

2. **Security Log**
   - Session-aware log with init events, per-query events, and idle heartbeats
   - Session ID badge, live streaming indicator
   - Telemetry footer: session ID, data rate, key rotation timer

3. **Cognitive Reasoning Path**
   - `SpiderWeb` SVG visualization — two rings of interconnected nodes
   - Animates node-by-node on each query
   - Traveling data particle when active

4. **Version History**
   - Grouped by session (30-min gap threshold)
   - Each entry shows: truncated query, timestamp, model chips, fusion badge
   - Clear history button → removes from localStorage

5. **Merkle Tree & Block Log**
   - Fake merkle root hash (rotating)
   - Block hashes with timestamps and heights
   - Auto-updates faster during streaming

---

## File: `ThemeContext.tsx`

**Path:** `src/app/components/aegis/ThemeContext.tsx`  
**Lines:** 27  
**Role:** Dark/Light mode toggle provider

### API

```tsx
const { isDark, toggleTheme } = useTheme();
```

- Adds/removes `dark-mode` / `light-mode` classes on `<html>`
- Default: dark mode (`isDark = true`)
