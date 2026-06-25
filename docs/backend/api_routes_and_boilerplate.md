# Backend — API Routes & Boilerplate

> SYNAPSE OS: AEGIS PRIME — Server-Side Logic & API Templates

---

## Overview

The backend layer of Aegis-Prime currently consists of **boilerplate API route templates** located in `src/boilerplate/`. These files define the server-side API handlers that can be deployed as:

- Next.js API Routes / Server Actions
- Standalone Express.js endpoints
- Edge function handlers

> **Note:** The current deployment is a Vite-based SPA. Backend API calls are made directly from the browser to external LLM providers (Groq, OpenAI, OpenRouter, Google). The boilerplate files serve as **templates** for when a dedicated backend is implemented.

---

## File: `api-chat-route.ts`

**Path:** `src/boilerplate/api-chat-route.ts`  
**Lines:** 143  
**Role:** Chat completion API route handler

### Endpoint

```
POST /api/chat
```

### Request Body

```ts
interface ChatRequest {
  model: string;       // Model ID (e.g., "llama3", "gpt4o")
  query: string;       // User's prompt text
  apiKeys: {
    groq?: string;
    openai?: string;
    openrouter?: string;
    google?: string;
  };
  systemPrompt?: string;
}
```

### Response

```ts
interface ChatResponse {
  response: string;    // Model's generated text
  model: string;       // Model ID used
  tokens: number;      // Estimated token count
  latency: number;     // Response time in ms
}
```

### Provider Routing Logic

```
if model.provider === "groq"
  → POST https://api.groq.com/openai/v1/chat/completions
  → Headers: Authorization: Bearer {groq_key}

if model.provider === "openai"
  → POST https://api.openai.com/v1/chat/completions
  → Headers: Authorization: Bearer {openai_key}

if model.provider === "openrouter"
  → POST https://openrouter.ai/api/v1/chat/completions
  → Headers: Authorization: Bearer {openrouter_key}

if model.provider === "google"
  → POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
  → Query param: key={google_key}
```

### Error Handling

| Error | Response |
|-------|----------|
| Missing API key | 400 — "API key required for {provider}" |
| Invalid model | 400 — "Unknown model: {id}" |
| Provider error | 502 — "Provider error: {message}" |
| Rate limit | 429 — "Rate limited by {provider}" |
| Network failure | 503 — "Provider unreachable" |

### Demo Fallback

If no API key is provided, returns pre-defined demo content based on model ID:

```ts
const DEMO_RESPONSES: Record<string, string> = {
  llama3: "...",
  gpt4o: "...",
  // etc.
};
```

---

## File: `api-forge-route.ts`

**Path:** `src/boilerplate/api-forge-route.ts`  
**Lines:** 247  
**Role:** Agentic code generation route handler for Synapse Forge

### Endpoint

```
POST /api/forge
```

### Request Body

```ts
interface ForgeRequest {
  query: string;          // Project description / build prompt
  model: string;          // Model ID to use for generation
  apiKeys: ApiKeys;       // Provider credentials
  options?: {
    framework?: string;   // "react" | "next" | "fastapi" | "express"
    language?: string;    // "typescript" | "python" | "rust"
    features?: string[];  // ["auth", "database", "realtime", etc.]
  };
}
```

### Response

```ts
interface ForgeResponse {
  scaffold: {
    files: FileEntry[];   // Generated file tree
    commands: string[];   // Terminal commands to execute
    summary: string;      // Human-readable build summary
  };
  model: string;
  tokens: number;
  latency: number;
}

interface FileEntry {
  path: string;           // e.g., "src/components/LoginForm.tsx"
  content: string;        // File source code
  language: string;       // "tsx" | "py" | "json" | etc.
  lines: number;
}
```

### System Prompt

The forge route injects a specialized system prompt:

```
You are Synapse Forge, an advanced agentic code generation engine 
embedded in the Aegis-Prime OS kernel. Your task is to:

1. Analyze the user's project description
2. Determine optimal tech stack and architecture
3. Generate a complete, production-ready scaffold
4. Include all configuration files (package.json, docker-compose, etc.)
5. Apply PQC-hardened security patterns where applicable
6. Provide terminal commands for setup and deployment

Output format: JSON with 'files', 'commands', and 'summary' keys.
```

### File Generation Pipeline

```
User Prompt
  → System Prompt Injection
  → LLM Generation (via provider)
  → Parse JSON response
  → Validate file structure
  → Return scaffold
```

### Demo Scaffold

When no API key is available, returns a pre-built scaffold for a "Secure Login Portal":

- 12 files across frontend/ and backend/ directories
- React + TypeScript frontend
- FastAPI + PostgreSQL backend
- Docker Compose configuration
- Environment variable template

---

## Architecture Notes

### Current State (SPA)

```
Browser (Vite SPA)
  ├─ KernelContext.tsx → callModelAPI()
  │   ├─ Direct HTTPS to Groq API
  │   ├─ Direct HTTPS to OpenAI API
  │   ├─ Direct HTTPS to OpenRouter API
  │   └─ Direct HTTPS to Google API
  └─ API keys stored in localStorage
```

### Target State (Full Stack)

```
Browser (Next.js)
  └─ POST /api/chat or /api/forge
      └─ Next.js Server Action
          ├─ Validate & sanitize request
          ├─ Route to provider
          ├─ PQC encryption layer
          └─ Return response
```

### Security Considerations

| Concern | Current | Target |
|---------|---------|--------|
| API Keys | localStorage (client-side) | Server-side env vars |
| Transport | Direct HTTPS to providers | PQC-tunneled server proxy |
| Rate Limiting | None | Server-side per-user |
| Input Sanitization | Minimal | Full server-side validation |
| CORS | N/A (direct calls) | Strict origin policy |
