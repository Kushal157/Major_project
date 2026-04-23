import { useState, useEffect } from "react";
import { Search, Cpu, Cloud, Zap, Send, Sliders, GitMerge, Hammer } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useKernel, MODELS, MODEL_RESPONSES, hasApiKey } from "./KernelContext";
import { ForgePanel } from "./ForgePanel";
import { useTheme } from "./ThemeContext";

// ─── Typewriter ────────────────────────────────────────────────────────────────
function TypewriterText({ text, speed = 14 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(timer); setDone(true); }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span style={{ whiteSpace: "pre-wrap" }}>
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.55 }}
          style={{ color: "#00e5ff" }}
        >▋</motion.span>
      )}
    </span>
  );
}

// ─── Synthesis Animation ───────────────────────────────────────────────────────
function SynthesizingOverlay() {
  const [step, setStep] = useState(0);
  const steps = [
    "Ingesting model vectors...",
    "Running divergence analysis...",
    "Computing consensus manifold...",
    "Fusing response streams...",
    "Verifying PQC signature...",
  ];

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % steps.length), 420);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col items-center justify-center gap-6"
      style={{ background: "rgba(255,45,155,0.03)" }}
    >
      {/* Rotating rings */}
      <div style={{ position: "relative", width: 90, height: 90 }}>
        {[0, 1, 2].map((ring) => (
          <motion.div
            key={ring}
            animate={{ rotate: ring % 2 === 0 ? [0, 360] : [360, 0] }}
            transition={{ repeat: Infinity, duration: 2 + ring * 0.7, ease: "linear" }}
            style={{
              position: "absolute",
              inset: ring * 12,
              borderRadius: "50%",
              border: `1px solid ${["#ff2d9b", "#8b5cf6", "#00e5ff"][ring]}55`,
              boxShadow: `0 0 12px ${["#ff2d9b", "#8b5cf6", "#00e5ff"][ring]}22`,
            }}
          />
        ))}
        {/* Center dot */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          style={{
            position: "absolute", inset: "50%",
            width: 10, height: 10,
            transform: "translate(-50%,-50%)",
            borderRadius: "50%",
            background: "radial-gradient(circle, #ff2d9b, #8b5cf6)",
            boxShadow: "0 0 20px #ff2d9b, 0 0 40px rgba(255,45,155,0.3)",
          }}
        />
      </div>

      <div className="text-center">
        <div className="font-mono" style={{ fontSize: 13, color: "#ff2d9b", letterSpacing: "0.1em" }}>
          SYNAPSE FUSION NODE
        </div>
        <div className="font-mono mt-1" style={{ fontSize: 9, color: "rgba(255,45,155,0.6)" }}>
          Synthesizing multi-model consensus...
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="font-mono mt-2"
            style={{ fontSize: 9, color: "rgba(0,229,255,0.7)" }}
          >
            ▶ {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div style={{ width: 200, height: 2, background: "rgba(255,45,155,0.1)", borderRadius: 2, overflow: "hidden" }}>
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
          style={{
            height: "100%", width: "50%",
            background: "linear-gradient(90deg, transparent, #ff2d9b, #8b5cf6, transparent)",
          }}
        />
      </div>
    </motion.div>
  );
}

// ─── Idle Workspace Prompt ─────────────────────────────────────────────────────
function IdlePrompt({
  isMixerMode,
  apiLoading,
  primaryModel,
}: {
  isMixerMode: boolean;
  apiLoading: boolean;
  primaryModel: string;
}) {
  const meta = MODELS.find((m) => m.id === primaryModel);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center gap-3"
      style={{ background: "rgba(0,0,0,0.1)" }}
    >
      <motion.div
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ repeat: Infinity, duration: 3 }}
        style={{ fontSize: 32 }}
      >
        {isMixerMode ? "⊕" : "◈"}
      </motion.div>

      {/* When a chat API call is in-flight but not yet streaming, show the dispatch hint */}
      {apiLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-center px-4 py-2 rounded"
          style={{
            fontSize: 11, color: "#00e5ff",
            background: "rgba(0,229,255,0.06)",
            border: "1px solid rgba(0,229,255,0.2)",
          }}
        >
          <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}>
            {"[ > "}
          </motion.span>
          {`Awaiting Telemetry from ${meta?.name ?? primaryModel}...`}
        </motion.div>
      ) : (
        <div className="font-mono text-center" style={{ fontSize: 11, color: "rgba(0,229,255,0.4)" }}>
          {isMixerMode
            ? "Synapse Fusion Node armed.\nEnter a query to synthesize responses."
            : "Dual-stream sandbox ready.\nEnter a query to begin streaming."}
        </div>
      )}
    </motion.div>
  );
}

// ─── Single Response Pane ──────────────���───────────────────────────────────────
function ResponsePane({
  modelId,
  streamKey,
  fullWidth = false,
  apiLoading = false,
  chatApiResponse = null,
}: {
  modelId: string;
  streamKey: number;
  fullWidth?: boolean;
  apiLoading?: boolean;
  chatApiResponse?: string | null;
}) {
  const { apiKeys } = useKernel();
  const meta = MODELS.find((m) => m.id === modelId)!;
  const { isDark } = useTheme();
  const [progress, setProgress] = useState(0);
  const [tokens, setTokens] = useState(meta.tokenCount);

  // Build the "awaiting" placeholder message for the loading state
  const awaitingMsg =
    `[ > Awaiting Telemetry from ${meta.name}... ]\n` +
    `  Dispatching to ${meta.apiKey} via PQC-encrypted tunnel\n` +
    `  Model tag: ${meta.modelTag}\n` +
    `  Sandbox: ${meta.sandbox} — channel active`;

  // Resolution priority: live API response → static demo (if no key) → awaiting placeholder
  const isKeySet = hasApiKey(modelId, apiKeys);
  const response = apiLoading
    ? awaitingMsg
    : chatApiResponse
    ? chatApiResponse
    : isKeySet
    ? `[ TELEMETRY ERROR: No response data received from ${meta.name} API. Please check your connection or quota. ]`
    : MODEL_RESPONSES[modelId] ?? "";

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * (modelId === "mixer" ? 1.5 : 3);
        return Math.min(next, 100);
      });
    }, 180);
    const tokTimer = setInterval(() => {
      setTokens((t) => t + Math.floor(Math.random() * 8));
    }, 300);
    return () => { clearInterval(interval); clearInterval(tokTimer); };
  }, [streamKey, modelId]);

  const isMixer = modelId === "mixer";
  const accentBg = isMixer
    ? "rgba(255,45,155,0.04)"
    : meta.type === "cloud"
    ? `${meta.color}0a`
    : "rgba(0,229,255,0.03)";
  const borderColor = isMixer
    ? "rgba(255,45,155,0.2)"
    : meta.type === "cloud"
    ? `${meta.color}30`
    : "rgba(0,229,255,0.18)";

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ flex: 1, borderRight: fullWidth ? "none" : isDark ? "1px solid rgba(0,229,255,0.08)" : "1px solid rgba(139,92,246,0.1)" }}
    >
      {/* Pane header */}
      <div
        className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{ background: accentBg, borderBottom: `1px solid ${borderColor}` }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {isMixer ? (
            <GitMerge style={{ width: 11, height: 11, color: "#ff2d9b", flexShrink: 0 }} />
          ) : meta.type === "cloud" ? (
            <Cloud style={{ width: 11, height: 11, color: meta.color, flexShrink: 0 }} />
          ) : (
            <Cpu style={{ width: 11, height: 11, color: meta.color, flexShrink: 0 }} />
          )}
          <span className="font-mono truncate" style={{ fontSize: 9, color: meta.color }}>
            {isMixer ? "Synapse Fusion" : meta.name} Agent Sandbox: {meta.sandbox}
          </span>
          <span
            className="font-mono px-1 rounded shrink-0"
            style={{
              fontSize: 8, color: `${meta.color}cc`,
              background: `${meta.color}18`, border: `1px solid ${meta.color}30`,
            }}
          >
            {meta.badge}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Show "AWAITING" badge when API call is in-flight */}
          {apiLoading ? (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.55 }}
              className="font-mono"
              style={{ fontSize: 8, color: "#ff9500" }}
            >
              AWAITING
            </motion.span>
          ) : (
            <>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.85 + Math.random() * 0.3 }}
                style={{
                  width: 4, height: 4, borderRadius: "50%",
                  background: meta.color, boxShadow: `0 0 6px ${meta.color}`,
                }}
              />
              <span className="font-mono" style={{ fontSize: 8, color: `${meta.color}99` }}>
                {chatApiResponse ? "API LIVE" : "STREAMING"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: meta.progressBg }}>
        <motion.div
          style={{ height: "100%", background: meta.progressGrad, width: `${progress}%` }}
          transition={{ duration: 0.18 }}
        />
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto p-3"
        style={{ background: `${meta.color}04` }}
      >
        {/* API source badge — only shown when real API response is rendered */}
        {chatApiResponse && !apiLoading && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-2 px-2 py-1 rounded"
            style={{
              background: "rgba(0,229,255,0.05)",
              border: "1px solid rgba(0,229,255,0.15)",
              display: "inline-flex",
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              style={{ width: 4, height: 4, borderRadius: "50%", background: "#00ff64" }}
            />
            <span className="font-mono" style={{ fontSize: 7.5, color: "rgba(0,255,100,0.8)" }}>
              LIVE API RESPONSE · /api/chat · {meta.apiKey}
            </span>
          </motion.div>
        )}
        <div className="font-mono" style={{ fontSize: 10.5, color: isDark ? "rgba(255,255,255,0.82)" : "rgba(20,10,50,0.85)", lineHeight: 1.75 }}>
          <TypewriterText
            text={response}
            speed={apiLoading ? 22 : isMixer ? 11 : 13}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-3 py-1.5 shrink-0"
        style={{ borderTop: `1px solid ${meta.color}20`, background: isDark ? "rgba(0,0,0,0.2)" : "rgba(14,20,32,0.6)" }}
      >
        <div className="font-mono" style={{ fontSize: 8, color: `${meta.color}88` }}>
          TOKENS: <span style={{ color: meta.color }}>{tokens.toLocaleString()}</span>
          {" "}| LATENCY: {meta.latencyMs}ms
        </div>
        <div className="flex items-center gap-1">
          <Zap style={{ width: 8, height: 8, color: meta.color }} />
          <span className="font-mono" style={{ fontSize: 7.5, color: `${meta.color}99` }}>
            {meta.modelTag}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function CentralPanel() {
  const {
    activeModels, systemState, isMixerMode,
    streamKey, fireEntropy,
    viewMode, setViewMode, forgeQuery,
    // Universal Dispatcher
    primaryModel,
    apiLoading, chatApiResponse,
    handleChatSubmit, handleForgeSubmit,
  } = useKernel();
  const { isDark } = useTheme();

  const [inputVal, setInputVal] = useState("Explain Quantum Entanglement with a simple analogy.");

  const isStreaming = systemState === "Streaming";
  const isSynthesizing = systemState === "Synthesizing";

  // Detect forge-trigger keywords in query
  const FORGE_KEYWORDS = ["build", "create", "scaffold", "forge", "generate", "make me", "write me", "develop"];
  const isForgeQuery = (q: string) => FORGE_KEYWORDS.some((kw) => q.toLowerCase().includes(kw));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    fireEntropy(); // Trigger entropy burst on every keystroke
  };

  // ─── Universal submit handler ─────────────────────────────────────────────
  // Routes to either the Forge dispatcher or the Chat dispatcher based on
  // current viewMode and forge-intent keyword detection.
  const handleSubmit = async () => {
    if (!inputVal.trim()) return;
    if (viewMode === "forge" || isForgeQuery(inputVal)) {
      // Forge path — dispatches to /api/forge
      await handleForgeSubmit(inputVal);
      setInputVal("");
      return;
    }
    // Chat path — dispatches to /api/chat + triggers stream animation
    await handleChatSubmit(inputVal);
    setInputVal("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  // Workspace mode label
  const workspaceLabel = isMixerMode
    ? "Synapse Fusion Node"
    : "Single-Model Sandbox";

  const workspaceAccent = isMixerMode ? "#ff2d9b" : "#00e5ff";

  // Status badge
  const statusText = {
    Idle: "READY",
    "PQC-Handshake": "TUNNELING",
    Streaming: "STREAMING",
    Synthesizing: "SYNTHESIZING",
  }[systemState];

  const statusColor = {
    Idle: "rgba(0,229,255,0.5)",
    "PQC-Handshake": "#ff9500",
    Streaming: "#00e5ff",
    Synthesizing: "#ff2d9b",
  }[systemState];

  return (
    <div
      className="flex flex-col flex-1 overflow-hidden"
      style={{ background: isDark ? "rgba(8,3,22,0.62)" : "rgba(9,15,26,0.65)", backdropFilter: "blur(32px)" }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{
          borderBottom: isDark ? "1px solid rgba(0,229,255,0.12)" : "1px solid rgba(109,40,217,0.14)",
          background: isDark ? "rgba(0,0,0,0.2)" : "rgba(12,18,30,0.75)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono tracking-widest" style={{ fontSize: 11, color: isDark ? "#fff" : "rgba(20,10,50,0.9)" }}>
            {workspaceLabel.split("/")[0]}
          </span>
          {workspaceLabel.includes("/") && (
            <>
              <span style={{ color: workspaceAccent, fontSize: 11, fontFamily: "monospace" }}>/</span>
              <span className="font-mono tracking-widest" style={{ fontSize: 11, color: workspaceAccent }}>
                {workspaceLabel.split("/")[1]}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* API loading indicator in the header */}
          <AnimatePresence>
            {apiLoading && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded"
                style={{ background: "rgba(255,149,0,0.08)", border: "1px solid rgba(255,149,0,0.3)" }}
              >
                <motion.div
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  style={{ width: 4, height: 4, borderRadius: "50%", background: "#ff9500" }}
                />
                <span className="font-mono" style={{ fontSize: 8, color: "#ff9500" }}>
                  DISPATCHING → /api/chat
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div
              key={systemState}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded"
              style={{ background: `${statusColor}14`, border: `1px solid ${statusColor}35` }}
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.9 }}
                style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor }}
              />
              <span className="font-mono" style={{ fontSize: 8, color: statusColor }}>
                {statusText}
              </span>
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center gap-1">
            {activeModels.map((id) => {
              const m = MODELS.find((x) => x.id === id);
              if (!m) return null;
              return (
                <span
                  key={id}
                  className="font-mono px-1 rounded"
                  style={{ fontSize: 7.5, color: `${m.color}cc`, border: `1px solid ${m.color}30`, background: `${m.color}10` }}
                >
                  {m.name.split(" ")[0]}
                </span>
              );
            })}
          </div>
          <span className="font-mono" style={{ fontSize: 8, color: "rgba(255,45,155,0.6)" }}>PQC-SHIELDED</span>
        </div>
      </div>

      {/* ── Query Input ── */}
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(109,40,217,0.1)" }}>
        <motion.div
          className="lg-input flex items-center gap-3 px-4 py-2.5"
          animate={{
            borderColor: viewMode === "forge"
              ? "rgba(251,191,36,0.4)"
              : inputVal.length > 0
              ? "rgba(0,229,255,0.38)"
              : "rgba(255,255,255,0.1)",
            boxShadow: viewMode === "forge"
              ? "0 8px 32px rgba(0,0,0,0.5),0 0 24px rgba(251,191,36,0.12),inset 0 1.5px 0 rgba(255,255,255,0.14),inset 0 -1px 0 rgba(0,0,0,0.4)"
              : inputVal.length > 0
              ? "0 8px 32px rgba(0,0,0,0.5),0 0 20px rgba(0,229,255,0.1),inset 0 1.5px 0 rgba(255,255,255,0.14),inset 0 -1px 0 rgba(0,0,0,0.4)"
              : "0 8px 32px rgba(0,0,0,0.5),inset 0 1.5px 0 rgba(255,255,255,0.1),inset 0 -1px 0 rgba(0,0,0,0.4)",
          }}
          transition={{ duration: 0.3 }}
        >
          <Search style={{ width: 14, height: 14, color: viewMode === "forge" ? "rgba(251,191,36,0.6)" : "rgba(0,229,255,0.6)", flexShrink: 0 }} />
          <input
            value={inputVal}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none font-mono"
            style={{ fontSize: 12, color: isDark ? "#fff" : "rgba(20,10,50,0.9)", caretColor: viewMode === "forge" ? "#f59e0b" : "#00e5ff" }}
            placeholder={
              viewMode === "forge"
                ? "Type 'Build me...' to scaffold a new project..."
                : "Enter query — keystrokes generate cryptographic entropy..."
            }
          />
          <motion.button
            whileHover={inputVal.trim() && !apiLoading ? {
              scale: 1.06, y: -1,
              transition: { type: "spring", stiffness: 500, damping: 20 },
            } : {}}
            whileTap={inputVal.trim() && !apiLoading ? {
              scaleX: 1.08, scaleY: 0.9,
              transition: { type: "spring", stiffness: 600, damping: 18 },
            } : {}}
            onClick={handleSubmit}
            disabled={!inputVal.trim() || systemState === "Streaming" || systemState === "Synthesizing" || apiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 relative overflow-hidden"
            style={{
              borderRadius: 999,
              background: viewMode === "forge"
                ? "linear-gradient(135deg,rgba(251,191,36,0.22),rgba(251,191,36,0.08))"
                : inputVal.trim()
                ? "linear-gradient(135deg,rgba(0,229,255,0.22),rgba(0,229,255,0.06))"
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${viewMode === "forge" ? "rgba(251,191,36,0.45)" : inputVal.trim() ? "rgba(0,229,255,0.38)" : "rgba(255,255,255,0.1)"}`,
              boxShadow: inputVal.trim()
                ? viewMode === "forge"
                  ? "0 4px 14px rgba(251,191,36,0.2),inset 0 1px 0 rgba(255,255,255,0.2)"
                  : "0 4px 14px rgba(0,229,255,0.18),inset 0 1px 0 rgba(255,255,255,0.18)"
                : "inset 0 1px 0 rgba(255,255,255,0.08)",
              color: viewMode === "forge" ? "#f59e0b" : inputVal.trim() ? "#00e5ff" : "rgba(0,229,255,0.3)",
              fontSize: 10, cursor: inputVal.trim() && !apiLoading ? "pointer" : "not-allowed",
              opacity: apiLoading ? 0.6 : 1,
              transition: "all 0.25s ease",
            }}
          >
            {/* Button specular */}
            <div style={{
              position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
              background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)",
              pointerEvents: "none",
            }} />
            {viewMode === "forge"
              ? <Hammer style={{ width: 9, height: 9 }} />
              : isMixerMode
              ? <Sliders style={{ width: 9, height: 9 }} />
              : <Send style={{ width: 9, height: 9 }} />
            }
            <span className="font-mono">
              {apiLoading ? "TRANSMITTING..." : viewMode === "forge" ? "FORGE" : isMixerMode ? "FUSE" : "SEND"}
            </span>
          </motion.button>
        </motion.div>

        {/* Hint strip */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-1.5">
            {viewMode === "forge"
              ? ["Build secure login", "Create REST API", "Scaffold microservice", "Make auth system"].map((tag) => (
                  <motion.button
                    key={tag}
                    whileHover={{ y: -2, scale: 1.04, transition: { type: "spring", stiffness: 500, damping: 20 } }}
                    whileTap={{ scaleY: 0.92, scaleX: 1.04 }}
                    onClick={() => { handleForgeSubmit(tag); }}
                    className="font-mono px-2 py-0.5 relative overflow-hidden"
                    style={{
                      fontSize: 7.5, color: "rgba(251,191,36,0.6)",
                      border: "1px solid rgba(251,191,36,0.2)",
                      background: "linear-gradient(135deg,rgba(251,191,36,0.08),rgba(251,191,36,0.02))",
                      borderRadius: 999, cursor: "pointer",
                      boxShadow: "0 3px 10px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.12)",
                    }}
                  >
                    {tag}
                  </motion.button>
                ))
              : ["Quantum Computing", "PQC Encryption", "Neural Networks", "Entanglement"].map((tag) => (
                  <motion.button
                    key={tag}
                    whileHover={{ y: -2, scale: 1.04, transition: { type: "spring", stiffness: 500, damping: 20 } }}
                    whileTap={{ scaleY: 0.92, scaleX: 1.04 }}
                    onClick={() => setInputVal(tag)}
                    className="font-mono px-2 py-0.5 relative overflow-hidden"
                    style={{
                      fontSize: 7.5, color: "rgba(0,229,255,0.55)",
                      border: "1px solid rgba(0,229,255,0.15)",
                      background: "linear-gradient(135deg,rgba(0,229,255,0.07),rgba(0,229,255,0.01))",
                      borderRadius: 999, cursor: "pointer",
                      boxShadow: "0 3px 10px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.1)",
                    }}
                  >
                    {tag}
                  </motion.button>
                ))
            }
          </div>
          <div className="flex items-center gap-2">
            {/* Mode toggle pill */}
            <motion.button
              whileHover={{ y: -1, scale: 1.04, transition: { type: "spring", stiffness: 500, damping: 20 } }}
              whileTap={{ scaleY: 0.92 }}
              onClick={() => setViewMode(viewMode === "forge" ? "chat" : "forge")}
              className="flex items-center gap-1 font-mono px-2 py-0.5 relative overflow-hidden"
              style={{
                fontSize: 7.5,
                color: viewMode === "forge" ? "#f59e0b" : "rgba(0,229,255,0.55)",
                border: `1px solid ${viewMode === "forge" ? "rgba(251,191,36,0.35)" : "rgba(0,229,255,0.18)"}`,
                background: viewMode === "forge"
                  ? "linear-gradient(135deg,rgba(251,191,36,0.1),rgba(251,191,36,0.02))"
                  : "linear-gradient(135deg,rgba(0,229,255,0.06),rgba(0,229,255,0.01))",
                borderRadius: 999, cursor: "pointer",
                boxShadow: "0 3px 10px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <Hammer style={{ width: 8, height: 8 }} />
              {viewMode === "forge" ? "→ Chat Mode" : "→ Forge Mode"}
            </motion.button>
            {primaryModel && (
              <div className="flex items-center gap-1 font-mono px-2 py-0.5"
                style={{
                  fontSize: 7.5, color: "rgba(0,229,255,0.6)",
                  border: "1px solid rgba(0,229,255,0.15)",
                  background: "linear-gradient(135deg,rgba(0,229,255,0.07),rgba(0,229,255,0.01))",
                  borderRadius: 999,
                  boxShadow: "0 3px 8px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.08)",
                }}>
                <span style={{ color: "rgba(0,229,255,0.35)" }}>dispatch →</span>
                <span>{MODELS.find((m) => m.id === primaryModel)?.apiKey ?? primaryModel}</span>
              </div>
            )}
            {inputVal.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="flex items-center gap-1"
              >
                <motion.div
                  animate={{ opacity: [1, 0.4, 1], scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 0.4 }}
                  style={{ width: 4, height: 4, borderRadius: "50%", background: "#ff2d9b",
                    boxShadow: "0 0 6px #ff2d9b" }}
                />
                <span className="font-mono" style={{ fontSize: 7.5, color: "rgba(255,45,155,0.7)" }}>
                  ENTROPY GENERATING
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Workspace: Forge vs Chat ── */}
      <AnimatePresence mode="wait">
        {viewMode === "forge" ? (
          <motion.div
            key="forge"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="flex flex-1 overflow-hidden"
          >
            <ForgePanel query={forgeQuery || "Build me a secure login portal"} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* ── Chat Panes ── */}
            <AnimatePresence mode="wait">
              {/* Synthesizing state */}
              {isSynthesizing && (
                <motion.div key="synthesizing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 overflow-hidden">
                  <SynthesizingOverlay />
                </motion.div>
              )}
              {/* Mixer full-width output */}
              {(isStreaming && isMixerMode) && (
                <motion.div key="mixer-output" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="flex flex-1 overflow-hidden">
                  <ResponsePane
                    modelId="mixer"
                    streamKey={streamKey}
                    fullWidth
                    apiLoading={apiLoading}
                    chatApiResponse={chatApiResponse}
                  />
                </motion.div>
              )}
              {/* Dual/Single stream */}
              {isStreaming && !isMixerMode && (
                <motion.div key={`dual-${streamKey}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="flex flex-1 overflow-hidden gap-px">
                  {activeModels.map((id, idx) => (
                    <ResponsePane
                      key={id}
                      modelId={id}
                      streamKey={streamKey + idx}
                      apiLoading={apiLoading}
                      chatApiResponse={chatApiResponse}
                    />
                  ))}
                </motion.div>
              )}
              {/* Idle */}
              {systemState === "Idle" && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 overflow-hidden">
                  <IdlePrompt
                    isMixerMode={isMixerMode}
                    apiLoading={apiLoading}
                    primaryModel={primaryModel}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}