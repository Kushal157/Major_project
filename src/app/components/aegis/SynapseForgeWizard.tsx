import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Hammer, Send, Cpu, Cloud, ChevronRight,
  Zap, Code2, Shield, Globe, Database, Layers, Bot, Key,
} from "lucide-react";
import { useKernel, MODELS } from "./KernelContext";
import { ForgePanel } from "./ForgePanel";

// ─── Suggestion Cards ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: Shield, label: "Secure Login Portal", desc: "OAuth2 + JWT + PQC auth", color: "#00e5ff", prompt: "Build a secure login portal with OAuth2 authentication, JWT tokens, and role-based access control" },
  { icon: Globe, label: "REST API Backend", desc: "FastAPI + PostgreSQL", color: "#8b5cf6", prompt: "Build a production REST API backend with FastAPI, PostgreSQL, authentication, and auto-generated docs" },
  { icon: Bot, label: "AI Chat Interface", desc: "Multi-model streaming UI", color: "#ff2d9b", prompt: "Build an AI chat interface with streaming responses, multi-model support, and conversation history" },
  { icon: Database, label: "Blockchain Dashboard", desc: "Real-time ledger monitor", color: "#f59e0b", prompt: "Build a blockchain dashboard with real-time transaction monitoring, wallet tracking, and analytics" },
  { icon: Layers, label: "Microservice Auth", desc: "Zero-trust architecture", color: "#00ff64", prompt: "Build a zero-trust microservice authentication system with API gateway and service mesh" },
  { icon: Code2, label: "Real-time Dashboard", desc: "WebSocket + React", color: "#ff9500", prompt: "Build a real-time analytics dashboard with WebSocket data streaming and interactive charts" },
  { icon: Key, label: "PQC Crypto Module", desc: "Post-quantum encryption", color: "#a78bfa", prompt: "Build a post-quantum cryptography module with CRYSTALS-Kyber key encapsulation and Dilithium signing" },
  { icon: Globe, label: "Edge CDN API", desc: "Distributed caching layer", color: "#34d399", prompt: "Build an edge CDN API with distributed caching, rate limiting, and geographic routing" },
];

// ─── Animated grid background ─────────────────────────────────────────────────
function WizardGrid() {
  return (
    <div
      style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }}
    />
  );
}

// ─── Floating particles ───────────────────────────────────────────────────────
function FloatingParticle({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      animate={{ y: ["100vh", "-10vh"], opacity: [0, 0.6, 0] }}
      transition={{ repeat: Infinity, duration: 6 + Math.random() * 4, delay, ease: "linear" }}
      style={{
        position: "absolute", left: `${x}%`, bottom: 0,
        width: 1.5, height: 1.5, borderRadius: "50%",
        background: color,
        boxShadow: `0 0 6px ${color}`,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Phase types ──────────────────────────────────────────────────────────────
type WizardPhase = "intro" | "wizard" | "building";

// ─── Main Wizard Component ────────────────────────────────────────────────────
export function SynapseForgeWizard() {
  const {
    forgeWizardOpen, setForgeWizardOpen,
    handleForgeSubmit, forgeApiLoading, forgeQuery,
    primaryModel, apiKeys,
  } = useKernel();

  const [phase, setPhase] = useState<WizardPhase>("intro");
  const [inputVal, setInputVal] = useState("");
  const [selectedModel, setSelectedModel] = useState(primaryModel);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [submittedPrompt, setSubmittedPrompt] = useState("");

  // Non-mixer models only for forge
  const forgeModels = MODELS.filter((m) => m.id !== "mixer");

  // Reset phase when wizard opens
  useEffect(() => {
    if (forgeWizardOpen) {
      setPhase("intro");
      setInputVal("");
      setSubmittedPrompt("");
      const t = setTimeout(() => setPhase("wizard"), 1000);
      return () => clearTimeout(t);
    }
  }, [forgeWizardOpen]);

  const handleClose = () => {
    setForgeWizardOpen(false);
    setPhase("intro");
    setInputVal("");
  };

  const handleSubmit = async (prompt: string) => {
    if (!prompt.trim()) return;
    setSubmittedPrompt(prompt);
    setPhase("building");
    await handleForgeSubmit(prompt);
  };

  const selectedMeta = forgeModels.find((m) => m.id === selectedModel) ?? forgeModels[0];
  const hasKey = (() => {
    if (selectedMeta.provider === "groq") return !!apiKeys.groq;
    if (selectedMeta.provider === "openai") return !!apiKeys.openai;
    if (selectedMeta.provider === "openrouter") return !!apiKeys.openrouter;
    return false;
  })();

  return (
    <AnimatePresence>
      {forgeWizardOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed", inset: 0,
            background: "#020412",
            zIndex: 1500,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <WizardGrid />

          {/* Ambient glows */}
          <div style={{ position: "absolute", top: "30%", left: "20%", width: 400, height: 400, background: "radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "20%", right: "15%", width: 300, height: 300, background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

          {/* Floating particles */}
          {[
            { delay: 0, x: 10, color: "#f59e0b" }, { delay: 1.5, x: 30, color: "#8b5cf6" },
            { delay: 0.8, x: 55, color: "#00e5ff" }, { delay: 2.2, x: 75, color: "#f59e0b" },
            { delay: 0.3, x: 90, color: "#ff2d9b" }, { delay: 3, x: 45, color: "#00ff64" },
          ].map((p, i) => <FloatingParticle key={i} {...p} />)}

          {/* Header bar */}
          <div
            className="flex items-center justify-between px-6 py-3 shrink-0"
            style={{
              background: "rgba(2,4,18,0.95)",
              borderBottom: "1px solid rgba(251,191,36,0.2)",
              backdropFilter: "blur(20px)",
              position: "relative", zIndex: 10,
            }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [-8, 8, -8], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
              >
                <Hammer style={{ width: 18, height: 18, color: "#f59e0b", filter: "drop-shadow(0 0 8px #f59e0b)" }} />
              </motion.div>
              <div>
                <div className="font-mono tracking-widest" style={{ fontSize: 13, color: "#f59e0b", letterSpacing: "0.15em" }}>
                  SYNAPSE FORGE
                </div>
                <div className="font-mono" style={{ fontSize: 8, color: "rgba(251,191,36,0.45)", letterSpacing: "0.1em" }}>
                  AGENTIC BUILD STUDIO // v2.0
                </div>
              </div>
              <div
                className="flex items-center gap-1.5 px-2 py-0.5 rounded"
                style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}
              >
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 0.9 }}
                  style={{ width: 4, height: 4, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 6px #f59e0b" }}
                />
                <span className="font-mono" style={{ fontSize: 8, color: "#f59e0b" }}>
                  {phase === "building" ? "BUILDING" : "READY"}
                </span>
              </div>
              {/* Model indicator */}
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded font-mono"
                style={{ fontSize: 8, color: selectedMeta.color, border: `1px solid ${selectedMeta.color}30`, background: `${selectedMeta.color}0a` }}
              >
                {selectedMeta.type === "cloud" ? <Cloud style={{ width: 9, height: 9 }} /> : <Cpu style={{ width: 9, height: 9 }} />}
                {selectedMeta.modelTag}
                {!hasKey && <span style={{ color: "rgba(255,149,0,0.7)", marginLeft: 4 }}>[demo]</span>}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 font-mono px-3 py-1.5 rounded"
              style={{
                fontSize: 10, color: "rgba(0,229,255,0.5)",
                border: "1px solid rgba(0,229,255,0.2)",
                background: "rgba(0,229,255,0.04)",
                cursor: "pointer",
              }}
            >
              <X style={{ width: 11, height: 11 }} /> CLOSE FORGE
            </button>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">

              {/* ── Intro Phase ── */}
              {phase === "intro" && (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center h-full gap-6"
                >
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ fontSize: 52 }}
                  >
                    ⚙
                  </motion.div>
                  <div className="font-mono text-center" style={{ color: "#f59e0b", letterSpacing: "0.25em", fontSize: 20 }}>
                    SYNAPSE FORGE
                  </div>
                  <div className="font-mono" style={{ fontSize: 10, color: "rgba(251,191,36,0.45)", letterSpacing: "0.2em" }}>
                    INITIALIZING BUILD STUDIO...
                  </div>
                  <div style={{ width: 200, height: 2, background: "rgba(251,191,36,0.1)", borderRadius: 2, overflow: "hidden" }}>
                    <motion.div
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                      style={{ height: "100%", width: "60%", background: "linear-gradient(90deg, transparent, #f59e0b, transparent)" }}
                    />
                  </div>
                </motion.div>
              )}

              {/* ── Wizard Phase ── */}
              {phase === "wizard" && (
                <motion.div
                  key="wizard"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4 }}
                  className="h-full overflow-y-auto"
                  style={{ padding: "40px 0" }}
                >
                  <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 32px" }}>
                    {/* Main prompt */}
                    <div className="text-center mb-10">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-mono"
                        style={{ fontSize: 11, color: "rgba(251,191,36,0.5)", letterSpacing: "0.2em", marginBottom: 12 }}
                      >
                        AGENTIC BUILD MODE // ACTIVE
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ fontSize: 28, color: "#fff", fontFamily: "monospace", marginBottom: 6 }}
                      >
                        What would you like to{" "}
                        <span style={{ color: "#f59e0b", filter: "drop-shadow(0 0 12px #f59e0b)" }}>build</span>
                        {" "}today?
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="font-mono"
                        style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}
                      >
                        Describe your project — Synapse Forge will scaffold, generate, and build it using {selectedMeta.name}
                      </motion.div>
                    </div>

                    {/* Input card */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 }}
                      className="mb-8"
                    >
                      <div
                        className="flex items-center gap-3 rounded px-4 py-4"
                        style={{
                          background: "rgba(251,191,36,0.05)",
                          border: `1px solid ${inputVal ? "rgba(251,191,36,0.5)" : "rgba(251,191,36,0.2)"}`,
                          boxShadow: inputVal ? "0 0 30px rgba(251,191,36,0.08), inset 0 0 20px rgba(0,0,0,0.3)" : "none",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Hammer style={{ width: 16, height: 16, color: "rgba(251,191,36,0.5)", flexShrink: 0 }} />
                        <input
                          value={inputVal}
                          onChange={(e) => setInputVal(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSubmit(inputVal)}
                          autoFocus
                          className="flex-1 bg-transparent outline-none font-mono"
                          style={{ fontSize: 13, color: "#fff", caretColor: "#f59e0b" }}
                          placeholder="e.g. Build me a secure REST API with JWT auth and PostgreSQL..."
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSubmit(inputVal)}
                          disabled={!inputVal.trim()}
                          className="flex items-center gap-2 px-4 py-2 rounded font-mono"
                          style={{
                            fontSize: 10,
                            color: inputVal.trim() ? "#f59e0b" : "rgba(251,191,36,0.3)",
                            border: `1px solid ${inputVal.trim() ? "rgba(251,191,36,0.5)" : "rgba(251,191,36,0.15)"}`,
                            background: inputVal.trim() ? "rgba(251,191,36,0.12)" : "rgba(251,191,36,0.04)",
                            cursor: inputVal.trim() ? "pointer" : "not-allowed",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Send style={{ width: 11, height: 11 }} />
                          FORGE
                        </motion.button>
                      </div>

                      {/* Model selector */}
                      <div className="flex items-center gap-2 mt-3">
                        <span className="font-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>Model:</span>
                        <div className="relative">
                          <button
                            onClick={() => setShowModelPicker(!showModelPicker)}
                            className="flex items-center gap-1.5 font-mono px-2 py-1 rounded"
                            style={{
                              fontSize: 9, color: selectedMeta.color,
                              border: `1px solid ${selectedMeta.color}40`,
                              background: `${selectedMeta.color}0a`,
                              cursor: "pointer",
                            }}
                          >
                            {selectedMeta.type === "cloud"
                              ? <Cloud style={{ width: 9, height: 9 }} />
                              : <Cpu style={{ width: 9, height: 9 }} />
                            }
                            {selectedMeta.name} · {selectedMeta.modelTag}
                            <ChevronRight style={{ width: 9, height: 9, transform: showModelPicker ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                          </button>
                          <AnimatePresence>
                            {showModelPicker && (
                              <motion.div
                                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                                transition={{ duration: 0.15 }}
                                style={{
                                  position: "absolute", top: "calc(100% + 4px)", left: 0,
                                  background: "rgba(4,8,28,0.98)",
                                  border: "1px solid rgba(0,229,255,0.2)",
                                  borderRadius: 6, padding: 4,
                                  minWidth: 220,
                                  zIndex: 100,
                                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                                }}
                              >
                                {forgeModels.map((m) => (
                                  <button
                                    key={m.id}
                                    onClick={() => { setSelectedModel(m.id); setShowModelPicker(false); }}
                                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded font-mono"
                                    style={{
                                      fontSize: 9, cursor: "pointer",
                                      background: selectedModel === m.id ? `${m.color}15` : "transparent",
                                      border: "none",
                                      color: selectedModel === m.id ? m.color : "rgba(255,255,255,0.6)",
                                      textAlign: "left",
                                    }}
                                  >
                                    {m.type === "cloud" ? <Cloud style={{ width: 9, height: 9, color: m.color }} /> : <Cpu style={{ width: 9, height: 9, color: m.color }} />}
                                    <span>{m.name}</span>
                                    <span style={{ color: `${m.color}88`, marginLeft: "auto" }}>{m.modelTag}</span>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        {!hasKey && (
                          <div
                            className="flex items-center gap-1 font-mono px-2 py-0.5 rounded"
                            style={{ fontSize: 8, color: "rgba(255,149,0,0.7)", border: "1px solid rgba(255,149,0,0.2)", background: "rgba(255,149,0,0.05)" }}
                          >
                            <Zap style={{ width: 8, height: 8 }} />
                            No API key — will use demo output
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Suggestions grid */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="font-mono mb-3" style={{ fontSize: 9, color: "rgba(0,229,255,0.4)", letterSpacing: "0.1em" }}>
                        ◈ QUICK START TEMPLATES
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
                          gap: 10,
                        }}
                      >
                        {SUGGESTIONS.map((s, i) => {
                          const Icon = s.icon;
                          return (
                            <motion.button
                              key={s.label}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 + i * 0.05 }}
                              whileHover={{ scale: 1.03, y: -2 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleSubmit(s.prompt)}
                              className="text-left rounded p-3 cursor-pointer"
                              style={{
                                background: `${s.color}08`,
                                border: `1px solid ${s.color}25`,
                                boxShadow: `0 0 20px ${s.color}05`,
                                transition: "all 0.2s ease",
                              }}
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <Icon style={{ width: 12, height: 12, color: s.color, flexShrink: 0 }} />
                                <span className="font-mono" style={{ fontSize: 10, color: s.color }}>
                                  {s.label}
                                </span>
                              </div>
                              <div className="font-mono" style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>
                                {s.desc}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>

                    {/* Footer info */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="flex items-center justify-center gap-6 mt-10"
                    >
                      {[
                        { icon: Shield, label: "PQC-hardened output" },
                        { icon: Code2, label: "Multi-file scaffolding" },
                        { icon: Zap, label: "Agentic code generation" },
                      ].map((f) => {
                        const Icon = f.icon;
                        return (
                          <div key={f.label} className="flex items-center gap-1.5">
                            <Icon style={{ width: 9, height: 9, color: "rgba(0,229,255,0.4)" }} />
                            <span className="font-mono" style={{ fontSize: 8, color: "rgba(0,229,255,0.35)" }}>{f.label}</span>
                          </div>
                        );
                      })}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* ── Building Phase ── */}
              {phase === "building" && (
                <motion.div
                  key="building"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col overflow-hidden"
                >
                  {/* Build prompt banner */}
                  <div
                    className="flex items-center gap-3 px-4 py-2 shrink-0"
                    style={{
                      background: "rgba(251,191,36,0.05)",
                      borderBottom: "1px solid rgba(251,191,36,0.15)",
                    }}
                  >
                    <Hammer style={{ width: 12, height: 12, color: "#f59e0b", flexShrink: 0 }} />
                    <span className="font-mono" style={{ fontSize: 9, color: "rgba(251,191,36,0.6)" }}>
                      BUILDING:
                    </span>
                    <span className="font-mono truncate" style={{ fontSize: 9, color: "rgba(255,255,255,0.7)" }}>
                      {submittedPrompt || forgeQuery}
                    </span>
                    {forgeApiLoading && (
                      <div className="flex items-center gap-1.5 ml-auto shrink-0">
                        <motion.div
                          animate={{ opacity: [1, 0.2, 1] }}
                          transition={{ repeat: Infinity, duration: 0.5 }}
                          style={{ width: 5, height: 5, borderRadius: "50%", background: "#f59e0b" }}
                        />
                        <span className="font-mono" style={{ fontSize: 8, color: "#f59e0b" }}>
                          {selectedMeta.name} GENERATING...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ForgePanel fills remaining space */}
                  <div className="flex-1 overflow-hidden">
                    <ForgePanel query={submittedPrompt || forgeQuery || "Build me a secure application"} />
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
