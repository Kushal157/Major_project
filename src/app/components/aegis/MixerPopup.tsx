import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Cpu, Cloud, Sliders, GitMerge, Send, Zap, ChevronDown,
  CheckCircle2, AlertTriangle, LayoutGrid,
} from "lucide-react";
import { useKernel, MODELS } from "./KernelContext";

// ─── Typewriter for popup response ────────────────────────────────────────────
function TypewriterText({ text, speed = 12 }: { text: string; speed?: number }) {
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
        <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.55 }} style={{ color: "#ff2d9b" }}>▋</motion.span>
      )}
    </span>
  );
}

// ─── Individual Model Response Card ──────────────────────────────────────────
function ModelResponseCard({ modelId, response }: { modelId: string; response: string | undefined }) {
  const meta = MODELS.find((m) => m.id === modelId);
  if (!meta) return null;
  const isLoading = response === undefined;

  return (
    <div
      className="rounded p-3 flex flex-col gap-2"
      style={{
        background: `${meta.color}08`,
        border: `1px solid ${meta.color}30`,
        minHeight: 80,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        {meta.type === "cloud"
          ? <Cloud style={{ width: 10, height: 10, color: meta.color, flexShrink: 0 }} />
          : <Cpu style={{ width: 10, height: 10, color: meta.color, flexShrink: 0 }} />
        }
        <span className="font-mono" style={{ fontSize: 9, color: meta.color }}>{meta.name}</span>
        <span className="font-mono px-1 rounded" style={{ fontSize: 7.5, color: `${meta.color}aa`, border: `1px solid ${meta.color}25`, background: `${meta.color}0a` }}>
          {meta.modelTag}
        </span>
        <div className="ml-auto">
          {isLoading ? (
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}
              className="flex items-center gap-1">
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: meta.color }} />
              <span className="font-mono" style={{ fontSize: 7.5, color: meta.color }}>GENERATING</span>
            </motion.div>
          ) : (
            <CheckCircle2 style={{ width: 10, height: 10, color: "#00ff64" }} />
          )}
        </div>
      </div>

      {/* Content */}
      {!isLoading && (
        <div className="font-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.75)", lineHeight: 1.65 }}>
          <TypewriterText text={response!.slice(0, 400) + (response!.length > 400 ? "..." : "")} speed={8} />
        </div>
      )}
      {isLoading && (
        <div style={{ height: 2, background: `${meta.color}15`, borderRadius: 2, overflow: "hidden", marginTop: 4 }}>
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            style={{ height: "100%", width: "50%", background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)` }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function MixerPopup() {
  const {
    mixerPopupOpen, setMixerPopupOpen,
    mixerSelectedModels, setMixerSelectedModels,
    handleMixerSubmit,
    mixerApiLoading, mixerApiResponse, mixerModelResponses,
    apiKeys,
    deployToDashboard,
  } = useKernel();

  const [inputVal, setInputVal] = useState("");
  const [phase, setPhase] = useState<"select" | "generating" | "done">("select");
  const responseRef = useRef<HTMLDivElement>(null);

  const availableModels = MODELS.filter((m) => m.id !== "mixer");

  const hasKey = (modelId: string) => {
    const m = MODELS.find((x) => x.id === modelId);
    if (!m) return false;
    if (m.provider === "groq") return !!apiKeys.groq;
    if (m.provider === "openai") return !!apiKeys.openai;
    if (m.provider === "openrouter") return !!apiKeys.openrouter;
    return false;
  };

  // Reset on open
  useEffect(() => {
    if (mixerPopupOpen) {
      setPhase("select");
      setInputVal("");
    }
  }, [mixerPopupOpen]);

  // Track generation completion
  useEffect(() => {
    if (!mixerApiLoading && mixerApiResponse && phase === "generating") {
      setPhase("done");
    }
  }, [mixerApiLoading, mixerApiResponse, phase]);

  // Auto-scroll response
  useEffect(() => {
    if (responseRef.current) responseRef.current.scrollTop = responseRef.current.scrollHeight;
  }, [mixerApiResponse]);

  const MAX_MIXER = 2;

  const toggleModel = (modelId: string) => {
    if (mixerSelectedModels.includes(modelId)) {
      setMixerSelectedModels(mixerSelectedModels.filter((m) => m !== modelId));
    } else if (mixerSelectedModels.length < MAX_MIXER) {
      setMixerSelectedModels([...mixerSelectedModels, modelId]);
    } else {
      // Replace the first selected with the new one
      setMixerSelectedModels([mixerSelectedModels[1], modelId]);
    }
  };

  const handleFuse = async () => {
    if (!inputVal.trim() || mixerSelectedModels.length < 2) return;
    setPhase("generating");
    await handleMixerSubmit(inputVal, mixerSelectedModels);
  };

  const handleClose = () => {
    setMixerPopupOpen(false);
    setPhase("select");
    setInputVal("");
  };

  const anyKeyConfigured = mixerSelectedModels.some(hasKey);

  return (
    <AnimatePresence>
      {mixerPopupOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(2,4,18,0.85)",
              backdropFilter: "blur(8px)",
              zIndex: 2000,
            }}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            style={{
              position: "fixed",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(660px, 96vw)",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              background: "linear-gradient(165deg,rgba(255,255,255,0.065) 0%,rgba(255,255,255,0.01) 50%,rgba(0,0,0,0.2) 100%)",
              border: "1px solid rgba(255,45,155,0.3)",
              borderRadius: 18,
              boxShadow: "0 32px 80px rgba(0,0,0,0.75),0 0 60px rgba(255,45,155,0.1),0 0 120px rgba(139,92,246,0.06),inset 0 1.5px 0 rgba(255,255,255,0.18)",
              zIndex: 2001,
              overflow: "hidden",
              backdropFilter: "blur(32px)",
            }}
          >
            {/* Top specular */}
            <div style={{
              position: "absolute", top: 0, left: "8%", right: "8%", height: 1.5,
              background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.55),rgba(255,255,255,0.75),rgba(255,255,255,0.55),transparent)",
              pointerEvents: "none", zIndex: 10,
            }} />
            {/* Top glass sheen */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "30%",
              background: "linear-gradient(180deg,rgba(255,255,255,0.04) 0%,transparent 100%)",
              borderRadius: "18px 18px 50% 50% / 18px 18px 40px 40px",
              pointerEvents: "none",
            }} />

            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-5 py-3.5 shrink-0"
              style={{ background: "rgba(255,45,155,0.06)", borderBottom: "1px solid rgba(255,45,155,0.2)" }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 180, 360] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                >
                  <GitMerge style={{ width: 18, height: 18, color: "#ff2d9b", filter: "drop-shadow(0 0 8px #ff2d9b)" }} />
                </motion.div>
                <div>
                  <div className="font-mono tracking-widest" style={{ fontSize: 13, color: "#ff2d9b", letterSpacing: "0.12em" }}>
                    ⊕ SYNAPSE FUSION MIXER
                  </div>
                  <div className="font-mono" style={{ fontSize: 8, color: "rgba(255,45,155,0.45)" }}>
                    Multi-Model Consensus Synthesis Engine
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex items-center justify-center rounded"
                style={{ width: 28, height: 28, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,45,155,0.2)", color: "rgba(255,45,155,0.6)", cursor: "pointer" }}
              >
                <X style={{ width: 12, height: 12 }} />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">

                {/* SELECT PHASE */}
                {phase === "select" && (
                  <motion.div
                    key="select"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 flex flex-col gap-5"
                  >
                    {/* Model grid */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Sliders style={{ width: 10, height: 10, color: "#ff2d9b" }} />
                        <span className="font-mono" style={{ fontSize: 9, color: "rgba(255,45,155,0.7)", letterSpacing: "0.1em" }}>
                          SELECT EXACTLY 2 MODELS TO FUSE
                        </span>
                        <div
                          className="font-mono px-1.5 py-0.5 rounded ml-auto"
                          style={{
                            fontSize: 8,
                            color: mixerSelectedModels.length === MAX_MIXER ? "#00ff64" : "rgba(255,45,155,0.6)",
                            border: `1px solid ${mixerSelectedModels.length === MAX_MIXER ? "rgba(0,255,100,0.3)" : "rgba(255,45,155,0.2)"}`,
                            background: mixerSelectedModels.length === MAX_MIXER ? "rgba(0,255,100,0.06)" : "rgba(255,45,155,0.04)",
                          }}
                        >
                          {mixerSelectedModels.length} / {MAX_MIXER} selected
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {availableModels.map((model) => {
                          const isSelected = mixerSelectedModels.includes(model.id);
                          const hasK = hasKey(model.id);
                          const accentColor = model.type === "cloud" ? model.color : "#00e5ff";

                          return (
                            <motion.button
                              key={model.id}
                              initial={{ opacity: 0, y: 10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ type: "spring", stiffness: 420, damping: 22 }}
                              whileHover={{ y: -3, scale: 1.03,
                                transition: { type: "spring", stiffness: 500, damping: 20 } }}
                              whileTap={{ scaleX: 1.05, scaleY: 0.93,
                                transition: { type: "spring", stiffness: 600, damping: 18 } }}
                              onClick={() => toggleModel(model.id)}
                              disabled={!isSelected && mixerSelectedModels.length >= MAX_MIXER}
                              className="flex items-center gap-3 p-3 text-left cursor-pointer relative overflow-hidden"
                              style={{
                                borderRadius: 14,
                                background: isSelected
                                  ? `linear-gradient(160deg,${accentColor}20 0%,${accentColor}06 100%)`
                                  : "linear-gradient(160deg,rgba(255,255,255,0.055) 0%,rgba(255,255,255,0.01) 100%)",
                                border: `1px solid ${isSelected ? accentColor + "55" : "rgba(255,255,255,0.09)"}`,
                                boxShadow: isSelected
                                  ? `0 12px 36px rgba(0,0,0,0.55),0 0 24px ${accentColor}22,inset 0 1.5px 0 rgba(255,255,255,0.2)`
                                  : "0 6px 18px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.1)",
                                transition: "all 0.25s ease",
                                opacity: !isSelected && mixerSelectedModels.length >= MAX_MIXER ? 0.4 : 1,
                                cursor: !isSelected && mixerSelectedModels.length >= MAX_MIXER ? "not-allowed" : "pointer",
                              }}
                            >
                              {/* Specular */}
                              <div style={{
                                position: "absolute", top: 0, left: "8%", right: "8%", height: 1,
                                background: `linear-gradient(90deg,transparent,rgba(255,255,255,${isSelected ? 0.6 : 0.25}),transparent)`,
                                pointerEvents: "none",
                              }} />
                              {/* Inner sheen */}
                              <div style={{
                                position: "absolute", top: 0, left: 0, right: 0, height: "45%",
                                background: `linear-gradient(180deg,rgba(255,255,255,${isSelected ? 0.055 : 0.025}) 0%,transparent 100%)`,
                                borderRadius: "14px 14px 50% 50% / 14px 14px 20px 20px",
                                pointerEvents: "none",
                              }} />
                              {/* Active shimmer */}
                              {isSelected && (
                                <motion.div
                                  animate={{ x: ["-110%", "210%"] }}
                                  transition={{ repeat: Infinity, duration: 4, ease: "linear", repeatDelay: 2.5 }}
                                  style={{
                                    position: "absolute", inset: 0, pointerEvents: "none",
                                    background: `linear-gradient(90deg,transparent,${accentColor}20,rgba(255,255,255,0.08),transparent)`,
                                  }}
                                />
                              )}

                              {/* Checkbox */}
                              <div style={{
                                width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                                border: `1.5px solid ${isSelected ? accentColor : "rgba(255,255,255,0.2)"}`,
                                background: isSelected
                                  ? `linear-gradient(135deg,${accentColor}35,${accentColor}15)`
                                  : "rgba(255,255,255,0.04)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: isSelected ? `0 0 10px ${accentColor}40,inset 0 1px 0 rgba(255,255,255,0.2)` : "inset 0 1px 0 rgba(255,255,255,0.1)",
                                transition: "all 0.2s ease",
                                position: "relative",
                              }}>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 600, damping: 18 }}
                                    style={{ width: 7, height: 7, borderRadius: 1.5, background: accentColor }}
                                  />
                                )}
                              </div>

                              <div className="flex-1 min-w-0 relative z-10">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  {model.type === "cloud"
                                    ? <Cloud style={{ width: 9, height: 9, color: accentColor, flexShrink: 0 }} />
                                    : <Cpu style={{ width: 9, height: 9, color: accentColor, flexShrink: 0 }} />
                                  }
                                  <span className="font-mono" style={{ fontSize: 9.5, color: isSelected ? accentColor : "rgba(255,255,255,0.55)" }}>
                                    {model.name}
                                  </span>
                                </div>
                                <div className="font-mono" style={{ fontSize: 7.5, color: isSelected ? `${accentColor}80` : "rgba(255,255,255,0.22)" }}>
                                  {model.modelTag}
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1 relative z-10">
                                <span className="font-mono px-1.5 rounded-full"
                                  style={{
                                    fontSize: 7, color: hasK ? "#00ff64" : "rgba(255,149,0,0.7)",
                                    border: `1px solid ${hasK ? "rgba(0,255,100,0.25)" : "rgba(255,149,0,0.25)"}`,
                                    background: hasK ? "rgba(0,255,100,0.07)" : "rgba(255,149,0,0.06)",
                                    boxShadow: hasK ? "inset 0 1px 0 rgba(255,255,255,0.15)" : "none",
                                  }}>
                                  {hasK ? "LIVE" : "DEMO"}
                                </span>
                                <span className="font-mono" style={{ fontSize: 7, color: "rgba(0,229,255,0.3)" }}>
                                  {model.latencyMs}ms
                                </span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* No-key notice */}
                    {!anyKeyConfigured && mixerSelectedModels.length > 0 && (
                      <div
                        className="flex items-center gap-2 px-3 py-2 rounded"
                        style={{ background: "rgba(255,149,0,0.05)", border: "1px solid rgba(255,149,0,0.2)" }}
                      >
                        <AlertTriangle style={{ width: 11, height: 11, color: "#ff9500", flexShrink: 0 }} />
                        <span className="font-mono" style={{ fontSize: 8, color: "rgba(255,149,0,0.7)" }}>
                          No API keys configured — will use demo content. Add keys via the Settings icon in TopNav.
                        </span>
                      </div>
                    )}

                    {/* Prompt input */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ChevronDown style={{ width: 10, height: 10, color: "#ff2d9b" }} />
                        <span className="font-mono" style={{ fontSize: 9, color: "rgba(255,45,155,0.7)", letterSpacing: "0.1em" }}>
                          FUSION PROMPT
                        </span>
                      </div>
                      <textarea
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        placeholder="Enter your prompt — all selected models will respond, then Synapse Fusion will synthesize a unified answer..."
                        rows={3}
                        className="w-full bg-transparent outline-none font-mono rounded p-3 resize-none"
                        style={{
                          fontSize: 10.5,
                          color: "#fff",
                          caretColor: "#ff2d9b",
                          background: "rgba(255,45,155,0.04)",
                          border: `1px solid ${inputVal ? "rgba(255,45,155,0.35)" : "rgba(255,45,155,0.15)"}`,
                          lineHeight: 1.7,
                          transition: "border-color 0.2s ease",
                        }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* GENERATING PHASE */}
                {(phase === "generating" || phase === "done") && (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="p-5 flex flex-col gap-4"
                  >
                    {/* Prompt display */}
                    <div
                      className="flex items-start gap-2 px-3 py-2 rounded"
                      style={{ background: "rgba(255,45,155,0.05)", border: "1px solid rgba(255,45,155,0.15)" }}
                    >
                      <GitMerge style={{ width: 10, height: 10, color: "#ff2d9b", flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div className="font-mono" style={{ fontSize: 7.5, color: "rgba(255,45,155,0.5)", marginBottom: 2 }}>
                          FUSION PROMPT:
                        </div>
                        <div className="font-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.7)" }}>{inputVal}</div>
                      </div>
                    </div>

                    {/* Per-model responses */}
                    <div>
                      <div className="font-mono mb-2" style={{ fontSize: 8, color: "rgba(0,229,255,0.4)", letterSpacing: "0.1em" }}>
                        ◈ MODEL VECTOR RESPONSES
                      </div>
                      <div className="flex flex-col gap-2">
                        {mixerSelectedModels.map((modelId) => (
                          <ModelResponseCard
                            key={modelId}
                            modelId={modelId}
                            response={mixerModelResponses[modelId]}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Synthesis */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <motion.div
                          animate={mixerApiLoading ? { rotate: [0, 360] } : { rotate: 0 }}
                          transition={{ repeat: mixerApiLoading ? Infinity : 0, duration: 1.5, ease: "linear" }}
                        >
                          <Zap style={{ width: 10, height: 10, color: "#ff2d9b" }} />
                        </motion.div>
                        <span className="font-mono" style={{ fontSize: 8, color: "rgba(255,45,155,0.7)", letterSpacing: "0.1em" }}>
                          SYNAPSE FUSION SYNTHESIS
                        </span>
                        {mixerApiLoading && !mixerApiResponse && (
                          <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ repeat: Infinity, duration: 0.6 }}
                            className="font-mono ml-auto"
                            style={{ fontSize: 7.5, color: "#ff2d9b" }}
                          >
                            SYNTHESIZING...
                          </motion.span>
                        )}
                        {phase === "done" && (
                          <div className="flex items-center gap-1 ml-auto">
                            <CheckCircle2 style={{ width: 10, height: 10, color: "#00ff64" }} />
                            <span className="font-mono" style={{ fontSize: 7.5, color: "#00ff64" }}>COMPLETE</span>
                          </div>
                        )}
                      </div>

                      <div
                        ref={responseRef}
                        className="rounded p-3"
                        style={{
                          background: "rgba(255,45,155,0.05)",
                          border: `1px solid ${mixerApiResponse ? "rgba(255,45,155,0.3)" : "rgba(255,45,155,0.12)"}`,
                          minHeight: 80,
                          maxHeight: 200,
                          overflowY: "auto",
                        }}
                      >
                        {!mixerApiResponse && mixerApiLoading && (
                          <div style={{ height: 2, background: "rgba(255,45,155,0.1)", borderRadius: 2, overflow: "hidden" }}>
                            <motion.div
                              animate={{ x: ["-100%", "100%"] }}
                              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                              style={{ height: "100%", width: "50%", background: "linear-gradient(90deg, transparent, #ff2d9b, #8b5cf6, transparent)" }}
                            />
                          </div>
                        )}
                        {mixerApiResponse && (
                          <div className="font-mono" style={{ fontSize: 9.5, color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>
                            <TypewriterText text={mixerApiResponse} speed={6} />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Footer actions ── */}
            <div className="flex items-center justify-between px-5 py-3.5 shrink-0"
              style={{ borderTop: "1px solid rgba(255,45,155,0.12)", background: "rgba(0,0,0,0.2)" }}>
              {phase === "select" ? (
                <>
                  <div className="font-mono" style={{ fontSize: 8, color: "rgba(255,45,155,0.35)" }}>
                    {mixerSelectedModels.length < MAX_MIXER
                      ? `Select ${MAX_MIXER - mixerSelectedModels.length} more model${MAX_MIXER - mixerSelectedModels.length > 1 ? "s" : ""}`
                      : "2 models locked — ready to fuse"}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Deploy to Dashboard button */}
                    {mixerSelectedModels.length === MAX_MIXER && (
                      <motion.button
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { deployToDashboard(mixerSelectedModels); handleClose(); }}
                        className="flex items-center gap-1.5 font-mono px-3 py-1.5 rounded"
                        style={{
                          fontSize: 9.5,
                          color: "#00e5ff",
                          border: "1px solid rgba(0,229,255,0.4)",
                          background: "linear-gradient(135deg,rgba(0,229,255,0.12),rgba(0,229,255,0.04))",
                          boxShadow: "0 4px 14px rgba(0,229,255,0.15),inset 0 1px 0 rgba(255,255,255,0.18)",
                          cursor: "pointer",
                        }}
                      >
                        <LayoutGrid style={{ width: 10, height: 10 }} />
                        DEPLOY TO DASHBOARD
                      </motion.button>
                    )}
                    <button onClick={handleClose} className="font-mono px-3 py-1.5 rounded"
                      style={{ fontSize: 10, color: "rgba(0,229,255,0.5)", border: "1px solid rgba(0,229,255,0.2)", background: "transparent", cursor: "pointer" }}>
                      CANCEL
                    </button>
                    <motion.button
                      whileHover={mixerSelectedModels.length >= MAX_MIXER && inputVal.trim() ? { scale: 1.02 } : {}}
                      whileTap={mixerSelectedModels.length >= MAX_MIXER && inputVal.trim() ? { scale: 0.97 } : {}}
                      onClick={handleFuse}
                      disabled={mixerSelectedModels.length < MAX_MIXER || !inputVal.trim()}
                      className="flex items-center gap-2 font-mono px-5 py-1.5 rounded"
                      style={{
                        fontSize: 11,
                        color: mixerSelectedModels.length >= MAX_MIXER && inputVal.trim() ? "#ff2d9b" : "rgba(255,45,155,0.3)",
                        border: `1px solid ${mixerSelectedModels.length >= MAX_MIXER && inputVal.trim() ? "rgba(255,45,155,0.5)" : "rgba(255,45,155,0.15)"}`,
                        background: mixerSelectedModels.length >= MAX_MIXER && inputVal.trim()
                          ? "linear-gradient(135deg,rgba(255,45,155,0.15),rgba(255,45,155,0.04))"
                          : "transparent",
                        boxShadow: mixerSelectedModels.length >= MAX_MIXER && inputVal.trim()
                          ? "0 6px 20px rgba(255,45,155,0.2),inset 0 1px 0 rgba(255,255,255,0.15)"
                          : "none",
                        cursor: mixerSelectedModels.length >= MAX_MIXER && inputVal.trim() ? "pointer" : "not-allowed",
                        transition: "all 0.25s ease",
                      }}
                    >
                      <GitMerge style={{ width: 12, height: 12 }} />
                      ⊕ FUSE
                    </motion.button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="font-mono" style={{ fontSize: 8, color: "rgba(255,45,155,0.4)" }}>
                    {phase === "generating" ? "Fusion in progress..." : "Fusion complete"}
                  </div>
                  <div className="flex items-center gap-2">
                    {phase === "done" && mixerSelectedModels.length === MAX_MIXER && (
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => { deployToDashboard(mixerSelectedModels); handleClose(); }}
                        className="flex items-center gap-1.5 font-mono px-3 py-1.5 rounded"
                        style={{ fontSize: 9.5, color: "#00e5ff", border: "1px solid rgba(0,229,255,0.4)", background: "rgba(0,229,255,0.08)", cursor: "pointer" }}>
                        <LayoutGrid style={{ width: 10, height: 10 }} />
                        DEPLOY TO DASHBOARD
                      </motion.button>
                    )}
                    <button onClick={handleClose} className="font-mono px-4 py-1.5 rounded"
                      style={{ fontSize: 10, color: "#ff2d9b", border: "1px solid rgba(255,45,155,0.3)", background: "rgba(255,45,155,0.06)", cursor: "pointer" }}>
                      CLOSE
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}