# Frontend — State Management (KernelContext)

> SYNAPSE OS: AEGIS PRIME — Core State & API Orchestration

---

## Overview

`KernelContext.tsx` is the **central nervous system** of Synapse OS. It provides:

- Model selection & switching
- API key management
- Chat and Forge submission pipelines
- Mixer (multi-model fusion) orchestration
- System state machine
- Persistent localStorage for chat history and API keys

---

## File: `KernelContext.tsx`

**Path:** `src/app/components/aegis/KernelContext.tsx`  
**Lines:** ~800+  
**Role:** React context provider with all shared application state

---

## Models Registry (`MODELS`)

9 models defined in the `MODELS` array:

| ID | Name | Provider | Model Tag | Type | Latency |
|----|------|----------|-----------|------|---------|
| `llama3` | Llama 3.3 | groq | `llama-3.3-70b-versatile` | local | 28ms |
| `mistral` | Mixtral | groq | `mixtral-8x7b-32768` | local | 32ms |
| `gpt4o` | GPT-4o | openai | `gpt-4o` | cloud | 120ms |
| `claude` | Claude 3.5 | openrouter | `anthropic/claude-3.5-sonnet` | cloud | 95ms |
| `qwen` | Qwen-2.5 | openrouter | `qwen/qwen-2.5-72b-instruct` | cloud | 85ms |
| `kimi` | Kimi | openrouter | `moonshotai/kimi-vl-a3b-thinking` | cloud | 140ms |
| `grok` | Grok | openrouter | `x-ai/grok-3-mini-beta` | cloud | 90ms |
| `gemini` | Gemini Flash | google | `gemini-2.0-flash` | cloud | 110ms |
| `mixer` | Synapse Fusion | fusion | `Synapse-Fusion-v2` | fusion | 230ms |

---

## System State Machine

```
Idle → PQC-Handshake → Streaming → Idle
                     → Synthesizing → Idle  (mixer mode)
```

| State | Description |
|-------|-------------|
| `Idle` | No active request |
| `PQC-Handshake` | 1200ms simulated handshake after model toggle |
| `Streaming` | API response being streamed |
| `Synthesizing` | Mixer fusion in progress |

---

## Core API: `callModelAPI()`

Central function that routes API calls to the correct provider:

```
callModelAPI(modelId, query, systemPrompt?) → Promise<string>
```

### Provider Routing

| Provider | Endpoint | Auth Header |
|----------|----------|-------------|
| **groq** | `https://api.groq.com/openai/v1/chat/completions` | `Bearer {groq_key}` |
| **openai** | `https://api.openai.com/v1/chat/completions` | `Bearer {openai_key}` |
| **openrouter** | `https://openrouter.ai/api/v1/chat/completions` | `Bearer {openrouter_key}` |
| **google** | `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}` | Query param |

### Request Format

- **groq/openai/openrouter:** OpenAI-compatible chat completion format
  ```json
  {
    "model": "<model_tag>",
    "messages": [
      { "role": "system", "content": "<system_prompt>" },
      { "role": "user", "content": "<query>" }
    ],
    "temperature": 0.7,
    "max_tokens": 2048
  }
  ```

- **google:** Google Generative AI format
  ```json
  {
    "contents": [{ "parts": [{ "text": "<query>" }] }]
  }
  ```

### Fallback

If no API key is configured, returns **demo content** — pre-written responses that simulate real output.

---

## Chat Pipeline

```
handleChatSubmit(query)
  ├─ State: PQC-Handshake (if model change)
  ├─ State: Streaming
  ├─ callModelAPI(activeModel, query)
  ├─ Update chatResponse state
  ├─ Log to chatLog (persisted to localStorage)
  └─ State: Idle
```

### Chat Log Entry Format

```ts
interface ChatLogEntry {
  id: string;
  query: string;
  response: string;
  models: string[];
  isMixed: boolean;
  timestamp: string;
}
```

---

## Forge Pipeline

```
handleForgeSubmit(query)
  ├─ State: Streaming
  ├─ callModelAPI(primaryModel, query, forgeSystemPrompt)
  ├─ Update forgeApiResponse state
  └─ State: Idle
```

The forge system prompt instructs the LLM to:
> "You are Synapse Forge, an agentic code generation engine. Given a project description, generate a complete scaffold..."

---

## Mixer Pipeline

```
handleMixerSubmit(query, selectedModels[2])
  ├─ State: Synthesizing
  ├─ Parallel: callModelAPI(model1, query), callModelAPI(model2, query)
  ├─ Update mixerModelResponses[model1], mixerModelResponses[model2]
  ├─ Synthesis: callModelAPI(primaryModel, fusionPrompt)
  │   └─ fusionPrompt = "Synthesize these two responses into one..."
  ├─ Update mixerApiResponse
  └─ State: Idle
```

---

## Exported Context API

```ts
const {
  // Models
  activeModels,           // string[] — currently active model IDs
  primaryModel,           // string — first active model
  toggleModel,            // (id: string) => void
  handshakingModels,      // string[]

  // System State
  systemState,            // "Idle" | "PQC-Handshake" | "Streaming" | "Synthesizing"

  // Chat
  currentQuery,           // string
  chatResponse,           // string | null
  chatLog,                // ChatLogEntry[]
  handleChatSubmit,       // (query: string) => Promise<void>
  chatApiLoading,         // boolean

  // Forge
  forgeQuery,             // string
  forgeApiResponse,       // string | null
  forgeApiLoading,        // boolean
  handleForgeSubmit,      // (query: string) => Promise<void>
  forgeWizardOpen,        // boolean
  setForgeWizardOpen,     // (open: boolean) => void

  // Mixer
  mixerPopupOpen,         // boolean
  setMixerPopupOpen,      // (open: boolean) => void
  mixerSelectedModels,    // string[]
  setMixerSelectedModels, // (models: string[]) => void
  mixerApiResponse,       // string | null
  mixerModelResponses,    // Record<string, string>
  mixerApiLoading,        // boolean
  handleMixerSubmit,      // (query, models) => Promise<void>
  deployToDashboard,      // (models: string[]) => void

  // API Keys
  apiKeys,                // { groq, openai, openrouter, google }
  setApiKeys,             // (keys: ApiKeys) => void
  apiKeyModalOpen,        // boolean
  setApiKeyModalOpen,     // (open: boolean) => void

  // Telemetry
  entropyTick,            // number — incremented on input change
  queryTick,              // number — incremented on each query
  tamperAlert,            // boolean
  setTamperAlert,         // (alert: boolean) => void

  // View
  viewMode,               // "chat" | "forge"
  setViewMode,            // (mode) => void
} = useKernel();
```

---

## Persistence

| Key | Storage | Contents |
|-----|---------|----------|
| `aegis_chat_log` | localStorage | JSON array of `ChatLogEntry` |
| `aegis_api_keys` | localStorage | JSON object `{ groq, openai, openrouter, google }` |

---

## Demo Content System

When no API key is available, `callModelAPI` returns pre-written demo responses:

- **Chat demo:** Multi-paragraph technical response with formatting
- **Forge demo:** Scaffold description with file listing
- **Mixer demo:** Per-model simulated responses + synthesized fusion
