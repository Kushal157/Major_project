# Backend — Security & Cryptographic Architecture

> SYNAPSE OS: AEGIS PRIME — PQC, HSM, and Zero-Trust Security Model

---

## Overview

Aegis-Prime implements a **multi-layered security theatre** that simulates enterprise-grade cryptographic infrastructure. While the current implementation is visual/cosmetic, the architecture is designed to be upgraded to real PQC (Post-Quantum Cryptography) protection.

---

## Security Layers

### 1. PQC Handshake Simulation

**Location:** `KernelContext.tsx` → `toggleModel()`

When switching between models, a simulated PQC handshake occurs:

```
Toggle Model → 1200ms delay
  ├─ systemState = "PQC-Handshake"
  ├─ handshakingModels += modelId
  ├─ LeftPanel shows orange shimmer + "PQC Tunneling..."
  ├─ KernelPanel may rebuild sandbox blocks
  └─ After delay: systemState = "Idle", model activated
```

**Visual Indicators:**
- Orange shimmer sweep on model card
- PQC spinner (SVG ring animation)
- System state badge: "PQC-SHAKE"
- Security log entry: "Tunnel established :: CRYSTALS-Kyber-1024"

### 2. ZK-Auth (Zero-Knowledge Authentication)

**Location:** `LeftPanel.tsx`, `RightPanel.tsx`

Simulated zero-knowledge proof system:

- **Lumina-Auth Card** — Green shield with "ZK" badge, pulsing status dot
- **Security Log Events:**
  - `ZK-Auth handshake complete :: proof_valid`
  - `Zero-knowledge proof refresh :: valid`

### 3. Hardware Security Module (HSM)

**Location:** `KernelPanel.tsx`

Real-time tamper detection system using browser APIs:

| Detection Method | Trigger | Alert |
|-----------------|---------|-------|
| Mouse velocity | Avg velocity > 3.5 over 6 samples | "ANOMALOUS SIGNAL DETECTED" |
| DevTools | `outerWidth - innerWidth > 120` | "DEVTOOLS SIDE-CHANNEL DETECTED" |
| Page blur | `window.blur` event | "VISIBILITY CHANGE — user left workstation" |

**Health Parameters (Simulated):**

| Parameter | Normal | Tamper Alert |
|-----------|--------|-------------|
| CPU Temp | 42°C | ALERT |
| DRAM Integrity | 100% | PROBING |
| Secure Enclave | LOCKED | BREACH? |
| Bus Encryption | AES-256 | SUSPECT |
| TPM Status | ACTIVE | ALERT |

### 4. Lattice Density Monitor

**Location:** `RightPanel.tsx`

Three real-time cryptographic metrics (simulated wave data):

| Metric | Range | Description |
|--------|-------|-------------|
| Encryption Strength | 0–100% | Simulated enc level (sine wave + noise) |
| Key Entropy | 0–100% | Simulated entropy (cosine wave + noise) |
| Threat Shield | 0–100% | Simulated protection level |

**Entropy Burst:** On each keystroke (`entropyTick`), metrics spike by 1.8x boost for 600ms.

### 5. Session Security Log

**Location:** `RightPanel.tsx`

Event-driven security log with three event sources:

1. **Session Init** — 5 events on mount (AUTH, ZK, PQC, HSM, KERN)
2. **Per-Query** — 7 events per chat query (QUERY, AUTH, MODEL, KERN, STREAM, HMAC, AUTH)
3. **Idle Heartbeat** — Random event every 5s when not streaming

**Log Entry Format:**
```ts
{ tag: "AUTH" | "ZK" | "PQC" | "HSM" | "KERN" | "CRYPT" | "QUERY" | "MODEL" | "STREAM" | "HMAC",
  text: string,
  color: string,
  ts: number }
```

### 6. Merkle Tree & Block Log

**Location:** `RightPanel.tsx`

Simulated blockchain verification:

- **Merkle Root** — Rotating hex hash (`0x{20chars}...f@lk933taao`)
- **Block Hashes** — 4 blocks with height counter, auto-refresh every 2s (faster when streaming)
- **Integrity** — 99.90–99.99% range

---

## Key Rotation

**Location:** `KernelPanel.tsx`

- Visual rotating refresh icon (3s loop)
- Fake cryptographic key displayed: `[0x{hash}...f@lk933taao]`
- Rotates randomly with 30% probability every 2s (when not in tamper state)

---

## API Key Storage Security

**Current Implementation:**

```
Browser localStorage
  ├─ aegis_api_keys: { groq, openai, openrouter, google }
  └─ Zero encryption (plaintext JSON)
```

**Documented Target:**

```
PQC-Shielded Vault
  ├─ CRYSTALS-Kyber-1024 key encapsulation
  ├─ AES-256-GCM symmetric encryption
  ├─ Hardware-backed secure enclave (TPM 2.0)
  └─ FIPS 140-3 compliance
```

---

## FIPS & Compliance Labels

The UI displays several compliance badges (cosmetic):

| Badge | Location |
|-------|----------|
| FIPS 140-3 | LeftPanel footer |
| PQC ACTIVE | LeftPanel footer |
| ZK-AUTH | TopNav |
| KASLR ON | Security log |
| TPM 2.0 | KernelPanel health |
