import { useState, useCallback } from "react";
import { Shield, Cpu, Cloud, Sliders, Zap, Hammer, Star, Radio, GitMerge, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useKernel, MODELS } from "./KernelContext";
import { useTheme } from "./ThemeContext";

const MODEL_ICONS: Record<string, React.ElementType> = {
  llama3: Cpu, mistral: Cpu, gpt4o: Cloud, claude: Cloud,
  qwen: Cloud, kimi: Star, grok: Radio, gemini: Cloud, mixer: GitMerge,
};

// ── PQC Spinner ──────────────────────────────────────────────────────────
function PQCSpinner({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14"
      style={{ animation: "pqcSpin 0.6s linear infinite", flexShrink: 0 }}>
      <style>{`@keyframes pqcSpin{to{transform:rotate(360deg);transform-origin:7px 7px}}`}</style>
      <circle cx="7" cy="7" r="5.5" fill="none" stroke={`${color}25`} strokeWidth="1.5"/>
      <path d="M7 1.5 A5.5 5.5 0 0 1 12.5 7" fill="none" stroke={color}
        strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ── Ripple on click ──────────────────────────────────────────────────────
function useRipple() {
  const [ripples, setRipples] = useState<number[]>([]);
  const addRipple = useCallback(() => {
    const id = Date.now();
    setRipples(r => [...r, id]);
    setTimeout(() => setRipples(r => r.filter(x => x !== id)), 600);
  }, []);
  return { ripples, addRipple };
}

// ── Single model card ────────────────────────────────────────────────────
function ModelCard({ model, index }: { model: typeof MODELS[number]; index: number }) {
  const {
    activeModels, handshakingModels, toggleModel,
    systemState, currentQuery, handleChatSubmit, setMixerPopupOpen,
  } = useKernel();
  const { isDark } = useTheme();

  const { ripples, addRipple } = useRipple();
  const isActive    = activeModels[0] === model.id && !activeModels.includes("mixer")
                    || (model.id === "mixer" && activeModels.includes("mixer"));
  const isHandshake = handshakingModels.includes(model.id);
  const isMixer     = model.id === "mixer";
  const Icon        = MODEL_ICONS[model.id] ?? Cloud;
  const busy        = systemState === "Streaming" || systemState === "Synthesizing";

  // accent color
  const accent = isMixer ? "#ff2d9b"
    : model.type === "local" ? "#00e5ff"
    : model.color;

  // convert hex to rgb for CSS var
  const hexToRgb = (h: string) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
    return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : "0,229,255";
  };

  const handleClick = () => {
    if (busy && !isActive) return;
    if (isMixer) { setMixerPopupOpen(true); return; }
    if (isActive && !isHandshake) return;
    addRipple();
    toggleModel(model.id);
    if (currentQuery.trim()) {
      setTimeout(() => handleChatSubmit(currentQuery), 1300);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.055,
        type: "spring", stiffness: 420, damping: 22,
      }}
      onClick={handleClick}
      whileHover={!isActive && !isHandshake && !busy ? {
        y: -3, scale: 1.025,
        transition: { type: "spring", stiffness: 500, damping: 20 },
      } : {}}
      whileTap={!isActive && !isHandshake && !busy ? {
        scaleX: 1.04, scaleY: 0.93,
        transition: { type: "spring", stiffness: 600, damping: 18 },
      } : {}}
      className="relative overflow-hidden select-none"
      style={{
        cursor: isActive && !isHandshake ? "default" : busy ? "not-allowed" : "pointer",
        borderRadius: 14,
        padding: isActive ? "10px 11px" : "8px 11px",
        background: isHandshake
          ? "linear-gradient(160deg,rgba(255,149,0,0.12) 0%,rgba(255,149,0,0.04) 100%)"
          : isActive
          ? `linear-gradient(160deg,${accent}20 0%,${accent}06 60%,${isDark ? "rgba(0,0,0,0.15)" : "rgba(14,20,32,0.4)"} 100%)`
          : isDark
          ? "linear-gradient(160deg,rgba(255,255,255,0.055) 0%,rgba(255,255,255,0.012) 100%)"
          : "linear-gradient(160deg,rgba(14,20,32,0.85) 0%,rgba(255,244,230,0.4) 100%)",
        border: `1px solid ${
          isHandshake ? "rgba(255,149,0,0.45)"
          : isActive ? `${accent}55`
          : isDark ? "rgba(255,255,255,0.09)" : "rgba(139,92,246,0.18)"
        }`,
        boxShadow: isHandshake
          ? "0 8px 28px rgba(0,0,0,0.55),inset 0 1.5px 0 rgba(255,255,255,0.16)"
          : isActive
          ? `0 14px 44px rgba(0,0,0,${isDark ? "0.6" : "0.08"}),0 0 28px ${accent}28,0 0 56px ${accent}0d,inset 0 1.5px 0 rgba(255,255,255,0.2),inset 0 0 18px ${accent}0a`
          : isDark
          ? "0 6px 20px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.1)"
          : "0 4px 14px rgba(139,92,246,0.08),inset 0 1px 0 rgba(255,255,255,0.9)",
        transition: "box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease, padding 0.25s ease",
      }}
    >
      {/* Top specular highlight */}
      <div style={{
        position: "absolute", top: 0, left: "8%", right: "8%", height: 1,
        background: `linear-gradient(90deg,transparent,rgba(255,255,255,${isActive ? 0.7 : 0.3}),transparent)`,
        pointerEvents: "none",
      }} />

      {/* Inner glass sheen */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "48%",
        background: `linear-gradient(180deg,rgba(255,255,255,${isActive ? 0.06 : 0.03}) 0%,transparent 100%)`,
        borderRadius: "14px 14px 50% 50% / 14px 14px 24px 24px",
        pointerEvents: "none",
      }} />

      {/* Handshake shimmer sweep */}
      <AnimatePresence>
        {isHandshake && (
          <motion.div
            initial={{ x: "-110%" }} animate={{ x: "210%" }}
            transition={{ repeat: Infinity, duration: 0.82, ease: "linear" }}
            style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "linear-gradient(90deg,transparent,rgba(255,149,0,0.2),transparent)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Active periodic shine */}
      <AnimatePresence>
        {isActive && !isHandshake && (
          <motion.div
            initial={{ x: "-110%" }}
            animate={{ x: "210%" }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "linear", repeatDelay: 2.5 }}
            style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: `linear-gradient(90deg,transparent,${accent}22,rgba(255,255,255,0.1),transparent)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Click ripples */}
      {ripples.map(id => (
        <span key={id} className="lg-ripple-child"
          style={{ background: `${accent}45`, width: "120%", aspectRatio: "1" }} />
      ))}

      {/* ── Content ── */}
      <div className="relative z-10 flex items-center gap-2.5">
        {/* Icon */}
        {isHandshake ? (
          <PQCSpinner color="#ff9500" />
        ) : (
          <motion.div
            animate={isActive
              ? { scale: [1, 1.15, 1] }
              : { scale: 1 }}
            transition={isActive
              ? { repeat: Infinity, duration: 2.8, ease: "easeInOut" }
              : {}}
          >
            <Icon style={{
              width: 13, height: 13, flexShrink: 0,
              color: isActive ? accent : "rgba(255,255,255,0.22)",
              filter: isActive ? `drop-shadow(0 0 6px ${accent})` : "none",
              transition: "color 0.3s ease, filter 0.3s ease",
            }} />
          </motion.div>
        )}

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-mono truncate" style={{
              fontSize: isActive ? 11 : 10,
              color: isHandshake ? "#ff9500"
                : isActive ? accent
                : isDark ? "rgba(255,255,255,0.42)" : "rgba(30,15,60,0.6)",
              transition: "color 0.25s, font-size 0.2s",
            }}>
              {isHandshake ? "PQC Tunneling..." : model.name}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {isHandshake ? (
              <motion.div key="hs"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="font-mono" style={{ fontSize: 7.5, color: "rgba(255,149,0,0.6)", marginTop: 1 }}>
                Establishing secure channel...
              </motion.div>
            ) : isActive ? (
              <motion.div key="act"
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
                className="flex items-center gap-1.5 flex-wrap" style={{ marginTop: 3 }}>
                <span className="font-mono" style={{ fontSize: 7.5, color: `${accent}80` }}>
                  {model.modelTag}
                </span>
                <span className="font-mono px-1 rounded" style={{
                  fontSize: 6.5, color: `${accent}cc`,
                  border: `1px solid ${accent}30`, background: `${accent}12`,
                }}>
                  {model.latencyMs}ms
                </span>
              </motion.div>
            ) : (
              <motion.div key="idle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="font-mono" style={{ fontSize: 7.5, color: isDark ? "rgba(255,255,255,0.16)" : "rgba(30,15,60,0.3)", marginTop: 1 }}>
                {model.sub}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status indicator */}
        <div className="shrink-0 flex items-center gap-1">
          {isActive && !isHandshake ? (
            <motion.div
              animate={{ opacity: [1, 0.2, 1], scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.3 }}
              style={{
                width: 6, height: 6, borderRadius: "50%",
                background: accent, boxShadow: `0 0 10px ${accent}, 0 0 20px ${accent}60`,
              }}
            />
          ) : !isHandshake ? (
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: isDark ? "rgba(255,255,255,0.1)" : "rgba(30,15,60,0.15)",
              border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(30,15,60,0.2)",
            }} />
          ) : null}
        </div>
      </div>

      {/* Active bottom bar */}
      <AnimatePresence>
        {isActive && !isHandshake && (
          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              position: "absolute", bottom: 0, left: "12%", right: "12%", height: 1.5,
              background: `linear-gradient(90deg,transparent,${accent},transparent)`,
              boxShadow: `0 0 8px ${accent}`,
              transformOrigin: "center",
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main LeftPanel ───────────────────────────────────────────────────────
export function LeftPanel() {
  const {
    activeModels, systemState, chatLog,
    viewMode, setForgeWizardOpen, setMixerPopupOpen,
  } = useKernel();
  const { isDark } = useTheme();

  const { ripples: forgeRipples, addRipple: addForgeRipple } = useRipple();

  const stateBadge = {
    Idle:           { label: "IDLE",         color: "rgba(0,229,255,0.55)" },
    "PQC-Handshake":{ label: "PQC-SHAKE",    color: "#ff9500" },
    Streaming:      { label: "STREAMING",    color: "#00e5ff" },
    Synthesizing:   { label: "SYNTHESIZING", color: "#ff2d9b" },
  };
  const badge = stateBadge[systemState];

  const coreModels  = MODELS.filter(m => m.id !== "mixer");
  const mixerModel  = MODELS.find(m => m.id === "mixer")!;
  const primaryId   = activeModels[0];
  const primaryMeta = MODELS.find(m => m.id === primaryId);
  const isMixerMode = activeModels.includes("mixer");

  return (
    <div className="flex flex-col overflow-y-auto shrink-0" style={{
      width: 192, minWidth: 192,
      background: isDark ? "rgba(10,4,26,0.88)" : "rgba(9,15,26,0.93)",
      borderRight: isDark ? "1px solid rgba(139,92,246,0.28)" : "1px solid rgba(109,40,217,0.2)",
      backdropFilter: "blur(40px)",
      boxShadow: isDark ? "4px 0 32px rgba(60,0,140,0.12)" : "4px 0 22px rgba(109,40,217,0.1)",
    }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2.5 shrink-0"
        style={{ borderBottom: isDark ? "1px solid rgba(139,92,246,0.2)" : "1px solid rgba(109,40,217,0.15)" }}>
        <span className="font-mono uppercase tracking-widest"
          style={{ fontSize: 9, color: isDark ? "#00e5ff" : "#5b21b6", letterSpacing: "0.14em" }}>
          Model Selector
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={systemState}
            initial={{ opacity: 0, scale: 0.7, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="font-mono px-1.5 py-0.5 rounded-full"
            style={{
              fontSize: 7, color: badge.color,
              border: `1px solid ${badge.color}45`,
              background: `${badge.color}12`,
              backdropFilter: "blur(8px)",
            }}
          >
            {badge.label}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* ── Lumina-Auth ZK — liquid glass card ── */}
      <div className="px-3 pt-3">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 20, delay: 0.05 }}
          className="lg lg-green relative px-2.5 py-2.5"
          style={{ borderRadius: 14 }}
        >
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="relative shrink-0">
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <Shield style={{ width: 18, height: 18, color: "#00ff64",
                  filter: "drop-shadow(0 0 8px #00ff64)" }} />
              </motion.div>
              <div style={{
                position: "absolute", top: -3, right: -5, fontSize: 5.5,
                fontWeight: "bold", color: "#00ff64",
                background: "rgba(0,255,100,0.2)", padding: "0 2.5px", borderRadius: 3,
              }}>ZK</div>
            </div>
            <div className="flex-1">
              <div className="font-mono" style={{ fontSize: 10, color: "#00ff64" }}>Lumina-Auth</div>
              <div className="font-mono" style={{ fontSize: 7, color: "rgba(0,255,100,0.5)" }}>
                [01/0100 0011 1101 10]
              </div>
            </div>
            <div className="flex items-center gap-1">
              <motion.div
                animate={{ opacity: [1, 0.2, 1], scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.0 }}
                style={{ width: 5, height: 5, borderRadius: "50%", background: "#00ff64",
                  boxShadow: "0 0 8px #00ff64" }}
              />
              <span className="font-mono" style={{ fontSize: 7, color: "rgba(0,255,100,0.7)" }}>OK</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Active model banner ── */}
      <div className="px-3 pt-2.5">
        <AnimatePresence mode="wait">
          {primaryMeta && !isMixerMode ? (
            <motion.div
              key={primaryId}
              initial={{ opacity: 0, y: 8, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.93 }}
              transition={{ type: "spring", stiffness: 450, damping: 22 }}
              className="lg relative px-2.5 py-2"
              style={{
                borderRadius: 12,
                background: `linear-gradient(135deg,${primaryMeta.color}18 0%,rgba(0,0,0,0.25) 100%)`,
                border: `1px solid ${primaryMeta.color}35`,
                boxShadow: `0 8px 28px rgba(0,0,0,0.5),0 0 20px ${primaryMeta.color}18`,
              }}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-mono" style={{ fontSize: 7.5, color: "rgba(0,229,255,0.4)" }}>
                    ACTIVE NODE
                  </span>
                  <span className="font-mono px-1.5 rounded-full"
                    style={{
                      fontSize: 6.5, color: primaryMeta.color,
                      border: `1px solid ${primaryMeta.color}35`,
                      background: `${primaryMeta.color}10`,
                    }}>
                    {primaryMeta.badge}
                  </span>
                </div>
                <div className="font-mono" style={{ fontSize: 10.5, color: primaryMeta.color }}>
                  {primaryMeta.name}
                </div>
                <div className="font-mono" style={{ fontSize: 7.5, color: "rgba(0,229,255,0.3)", marginTop: 1 }}>
                  {primaryMeta.modelTag} · {primaryMeta.latencyMs}ms
                </div>
              </div>
            </motion.div>
          ) : isMixerMode ? (
            <motion.div
              key="mixer-banner"
              initial={{ opacity: 0, y: 8, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.93 }}
              transition={{ type: "spring", stiffness: 450, damping: 22 }}
              className="lg lg-pink relative px-2.5 py-2"
              style={{ borderRadius: 12 }}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-mono" style={{ fontSize: 7.5, color: "rgba(255,45,155,0.5)" }}>
                    FUSION MODE
                  </span>
                  <motion.div
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff2d9b",
                      boxShadow: "0 0 10px #ff2d9b" }}
                  />
                </div>
                <div className="font-mono" style={{ fontSize: 10.5, color: "#ff2d9b" }}>
                  Synapse Fusion
                </div>
                <div className="font-mono" style={{ fontSize: 7.5, color: "rgba(255,45,155,0.4)", marginTop: 1 }}>
                  Synapse-Fusion-v2 · 230ms
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ── Divider: MODELS ── */}
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-1.5">
        <div style={{ flex: 1, height: 1, background: isDark ? "rgba(0,229,255,0.08)" : "rgba(109,40,217,0.12)" }} />
        <span className="font-mono" style={{ fontSize: 7.5, color: isDark ? "rgba(0,229,255,0.3)" : "rgba(91,33,182,0.55)", letterSpacing: "0.13em" }}>
          MODELS
        </span>
        <div style={{ flex: 1, height: 1, background: isDark ? "rgba(0,229,255,0.08)" : "rgba(109,40,217,0.12)" }} />
      </div>

      {/* ── Core model cards ── */}
      <div className="flex flex-col gap-1.5 px-3">
        {coreModels.map((model, i) => (
          <ModelCard key={model.id} model={model} index={i} />
        ))}
      </div>

      {/* ── Divider: FUSION ── */}
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-1.5">
        <div style={{ flex: 1, height: 1, background: isDark ? "rgba(255,45,155,0.12)" : "rgba(219,39,119,0.16)" }} />
        <span className="font-mono" style={{ fontSize: 7.5, color: isDark ? "rgba(255,45,155,0.4)" : "rgba(190,24,93,0.6)", letterSpacing: "0.13em" }}>
          FUSION
        </span>
        <div style={{ flex: 1, height: 1, background: isDark ? "rgba(255,45,155,0.12)" : "rgba(219,39,119,0.16)" }} />
      </div>

      {/* ── Mixer card ── */}
      <div className="px-3">
        <ModelCard model={mixerModel} index={coreModels.length} />
      </div>

      {/* ── Divider: WORKSPACE ── */}
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-1.5">
        <div style={{ flex: 1, height: 1, background: isDark ? "rgba(251,191,36,0.12)" : "rgba(217,119,6,0.16)" }} />
        <span className="font-mono" style={{ fontSize: 7.5, color: isDark ? "rgba(251,191,36,0.4)" : "rgba(180,83,9,0.6)", letterSpacing: "0.13em" }}>
          WORKSPACE
        </span>
        <div style={{ flex: 1, height: 1, background: isDark ? "rgba(251,191,36,0.12)" : "rgba(217,119,6,0.16)" }} />
      </div>

      {/* ── Synapse Forge liquid glass button ── */}
      <div className="px-3">
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.5 }}
          onClick={() => { addForgeRipple(); setForgeWizardOpen(true); }}
          whileHover={{ y: -3, scale: 1.025,
            transition: { type: "spring", stiffness: 500, damping: 20 } }}
          whileTap={{ scaleX: 1.04, scaleY: 0.93,
            transition: { type: "spring", stiffness: 600, damping: 18 } }}
          className={`relative overflow-hidden select-none cursor-pointer ${
            viewMode === "forge" ? "lg lg-gold" : "lg lg-rest"
          }`}
          style={{ borderRadius: 14, padding: "9px 11px" }}
        >
          {/* Periodic forge shimmer */}
          <motion.div
            animate={{ x: ["-110%", "210%"] }}
            transition={{ repeat: Infinity, duration: 5, ease: "linear", repeatDelay: 3 }}
            style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "linear-gradient(90deg,transparent,rgba(251,191,36,0.18),rgba(255,255,255,0.08),transparent)",
            }}
          />

          {/* Ripples */}
          {forgeRipples.map(id => (
            <span key={id} className="lg-ripple-child"
              style={{ background: "rgba(251,191,36,0.35)", width: "120%", aspectRatio: "1" }} />
          ))}

          <div className="relative z-10 flex items-center gap-2.5">
            <motion.div
              animate={viewMode === "forge"
                ? { rotate: [-10, 10, -10], scale: [1, 1.12, 1] }
                : { rotate: 0, scale: 1 }}
              transition={{ repeat: viewMode === "forge" ? Infinity : 0, duration: 1.8 }}
            >
              <Hammer style={{
                width: 13, height: 13,
                color: viewMode === "forge" ? "#f59e0b" : "rgba(251,191,36,0.45)",
                filter: viewMode === "forge" ? "drop-shadow(0 0 6px #f59e0b)" : "none",
              }} />
            </motion.div>
            <div className="flex-1">
              <span className="font-mono" style={{
                fontSize: 10.5,
                color: viewMode === "forge" ? "#f59e0b" : "rgba(251,191,36,0.65)",
              }}>
                Synapse Forge
              </span>
              <div className="font-mono" style={{
                fontSize: 7.5, marginTop: 2,
                color: viewMode === "forge" ? "rgba(251,191,36,0.65)" : "rgba(251,191,36,0.3)",
              }}>
                {viewMode === "forge" ? "⚙ BUILDER ACTIVE" : "⚙ AGENTIC BUILD MODE"}
              </div>
            </div>
            {viewMode === "forge" && (
              <motion.div
                animate={{ opacity: [1, 0.2, 1], scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b",
                  boxShadow: "0 0 10px #f59e0b" }}
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Session queries badge ── */}
      <AnimatePresence>
        {chatLog.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 6 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className="px-3 pt-2.5"
          >
            <div className="lg lg-rest relative px-2.5 py-2" style={{ borderRadius: 12 }}>
              <div className="relative z-10 flex items-center justify-between">
                <span className="font-mono" style={{ fontSize: 7.5, color: isDark ? "rgba(0,229,255,0.35)" : "rgba(91,33,182,0.6)" }}>
                  SESSION QUERIES
                </span>
                <motion.span
                  key={chatLog.length}
                  initial={{ scale: 1.5, color: "#00e5ff" }}
                  animate={{ scale: 1, color: "rgba(0,229,255,0.7)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="font-mono"
                  style={{ fontSize: 12 }}
                >
                  {chatLog.length}
                </motion.span>
              </div>
              <div className="relative z-10 font-mono mt-1 truncate"
                style={{ fontSize: 7, color: "rgba(0,229,255,0.22)" }}>
                {chatLog[chatLog.length - 1].query.slice(0, 24)}…
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer ── */}
      <div className="mt-auto px-3 pb-3 pt-2.5"
        style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(109,40,217,0.1)" }}>
        <div className="lg lg-rest relative px-2.5 py-2" style={{ borderRadius: 10 }}>
          <div className="relative z-10 flex items-center gap-1.5">
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.3 }}
              style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff2d9b",
                boxShadow: "0 0 7px #ff2d9b" }}
            />
            <Zap style={{ width: 9, height: 9, color: "#ff2d9b" }} />
            <span className="font-mono" style={{ fontSize: 7.5, color: isDark ? "rgba(255,45,155,0.75)" : "rgba(190,24,93,0.85)" }}>PQC ACTIVE</span>
            <span className="font-mono ml-auto" style={{ fontSize: 7, color: isDark ? "rgba(0,229,255,0.25)" : "rgba(91,33,182,0.5)" }}>
              FIPS 140-3
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}