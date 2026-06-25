# LLMs — Model Registry & Provider Integration

> SYNAPSE OS: AEGIS PRIME — AI Model Configuration & API Integration

---

## Overview

Aegis-Prime supports **9 AI models** across **4 providers**, with a special **Fusion** mode that combines outputs from multiple models. All models are defined in the `MODELS` array inside `KernelContext.tsx`.

---

## Model Registry

### Local Models (via Groq)

| ID | Display Name | Model Tag | Provider | Latency | Badge | Color |
|----|-------------|-----------|----------|---------|-------|-------|
| `llama3` | Llama 3.3 | `llama-3.3-70b-versatile` | Groq | 28ms | LOCAL-70B | `#00e5ff` |
| `mistral` | Mixtral | `mixtral-8x7b-32768` | Groq | 32ms | LOCAL-MOE | `#00e5ff` |

> **Note:** "Local" refers to Groq's inference infrastructure (not on-device). These models have the lowest latency due to Groq's LPU hardware.

### Cloud Models

| ID | Display Name | Model Tag | Provider | Latency | Badge | Color |
|----|-------------|-----------|----------|---------|-------|-------|
| `gpt4o` | GPT-4o | `gpt-4o` | OpenAI | 120ms | CLOUD-4O | `#8b5cf6` |
| `claude` | Claude 3.5 | `anthropic/claude-3.5-sonnet` | OpenRouter | 95ms | CLOUD-OPUS | `#ff9500` |
| `qwen` | Qwen-2.5 | `qwen/qwen-2.5-72b-instruct` | OpenRouter | 85ms | CLOUD-72B | `#00ff64` |
| `kimi` | Kimi | `moonshotai/kimi-vl-a3b-thinking` | OpenRouter | 140ms | CLOUD-KIMI | `#f59e0b` |
| `grok` | Grok | `x-ai/grok-3-mini-beta` | OpenRouter | 90ms | CLOUD-GROK | `#ef4444` |
| `gemini` | Gemini Flash | `gemini-2.0-flash` | Google | 110ms | CLOUD-GEM | `#a78bfa` |

### Fusion Model (Meta)

| ID | Display Name | Model Tag | Provider | Latency | Badge | Color |
|----|-------------|-----------|----------|---------|-------|-------|
| `mixer` | Synapse Fusion | `Synapse-Fusion-v2` | fusion | 230ms | FUSION-V2 | `#ff2d9b` |

> The mixer is not a real model — it orchestrates queries to 2 selected models and synthesizes their responses.

---

## Providers

### 1. Groq

| Field | Value |
|-------|-------|
| **API Endpoint** | `https://api.groq.com/openai/v1/chat/completions` |
| **Auth** | `Authorization: Bearer {api_key}` |
| **Format** | OpenAI-compatible |
| **Key Prefix** | `gsk_` |
| **Console** | [console.groq.com/keys](https://console.groq.com/keys) |
| **Models** | Llama 3.3 70B, Mixtral 8x7B |
| **Pricing** | Free tier available |

**Request Example:**
```json
{
  "model": "llama-3.3-70b-versatile",
  "messages": [
    { "role": "system", "content": "You are a helpful AI assistant." },
    { "role": "user", "content": "Explain quantum computing" }
  ],
  "temperature": 0.7,
  "max_tokens": 2048
}
```

### 2. OpenAI

| Field | Value |
|-------|-------|
| **API Endpoint** | `https://api.openai.com/v1/chat/completions` |
| **Auth** | `Authorization: Bearer {api_key}` |
| **Format** | OpenAI native |
| **Key Prefix** | `sk-` |
| **Console** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **Models** | GPT-4o |
| **Pricing** | Pay-per-use (requires billing) |

### 3. OpenRouter

| Field | Value |
|-------|-------|
| **API Endpoint** | `https://openrouter.ai/api/v1/chat/completions` |
| **Auth** | `Authorization: Bearer {api_key}` |
| **Format** | OpenAI-compatible |
| **Key Prefix** | `sk-or-` |
| **Console** | [openrouter.ai/keys](https://openrouter.ai/keys) |
| **Models** | Claude 3.5 Sonnet, Qwen 2.5 72B, Kimi, Grok |
| **Pricing** | Pay-per-use |

> OpenRouter acts as a **unified gateway** — one API key for multiple model providers.

### 4. Google (Gemini)

| Field | Value |
|-------|-------|
| **API Endpoint** | `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` |
| **Auth** | Query parameter `?key={api_key}` |
| **Format** | Google Generative AI |
| **Key Prefix** | `AIzaSy` |
| **Console** | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| **Models** | Gemini 2.0 Flash |
| **Pricing** | Free tier available |

**Request Example:**
```json
{
  "contents": [
    {
      "parts": [
        { "text": "Explain quantum computing" }
      ]
    }
  ]
}
```

**Response Parsing:**
```ts
data.candidates[0].content.parts[0].text
```

---

## Fusion Mode (Mixer)

### How It Works

1. **Select 2 models** from the MixerPopup grid
2. **Enter a prompt** in the fusion textarea
3. **Parallel execution** — both models receive the same query simultaneously
4. **Individual responses** — displayed in `ModelResponseCard` components
5. **Synthesis** — a third API call combines both responses using a fusion prompt
6. **Final output** — displayed with typewriter animation

### Fusion Prompt Template

```
You are Synapse Fusion, a multi-model consensus synthesis engine.
You have received responses from two different AI models to the same query.

Model A ({model1_name}): {response1}
Model B ({model2_name}): {response2}

Synthesize these responses into a single, coherent, comprehensive answer
that captures the best insights from both models. Resolve any contradictions
and present a unified perspective.
```

### Constraints

- Exactly **2 models** must be selected (enforced by UI)
- Models can be from different providers
- No API key needed for demo mode
- Deploy to Dashboard button activates mixer mode in main chat

---

## Demo Content System

When no API key is configured for a model, the system returns pre-written demo responses:

### Chat Demo Responses

Each model has a unique demo response style:
- **Llama 3.3** — Technical, detailed explanation
- **GPT-4o** — Structured, well-organized response
- **Claude** — Nuanced, thoughtful analysis
- **Gemini** — Concise, practical response

### Forge Demo Output

Returns a pre-built "Secure Login Portal" scaffold:
- 12 files (React frontend + FastAPI backend)
- Complete terminal command sequence
- Docker Compose configuration

### Mixer Demo Synthesis

Returns simulated per-model responses + a synthesized fusion output.

---

## Model Selection Flow

```
User clicks model card in LeftPanel
  ├─ If mixer → open MixerPopup
  ├─ If already active → no-op
  ├─ If system busy → no-op
  └─ Otherwise:
      ├─ toggleModel(modelId)
      ├─ PQC-Handshake animation (1200ms)
      ├─ handshakingModels tracks animation state
      ├─ After handshake: model becomes primary
      └─ If currentQuery exists → auto-submit after 1300ms
```

---

## Adding a New Model

To add a new model to the system:

1. **Add to `MODELS` array** in `KernelContext.tsx`:
   ```ts
   {
     id: "newmodel",
     name: "New Model",
     sub: "Provider · Description",
     badge: "CLOUD-NEW",
     type: "cloud",
     provider: "openrouter",  // or "groq", "openai", "google"
     modelTag: "provider/model-name",
     latencyMs: 100,
     color: "#hexcolor",
   }
   ```

2. **Add icon mapping** in `LeftPanel.tsx`:
   ```ts
   const MODEL_ICONS: Record<string, React.ElementType> = {
     // ...existing
     newmodel: Cloud,
   };
   ```

3. **Add demo response** in `KernelContext.tsx` demo content section

4. **Update ApiKeyModal** if using a new provider (add to `PROVIDERS` array)
