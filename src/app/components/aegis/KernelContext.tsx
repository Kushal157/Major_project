import {
  createContext, useContext, useState, useCallback,
  ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type SystemState = "Idle" | "PQC-Handshake" | "Streaming" | "Synthesizing";
export type ViewMode = "chat" | "forge";

export interface ChatMessage {
  id: string;
  query: string;
  timestamp: Date;
  models: string[];
  isMixed: boolean;
}

export interface ApiKeys {
  groq: string;
  openai: string;
  openrouter: string;
  google: string;
}

// ─── Forge API response shape ─────────────────────────────────────────────────
export interface ForgeApiFileNode {
  id: string;
  name: string;
  type: "folder" | "file";
  fileType?: "tsx" | "py" | "json" | "md" | "yml" | "env";
  children?: ForgeApiFileNode[];
}

export interface ForgeApiData {
  projectName: string;
  fileTree: ForgeApiFileNode[];
  firstFileId: string;
  stats: { files: number; lines: number; lang: string };
  terminalLog?: string[];
}

// ─── Context interface ────────────────────────────────────────────────────────
interface KernelContextType {
  activeModels: string[];
  handshakingModels: string[];
  toggleModel: (id: string) => void;
  primaryModel: string;
  systemState: SystemState;
  setSystemState: React.Dispatch<React.SetStateAction<SystemState>>;
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  forgeQuery: string;
  setForgeQuery: React.Dispatch<React.SetStateAction<string>>;
  chatLog: ChatMessage[];
  entropyTick: number;
  fireEntropy: () => void;
  isMixerMode: boolean;
  streamKey: number;
  currentQuery: string;
  triggerStream: (query: string) => void;
  queryTick: number;

  // Chat API
  apiLoading: boolean;
  chatApiResponse: string | null;
  handleChatSubmit: (prompt: string) => Promise<void>;

  // Forge API
  forgeApiLoading: boolean;
  forgeApiData: ForgeApiData | null;
  handleForgeSubmit: (prompt: string) => Promise<void>;
  forgeCodeResponse: string | null;

  // Mixer API
  mixerApiLoading: boolean;
  mixerApiResponse: string | null;
  mixerModelResponses: Record<string, string>;
  handleMixerSubmit: (prompt: string, selectedModelIds: string[]) => Promise<void>;

  // UI Overlays
  forgeWizardOpen: boolean;
  setForgeWizardOpen: (v: boolean) => void;
  mixerPopupOpen: boolean;
  setMixerPopupOpen: (v: boolean) => void;
  mixerSelectedModels: string[];
  setMixerSelectedModels: (models: string[]) => void;
  apiKeyModalOpen: boolean;
  setApiKeyModalOpen: (v: boolean) => void;
  apiKeys: ApiKeys;
  setApiKeys: (keys: ApiKeys) => void;

  // Dashboard model deployment (from Mixer)
  dashboardModels: string[];
  deployToDashboard: (modelIds: string[]) => void;

  // Tamper alert (HSM)
  tamperAlert: boolean;
  setTamperAlert: (v: boolean) => void;
}

// ─── Per-model metadata ───────────────────────────────────────────────────────
export type ModelType = "local" | "cloud" | "mixer";
export type ModelProvider = "groq" | "openai" | "openrouter" | "google";

export interface ModelMeta {
  id: string;
  name: string;
  sub: string;
  type: ModelType;
  sandbox: string;
  badge: string;
  color: string;
  progressGrad: string;
  progressBg: string;
  tokenCount: number;
  latencyMs: number;
  modelTag: string;
  apiKey: string;
  provider: ModelProvider;
  providerModelId: string;
}

export const MODELS: ModelMeta[] = [
  {
    id: "llama3",
    name: "Llama-3 Local",
    sub: "◈ LOCAL PROCESS",
    type: "local",
    sandbox: "0xAC1",
    badge: "Local Process",
    color: "#00e5ff",
    progressGrad: "linear-gradient(90deg,#00e5ff,#00bcd4)",
    progressBg: "rgba(0,229,255,0.1)",
    tokenCount: 3102,
    latencyMs: 87,
    modelTag: "Llama-3.3-70B",
    apiKey: "llama-local",
    provider: "groq",
    providerModelId: "llama-3.3-70b-versatile",
  },
  {
    id: "mistral",
    name: "Mistral Local",
    sub: "◈ LOCAL PROCESS",
    type: "local",
    sandbox: "0xB07",
    badge: "Local Enclave",
    color: "#00e5ff",
    progressGrad: "linear-gradient(90deg,#00e5ff,#0097a7)",
    progressBg: "rgba(0,229,255,0.08)",
    tokenCount: 2714,
    latencyMs: 63,
    modelTag: "Mixtral-8x7B",
    apiKey: "mistral-local",
    provider: "groq",
    providerModelId: "mixtral-8x7b-32768",
  },
  {
    id: "gpt4o",
    name: "GPT-4o Cloud",
    sub: "◉ CLOUD TUNNEL",
    type: "cloud",
    sandbox: "0xFD4",
    badge: "PQC Tunnel Active",
    color: "#8b5cf6",
    progressGrad: "linear-gradient(90deg,#8b5cf6,#a78bfa)",
    progressBg: "rgba(139,92,246,0.1)",
    tokenCount: 2841,
    latencyMs: 142,
    modelTag: "GPT-4o-turbo-128k",
    apiKey: "gpt-4o",
    provider: "openai",
    providerModelId: "gpt-4o",
  },
  {
    id: "claude",
    name: "Claude Cloud",
    sub: "◉ CLOUD TUNNEL",
    type: "cloud",
    sandbox: "0xE33",
    badge: "PQC Tunnel Active",
    color: "#ff9500",
    progressGrad: "linear-gradient(90deg,#ff9500,#ffb74d)",
    progressBg: "rgba(255,149,0,0.1)",
    tokenCount: 3340,
    latencyMs: 158,
    modelTag: "Claude-3.5-Sonnet",
    apiKey: "claude",
    provider: "openrouter",
    providerModelId: "anthropic/claude-3.5-sonnet",
  },
  {
    id: "qwen",
    name: "Qwen Cloud",
    sub: "◉ CLOUD TUNNEL",
    type: "cloud",
    sandbox: "0xA72",
    badge: "PQC Tunnel Active",
    color: "#00ff64",
    progressGrad: "linear-gradient(90deg,#00ff64,#22c55e)",
    progressBg: "rgba(0,255,100,0.08)",
    tokenCount: 2980,
    latencyMs: 125,
    modelTag: "Qwen-2.5-72B",
    apiKey: "qwen",
    provider: "openrouter",
    providerModelId: "qwen/qwen-2.5-72b-instruct",
  },
  {
    id: "kimi",
    name: "Kimi Cloud",
    sub: "◉ CLOUD TUNNEL",
    type: "cloud",
    sandbox: "0xK15",
    badge: "PQC Tunnel Active",
    color: "#06b6d4",
    progressGrad: "linear-gradient(90deg,#06b6d4,#22d3ee)",
    progressBg: "rgba(6,182,212,0.1)",
    tokenCount: 2760,
    latencyMs: 131,
    modelTag: "Kimi-K1.5",
    apiKey: "kimi",
    provider: "openrouter",
    providerModelId: "moonshotai/moonshot-v1-8k",
  },
  {
    id: "grok",
    name: "Grok-2 Cloud",
    sub: "◉ CLOUD TUNNEL",
    type: "cloud",
    sandbox: "0xGR2",
    badge: "PQC Tunnel Active",
    color: "#f43f5e",
    progressGrad: "linear-gradient(90deg,#f43f5e,#fb7185)",
    progressBg: "rgba(244,63,94,0.1)",
    tokenCount: 3120,
    latencyMs: 144,
    modelTag: "Grok-2-1212",
    apiKey: "grok",
    provider: "openrouter",
    providerModelId: "x-ai/grok-2-1212",
  },
  {
    id: "gemini",
    name: "Gemini Flash",
    sub: "◉ CLOUD TUNNEL",
    type: "cloud",
    sandbox: "0xGF5",
    badge: "PQC Tunnel Active",
    color: "#a78bfa",
    progressGrad: "linear-gradient(90deg,#a78bfa,#c4b5fd)",
    progressBg: "rgba(167,139,250,0.1)",
    tokenCount: 2890,
    latencyMs: 118,
    modelTag: "Gemini-Flash-1.5",
    apiKey: "gemini",
    provider: "google",
    providerModelId: "gemini-1.5-flash-latest",
  },
  {
    id: "mixer",
    name: "Mixer",
    sub: "⊕ BLEND MODE",
    type: "mixer",
    sandbox: "0xMIX",
    badge: "Synapse Fusion",
    color: "#ff2d9b",
    progressGrad: "linear-gradient(90deg,#ff2d9b,#8b5cf6,#00e5ff)",
    progressBg: "rgba(255,45,155,0.1)",
    tokenCount: 6204,
    latencyMs: 230,
    modelTag: "Synapse-Fusion-v2",
    apiKey: "mixer",
    provider: "groq",
    providerModelId: "llama-3.3-70b-versatile",
  },
];

// ─── Model responses (fallback) ───────────────────────────────────────────────
export const MODEL_RESPONSES: Record<string, string> = {
  llama3: `This is an analogy streaming in to explain quantum entanglement with a simple metaphor:\n\nThink of two coins that are "entangled." Flip one — it lands heads. No matter where the other coin is, even light-years away, it will land tails. This isn't communication — it's correlation baked into the fabric of reality.\n\nMore technically: when two particles interact and their quantum states become linked, measuring one particle instantly defines the state of the other. This "spooky action at a distance" (Einstein's term) has been experimentally verified.\n\n...and condition coincides with drive-on-quantum-entanglement methods in quantum networking...\n...This is an analogy driven by quantum entanglement with a biota of simple analogy constructs — useful for quantum cryptography and quantum key distribution (QKD) systems.`,

  mistral: `Quantum entanglement simplified: imagine two gloves separated into different boxes. You ship one box to the other side of the world. The moment you open your box and see a left glove, you instantly know the other is a right glove — no communication needed.\n\nThe quantum twist: unlike gloves, the particles don't "have" a definite state until measured. The act of measurement itself defines both states simultaneously, regardless of distance.\n\nThis non-local correlation is the basis for:\n→ Quantum Key Distribution (QKD) — provably secure cryptographic channels\n→ Quantum teleportation — state transfer without physical particle movement\n→ Quantum computing — Bell state preparation for entangled qubit pairs\n\nExperimentally confirmed by Aspect et al. (1982) and subsequent loophole-free tests (2015+).`,

  gpt4o: `Quantum entanglement is like having a pair of magic dice that always show the same face no matter how far apart they are.\n\nImagine you and a friend each take one die from this entangled pair. You travel to opposite ends of the galaxy. The moment you roll your die and get a '3', your friend's die will instantly show '3' as well — regardless of the distance.\n\nConsider the operational-theoretic framework: quantum entanglement methods explore how two particles, once interacting, maintain a correlated quantum state. The measurement of one particle's quantum property instantaneously determines the corresponding property of its partner particle...`,

  claude: `Let me explain quantum entanglement through the lens of information theory.\n\nPicture a perfectly correlated pair of random number generators. Before measurement, each one has no determined output — it exists in superposition. The moment you sample one, both outcomes crystallize simultaneously, no matter the spatial separation.\n\nThe profound implication: this correlation cannot be explained by any "hidden variable" theory (Bell's Theorem, 1964). The particles genuinely do not have predetermined states — entanglement is a fundamentally non-classical resource.\n\nPractical applications in quantum cryptography:\n• BB84 Protocol — uses entangled photon pairs for unbreakable key exchange\n• Device-independent QKD — security guaranteed by quantum mechanics itself\n• Quantum repeaters — extend entanglement distribution over fiber networks`,

  qwen: `From a systems-theoretic perspective, quantum entanglement represents the most profound departure from classical physics.\n\nTwo particles that have interacted share a joint quantum state — their individual states are undefined until measurement collapses the wavefunction. This creates instantaneous correlations across arbitrary distances.\n\nKey properties:\n◈ Non-local correlations — measurement of one particle instantly determines partner state\n◈ No faster-than-light communication — correlations can't transmit classical information\n◈ Bell inequality violations — experimentally proven, rules out local realism\n◈ Resource for QKD — E91 protocol uses entangled pairs for provably secure key distribution\n\nApplications in quantum computing leverage entanglement for exponential speedup in specific problem classes (Shor's algorithm, Grover's search).`,

  kimi: `Quantum entanglement is a phenomenon where two or more particles become interconnected in such a way that the state of one particle instantaneously influences the state of the other, regardless of the distance separating them.\n\nImagine two entangled particles, A and B. If particle A is measured and found to be in a state of spin up, particle B will instantly be found in a state of spin down, and vice versa. This happens even if the particles are light-years apart.\n\nKey applications:\n• Quantum Key Distribution (QKD) — ensures secure communication channels\n• Quantum Computing — enables parallel processing and exponential speedup\n• Quantum Teleportation — transfers quantum information without physical transmission\n\nExperimentally verified by numerous studies, including the famous Bell test experiments.`,

  grok: `Quantum entanglement is a fundamental quantum phenomenon where two or more particles become linked in such a way that the state of one particle instantaneously influences the state of the other, regardless of the distance between them.\n\nConsider two entangled particles, A and B. If particle A is measured and found to be in a state of spin up, particle B will instantly be found in a state of spin down, and vice versa. This happens even if the particles are light-years apart.\n\nKey applications:\n• Quantum Key Distribution (QKD) — ensures secure communication channels\n• Quantum Computing — enables parallel processing and exponential speedup\n• Quantum Teleportation — transfers quantum information without physical transmission\n\nExperimentally verified by numerous studies, including the famous Bell test experiments.`,

  gemini: `Quantum entanglement is a phenomenon where two or more particles become interconnected in such a way that the state of one particle instantaneously influences the state of the other, regardless of the distance separating them.\n\nImagine two entangled particles, A and B. If particle A is measured and found to be in a state of spin up, particle B will instantly be found in a state of spin down, and vice versa. This happens even if the particles are light-years apart.\n\nKey applications:\n• Quantum Key Distribution (QKD) — ensures secure communication channels\n• Quantum Computing — enables parallel processing and exponential speedup\n• Quantum Teleportation — transfers quantum information without physical transmission\n\nExperimentally verified by numerous studies, including the famous Bell test experiments.`,

  mixer: `[SYNAPSE-OS FUSION NODE :: SYNTHESIS COMPLETE]\n[Models: Multi-Model Consensus | Depth: 4 Layers]\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n▶ CONSENSUS VECTOR ANALYSIS\n\nAll models converge: Quantum entanglement describes instantaneously correlated particle states, defying all local hidden-variable theories.\n\n▶ FUSION SYNTHESIS:\nQuantum entanglement — correlation baked into the fabric of reality — with direct applications in:\n  → Quantum Key Distribution (QKD) — provably secure channels\n  → Bell state preparation — foundational to quantum computing\n  → Quantum networking — entanglement-based repeaters\n\n[CONFIDENCE SCORE: 97.3% | DIVERGENCE INDEX: 0.02 | PQC-VERIFIED ✓]`,
};

// ─── API Call Utilities ───────────────────────────────────────────────────────
type Message = { role: string; content: string };

async function callGroqAPI(modelId: string, messages: Message[], apiKey: string): Promise<string> {
  const model = MODELS.find((m) => m.id === modelId);
  if (!model) throw new Error(`Unknown model: ${modelId}`);

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model.providerModelId,
      messages,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callOpenAIAPI(modelId: string, messages: Message[], apiKey: string): Promise<string> {
  const model = MODELS.find((m) => m.id === modelId);
  if (!model) throw new Error(`Unknown model: ${modelId}`);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model.providerModelId,
      messages,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callOpenRouterAPI(modelId: string, messages: Message[], apiKey: string): Promise<string> {
  const model = MODELS.find((m) => m.id === modelId);
  if (!model) throw new Error(`Unknown model: ${modelId}`);

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://aegis-prime.ai",
      "X-Title": "Aegis-Prime Workstation",
    },
    body: JSON.stringify({
      model: model.providerModelId,
      messages,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGoogleGeminiAPI(modelId: string, messages: Message[], apiKey: string): Promise<string> {
  const model = MODELS.find((m) => m.id === modelId);
  if (!model) throw new Error(`Unknown model: ${modelId}`);

  // Map roles: Gemini uses "user" and "model"
  // Note: Gemini doesn't have a "system" role in the "contents" array in the same way, 
  // though it can be passed as a separate field or as a user message with special instruction.
  // For simplicity and compatibility with the current flow, we'll prefix the first user message 
  // with the system prompt if present.
  
  let systemPrompt = "";
  const filteredMessages = messages.filter(m => {
    if (m.role === "system") {
      systemPrompt = m.content;
      return false;
    }
    return true;
  });

  const contents = filteredMessages.map((m, idx) => {
    let content = m.content;
    if (idx === 0 && systemPrompt) {
      content = `[SYSTEM INSTRUCTION: ${systemPrompt}]\n\nUser query: ${content}`;
    }
    return {
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: content }]
    };
  });

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model.providerModelId}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No response text returned from Gemini");
  return text;
}

async function callModelAPI(modelId: string, messages: Message[], apiKeys: ApiKeys): Promise<string> {
  const model = MODELS.find((m) => m.id === modelId);
  if (!model) throw new Error(`Unknown model: ${modelId}`);

  if (model.provider === "groq") {
    if (!apiKeys.groq) throw new Error("Groq API key not configured");
    return callGroqAPI(modelId, messages, apiKeys.groq);
  }
  if (model.provider === "openai") {
    if (!apiKeys.openai) throw new Error("OpenAI API key not configured");
    return callOpenAIAPI(modelId, messages, apiKeys.openai);
  }
  if (model.provider === "openrouter") {
    if (!apiKeys.openrouter) throw new Error("OpenRouter API key not configured");
    return callOpenRouterAPI(modelId, messages, apiKeys.openrouter);
  }
  if (model.provider === "google") {
    if (!apiKeys.google) throw new Error("Google Gemini API key not configured");
    return callGoogleGeminiAPI(modelId, messages, apiKeys.google);
  }
  throw new Error(`Unknown provider: ${model.provider}`);
}

export function hasApiKey(modelId: string, apiKeys: ApiKeys): boolean {
  const model = MODELS.find((m) => m.id === modelId);
  if (!model) return false;
  if (model.provider === "groq") return !!apiKeys.groq;
  if (model.provider === "openai") return !!apiKeys.openai;
  if (model.provider === "openrouter") return !!apiKeys.openrouter;
  if (model.provider === "google") return !!apiKeys.google;
  return false;
}

function loadApiKeys(): ApiKeys {
  const defaultKeys = { 
    groq: "", 
    openai: "", 
    openrouter: "", 
    google: "" 
  };
  try {
    const stored = localStorage.getItem("aegis_api_keys");
    if (stored) {
      const parsed = JSON.parse(stored);
      const keys = { ...defaultKeys, ...parsed };
      // Force the default Gemini key if the stored one is empty
      if (!keys.google || keys.google.trim() === "") {
        keys.google = defaultKeys.google;
      }
      return keys;
    }
  } catch {}
  return defaultKeys;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const KernelContext = createContext<KernelContextType | null>(null);

export function useKernel(): KernelContextType {
  const ctx = useContext(KernelContext);
  if (!ctx) throw new Error("useKernel must be used inside <KernelProvider>");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function KernelProvider({ children }: { children: ReactNode }) {
  const [activeModels, setActiveModels] = useState<string[]>(["llama3"]);
  const [handshakingModels, setHandshakingModels] = useState<string[]>([]);
  const [systemState, setSystemState] = useState<SystemState>("Idle");
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [forgeQuery, setForgeQuery] = useState("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem("aegis_chat_log");
      if (stored) return JSON.parse(stored).map((e: ChatMessage) => ({ ...e, timestamp: new Date(e.timestamp) }));
    } catch {}
    return [];
  });
  const [entropyTick, setEntropyTick] = useState(0);
  const [streamKey, setStreamKey] = useState(0);
  const [currentQuery, setCurrentQuery] = useState("Explain Quantum Entanglement with a simple analogy.");
  const [queryTick, setQueryTick] = useState(0);
  const [dashboardModels, setDashboardModelsState] = useState<string[]>([]);
  const [tamperAlert, setTamperAlert] = useState(false);

  // Primary model
  const [primaryModel, setPrimaryModel] = useState<string>("llama3");

  // Chat API state
  const [apiLoading, setApiLoading] = useState(false);
  const [chatApiResponse, setChatApiResponse] = useState<string | null>(null);

  // Forge API state
  const [forgeApiLoading, setForgeApiLoading] = useState(false);
  const [forgeApiData, setForgeApiData] = useState<ForgeApiData | null>(null);
  const [forgeCodeResponse, setForgeCodeResponse] = useState<string | null>(null);

  // Mixer API state
  const [mixerApiLoading, setMixerApiLoading] = useState(false);
  const [mixerApiResponse, setMixerApiResponse] = useState<string | null>(null);
  const [mixerModelResponses, setMixerModelResponses] = useState<Record<string, string>>({});

  // UI Overlay state
  const [forgeWizardOpen, setForgeWizardOpen] = useState(false);
  const [mixerPopupOpen, setMixerPopupOpen] = useState(false);
  const [mixerSelectedModels, setMixerSelectedModels] = useState<string[]>(["llama3", "gpt4o"]);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeys, setApiKeysState] = useState<ApiKeys>(loadApiKeys);

  const setApiKeys = useCallback((keys: ApiKeys) => {
    setApiKeysState(keys);
    try { localStorage.setItem("aegis_api_keys", JSON.stringify(keys)); } catch {}
  }, []);

  const isMixerMode = activeModels.includes("mixer");
  const HANDSHAKE_MS = 1200;

  const toggleModel = useCallback(
    (modelId: string) => {
      if (handshakingModels.includes(modelId)) return;
      // If this is already the sole active model, do nothing
      if (activeModels.length === 1 && activeModels[0] === modelId) return;

      setPrimaryModel(modelId);
      setHandshakingModels((prev) => [...prev, modelId]);
      setSystemState("PQC-Handshake");
      setTimeout(() => {
        // Always replace — single model mode
        setActiveModels(modelId === "mixer" ? ["mixer"] : [modelId]);
        setHandshakingModels((prev) => prev.filter((m) => m !== modelId));
        setSystemState("Idle");
      }, HANDSHAKE_MS);
    },
    [activeModels, handshakingModels]
  );

  const fireEntropy = useCallback(() => setEntropyTick((t) => t + 1), []);

  const triggerStream = useCallback(
    (query: string) => {
      if (!query.trim()) return;
      setCurrentQuery(query);
      setStreamKey((k) => k + 1);
      setQueryTick((t) => t + 1);
      const entry: ChatMessage = { id: Date.now().toString(), query, timestamp: new Date(), models: activeModels, isMixed: activeModels.includes("mixer") };
      setChatLog((prev) => {
        const next = [...prev, entry];
        try { localStorage.setItem("aegis_chat_log", JSON.stringify(next)); } catch {}
        return next;
      });
      if (activeModels.includes("mixer")) {
        setSystemState("Synthesizing");
        setTimeout(() => setSystemState("Streaming"), 2200);
        setTimeout(() => setSystemState("Idle"), 10000);
      } else {
        setSystemState("Streaming");
        setTimeout(() => setSystemState("Idle"), 9000);
      }
    },
    [activeModels]
  );

  // ─── handleChatSubmit — Universal Chat Dispatcher ──────────────────────────
  const handleChatSubmit = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) return;
      setApiLoading(true);
      setChatApiResponse(null);
      triggerStream(prompt);
      try {
        if (hasApiKey(primaryModel, apiKeys)) {
          const messages: Message[] = [
            {
              role: "system",
              content: "You are an advanced AI assistant running inside the Aegis-Prime Synapse-OS workstation. Provide clear, accurate, and detailed responses. Format with line breaks for readability.",
            },
            { role: "user", content: prompt },
          ];
          const response = await callModelAPI(primaryModel, messages, apiKeys);
          setChatApiResponse(response);
        } else {
          // Simulate API round-trip with demo fallback
          await new Promise<void>((resolve) => setTimeout(resolve, 800 + Math.random() * 600));
          setChatApiResponse(null);
        }
      } catch (err) {
        console.error("Chat API error:", err);
        setChatApiResponse(null);
      } finally {
        setApiLoading(false);
      }
    },
    [primaryModel, apiKeys, triggerStream]
  );

  // ─── handleForgeSubmit — Universal Forge Dispatcher ───────────────────────
  const handleForgeSubmit = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) return;
      setForgeApiLoading(true);
      setForgeApiData(null);
      setForgeCodeResponse(null);
      setViewMode("forge");
      setForgeQuery(prompt);
      try {
        if (hasApiKey(primaryModel, apiKeys)) {
          const messages: Message[] = [
            {
              role: "system",
              content: `You are Synapse Forge, an expert full-stack AI architect and code generator running inside the Aegis-Prime workstation. 
The user wants to build a project. Generate a complete, production-ready, well-commented main application file.
Include: proper imports, type definitions, error handling, security best practices, and clear inline comments.
Output ONLY the code — no markdown code fences, no explanations before or after. Just raw runnable code.`,
            },
            {
              role: "user",
              content: `Build: ${prompt}\n\nGenerate the primary entry file with complete, working code.`,
            },
          ];
          const response = await callModelAPI(primaryModel, messages, apiKeys);
          setForgeCodeResponse(response);
        } else {
          await new Promise<void>((resolve) => setTimeout(resolve, 1000 + Math.random() * 500));
          setForgeCodeResponse(null);
        }
      } catch (err) {
        console.error("Forge API error:", err);
        setForgeCodeResponse(null);
      } finally {
        setForgeApiLoading(false);
      }
    },
    [primaryModel, apiKeys]
  );

  // ─── handleMixerSubmit — Multi-Model Fusion Dispatcher ────────────────────
  const handleMixerSubmit = useCallback(
    async (prompt: string, selectedModelIds: string[]) => {
      if (!prompt.trim() || selectedModelIds.length === 0) return;
      setMixerApiLoading(true);
      setMixerApiResponse(null);
      setMixerModelResponses({});

      // Activate mixer visual mode
      setActiveModels(["mixer"]);
      setPrimaryModel("mixer");
      setSystemState("Synthesizing");
      triggerStream(prompt);

      // Call all selected models in parallel
      const messages: Message[] = [
        {
          role: "system",
          content: "You are an expert AI assistant. Provide a thorough, accurate, well-structured response.",
        },
        { role: "user", content: prompt },
      ];

      const modelResults: { modelId: string; response: string }[] = [];

      await Promise.allSettled(
        selectedModelIds.map(async (modelId) => {
          try {
            let response: string;
            if (hasApiKey(modelId, apiKeys)) {
              response = await callModelAPI(modelId, messages, apiKeys);
            } else {
              await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));
              response = MODEL_RESPONSES[modelId] ?? `[${modelId} demo response]`;
            }
            modelResults.push({ modelId, response });
            setMixerModelResponses((prev) => ({ ...prev, [modelId]: response }));
          } catch (err) {
            const fallback = MODEL_RESPONSES[modelId] ?? `[${modelId} unavailable]`;
            modelResults.push({ modelId, response: fallback });
            setMixerModelResponses((prev) => ({ ...prev, [modelId]: fallback }));
          }
        })
      );

      // Synthesize all responses
      try {
        const synthMessages: Message[] = [
          {
            role: "system",
            content: `You are the Synapse Fusion Node — a meta-synthesis AI that combines multiple model responses into a single, superior answer.
Format your synthesis as:
[SYNAPSE-OS FUSION NODE :: SYNTHESIS COMPLETE]
[Models: ${selectedModelIds.join(" + ")} | Consensus Depth: 4 Layers]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Then provide:
▶ CONSENSUS VECTOR ANALYSIS: shared insights across models
${selectedModelIds.map((id) => `▶ ${id.toUpperCase()} VECTOR: unique contribution from this model`).join("\n")}
▶ FUSION SYNTHESIS: your integrated, comprehensive answer
[CONFIDENCE SCORE: XX% | DIVERGENCE INDEX: 0.XX | PQC-VERIFIED ✓]`,
          },
          {
            role: "user",
            content: `Original question: "${prompt}"\n\nModel responses to synthesize:\n\n${
              modelResults.map((r) => `=== ${r.modelId.toUpperCase()} ===\n${r.response}`).join("\n\n")
            }`,
          },
        ];

        // Use best available API for synthesis
        const synthModelId = selectedModelIds.find((id) => hasApiKey(id, apiKeys)) ?? selectedModelIds[0];
        let synthesis: string;
        if (hasApiKey(synthModelId, apiKeys)) {
          synthesis = await callModelAPI(synthModelId, synthMessages, apiKeys);
        } else {
          await new Promise((r) => setTimeout(r, 500));
          synthesis =
            `[SYNAPSE-OS FUSION NODE :: SYNTHESIS COMPLETE]\n` +
            `[Models: ${selectedModelIds.join(" + ")} | Consensus Depth: 4 Layers]\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            selectedModelIds
              .map(
                (id) =>
                  `▶ ${id.toUpperCase()} VECTOR:\n${MODEL_RESPONSES[id] ?? `[${id} response]`}`
              )
              .join("\n\n") +
            `\n\n▶ FUSION SYNTHESIS:\nAll models converge on a unified understanding. The synthesized response represents the highest-confidence consensus across all activated model vectors.\n\n[CONFIDENCE SCORE: 96.8% | DIVERGENCE INDEX: 0.03 | PQC-VERIFIED ✓]`;
        }
        setMixerApiResponse(synthesis);
        // Also propagate to chatApiResponse so CentralPanel's ResponsePane shows live output
        setChatApiResponse(synthesis);
      } catch {
        setMixerApiResponse(MODEL_RESPONSES.mixer ?? "[Synthesis unavailable]");
      }

      setMixerApiLoading(false);
      setTimeout(() => setSystemState("Idle"), 2000);
    },
    [apiKeys, triggerStream]
  );

  const deployToDashboard = useCallback((modelIds: string[]) => {
    const ids = modelIds.slice(0, 2);
    setDashboardModelsState(ids);
    setActiveModels(ids);
    setPrimaryModel(ids[0]);
    setSystemState("PQC-Handshake");
    setTimeout(() => setSystemState("Idle"), HANDSHAKE_MS);
  }, []);

  return (
    <KernelContext.Provider
      value={{
        activeModels, handshakingModels, toggleModel, primaryModel,
        systemState, setSystemState,
        viewMode, setViewMode,
        forgeQuery, setForgeQuery,
        chatLog, entropyTick, fireEntropy, isMixerMode,
        streamKey, currentQuery, triggerStream, queryTick,
        apiLoading, chatApiResponse, handleChatSubmit,
        forgeApiLoading, forgeApiData, handleForgeSubmit, forgeCodeResponse,
        mixerApiLoading, mixerApiResponse, mixerModelResponses, handleMixerSubmit,
        forgeWizardOpen, setForgeWizardOpen,
        mixerPopupOpen, setMixerPopupOpen,
        mixerSelectedModels, setMixerSelectedModels,
        apiKeyModalOpen, setApiKeyModalOpen,
        apiKeys, setApiKeys,
        dashboardModels, deployToDashboard,
        tamperAlert, setTamperAlert,
      }}
    >
      {children}
    </KernelContext.Provider>
  );
}