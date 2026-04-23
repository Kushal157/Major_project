import { useState, useEffect } from "react";
import { Settings, LayoutGrid, Wifi, ShieldCheck, Hammer, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useKernel } from "./KernelContext";
import { useTheme } from "./ThemeContext";

const PQC_KEY = "AC30Kctrgu9Uofotatfvhtnt/vMetS8fyr*kpGZlifoa4f2rKx70ToOo0E/217Xo7G30O3j.../on@hoahg";

// System state → display config
const STATE_CONFIG = {
  "Idle":          { label: "ALL SYSTEMS NOMINAL",     color: "#00ff64", pulse: 1.8 },
  "PQC-Handshake": { label: "PQC HANDSHAKE IN PROGRESS", color: "#ff9500", pulse: 0.5 },
  "Streaming":     { label: "DUAL STREAM ACTIVE",       color: "#00e5ff", pulse: 0.9 },
  "Synthesizing":  { label: "FUSION SYNTHESIZING",      color: "#ff2d9b", pulse: 0.4 },
} as const;

export function TopNav() {
  const { systemState, activeModels, chatLog, viewMode, setApiKeyModalOpen } = useKernel();
  const { isDark, toggleTheme } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-US", { hour12: false });
  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });

  const stateCfg = STATE_CONFIG[systemState];

  return (
    <div
      className="flex items-center justify-between px-5 py-2 shrink-0 z-50 relative"
      style={{
        background: isDark ? "rgba(10,4,26,0.92)" : "rgba(9,15,26,0.96)",
        borderBottom: isDark ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(109,40,217,0.22)",
        backdropFilter: "blur(36px)",
        boxShadow: isDark
          ? "0 4px 40px rgba(60,0,140,0.18), 0 1px 0 rgba(255,255,255,0.05)"
          : "0 4px 28px rgba(109,40,217,0.14), 0 1px 0 rgba(255,255,255,0.85)",
      }}
    >
      {/* Left: Title + PQC Key */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [1, 0.4, 1], scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#00e5ff",
              boxShadow: "0 0 12px #00e5ff, 0 0 24px rgba(0,229,255,0.4)",
            }}
          />
          <span className="font-mono text-sm tracking-widest" style={{ color: isDark ? "#00e5ff" : "#5b21b6", letterSpacing: "0.12em" }}>
            Synapse-OS Workstation &nbsp;|&nbsp; Aegis-Prime
          </span>

          {/* ZK-AUTH pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="flex items-center gap-1 px-2 py-0.5 relative overflow-hidden"
            style={{
              borderRadius: 999,
              background: "linear-gradient(135deg,rgba(0,255,100,0.12),rgba(0,255,100,0.04))",
              border: "1px solid rgba(0,255,100,0.3)",
              boxShadow: isDark
                ? "0 4px 14px rgba(0,0,0,0.4),0 0 12px rgba(0,255,100,0.1),inset 0 1px 0 rgba(255,255,255,0.18)"
                : "0 4px 14px rgba(109,40,217,0.1),0 0 12px rgba(0,200,80,0.15),inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            <div style={{
              position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
              background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)",
              pointerEvents: "none",
            }} />
            <ShieldCheck style={{ width: 10, height: 10, color: "#00ff64" }} />
            <span className="font-mono" style={{ fontSize: 9, color: "#00ff64" }}>ZK-AUTH</span>
          </motion.div>

          {/* Active model chips */}
          <AnimatePresence mode="popLayout">
            {viewMode === "forge" ? (
              <motion.div
                key="forge-chip"
                initial={{ opacity: 0, scale: 0.75, x: -8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.75, x: 8 }}
                transition={{ type: "spring", stiffness: 450, damping: 22 }}
                className="flex items-center gap-1.5 px-2 py-0.5 relative overflow-hidden"
                style={{
                  borderRadius: 999,
                  background: "linear-gradient(135deg,rgba(251,191,36,0.15),rgba(251,191,36,0.04))",
                  border: "1px solid rgba(251,191,36,0.4)",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.4),0 0 14px rgba(251,191,36,0.15),inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <div style={{
                  position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
                  background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)",
                  pointerEvents: "none",
                }} />
                <motion.div animate={{ rotate: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 1.8 }}>
                  <Hammer style={{ width: 10, height: 10, color: "#f59e0b" }} />
                </motion.div>
                <span className="font-mono" style={{ fontSize: 9, color: "#f59e0b" }}>SYNAPSE FORGE</span>
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 0.9 }}
                  style={{ width: 4, height: 4, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 6px #f59e0b" }}
                />
              </motion.div>
            ) : (
              activeModels.map((id) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, scale: 0.75, x: -8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.75, x: 8 }}
                  transition={{ type: "spring", stiffness: 450, damping: 22 }}
                  className="flex items-center gap-1 px-2 py-0.5 relative overflow-hidden"
                  style={{
                    borderRadius: 999,
                    background: "linear-gradient(135deg,rgba(0,229,255,0.1),rgba(0,229,255,0.02))",
                    border: "1px solid rgba(0,229,255,0.25)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.35),0 0 10px rgba(0,229,255,0.08),inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
                    background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)",
                    pointerEvents: "none",
                  }} />
                  <span className="font-mono" style={{ fontSize: 9, color: "rgba(0,229,255,0.8)" }}>
                    {id.toUpperCase()}
                  </span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono" style={{ fontSize: 9, color: isDark ? "rgba(0,229,255,0.4)" : "rgba(91,33,182,0.55)" }}>PQC Verification Key:</span>
          <span className="font-mono" style={{ fontSize: 9, color: isDark ? "rgba(0,229,255,0.25)" : "rgba(91,33,182,0.32)" }}>
            [{PQC_KEY}]
          </span>
        </div>
      </div>

      {/* Right: System state + icons + clock */}
      <div className="flex items-center gap-3">
        {/* Dynamic system state badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={systemState}
            initial={{ opacity: 0, y: -8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 450, damping: 22 }}
            className="flex items-center gap-1.5 px-2.5 py-1 relative overflow-hidden"
            style={{
              borderRadius: 999,
              background: `linear-gradient(135deg,${stateCfg.color}18,${stateCfg.color}06)`,
              border: `1px solid ${stateCfg.color}40`,
              boxShadow: `0 4px 14px rgba(0,0,0,0.4),0 0 14px ${stateCfg.color}18,inset 0 1px 0 rgba(255,255,255,0.16)`,
            }}
          >
            <div style={{
              position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
              background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)",
              pointerEvents: "none",
            }} />
            <motion.div
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.35, 1] }}
              transition={{ repeat: Infinity, duration: stateCfg.pulse }}
              style={{ width: 6, height: 6, borderRadius: "50%", background: stateCfg.color,
                boxShadow: `0 0 8px ${stateCfg.color}` }}
            />
            <span className="font-mono" style={{ fontSize: 9, color: stateCfg.color }}>
              {stateCfg.label}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Chat log counter */}
        <AnimatePresence>
          {chatLog.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="flex items-center gap-1 px-2 py-0.5 relative overflow-hidden"
              style={{
                borderRadius: 999,
                background: "linear-gradient(135deg,rgba(0,229,255,0.1),rgba(0,229,255,0.02))",
                border: "1px solid rgba(0,229,255,0.2)",
                boxShadow: "0 3px 10px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              <div style={{
                position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
                background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)",
                pointerEvents: "none",
              }} />
              <span className="font-mono" style={{ fontSize: 8, color: "rgba(0,229,255,0.5)" }}>Queries:</span>
              <motion.span
                key={chatLog.length}
                initial={{ scale: 1.5, color: "#00e5ff" }}
                animate={{ scale: 1, color: "rgba(0,229,255,0.85)" }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="font-mono" style={{ fontSize: 8 }}
              >
                {chatLog.length}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.15, y: -1 }}
            whileTap={{ scaleX: 1.1, scaleY: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex items-center justify-center relative overflow-hidden"
            style={{
              width: 28, height: 28, borderRadius: 999, cursor: "pointer",
              background: isDark
                ? "linear-gradient(135deg,rgba(251,191,36,0.15),rgba(251,191,36,0.04))"
                : "linear-gradient(135deg,rgba(91,33,182,0.18),rgba(91,33,182,0.06))",
              border: isDark ? "1px solid rgba(251,191,36,0.35)" : "1px solid rgba(91,33,182,0.4)",
              boxShadow: isDark
                ? "0 4px 12px rgba(0,0,0,0.4),0 0 12px rgba(251,191,36,0.2),inset 0 1px 0 rgba(255,255,255,0.2)"
                : "0 4px 12px rgba(109,40,217,0.18),inset 0 1px 0 rgba(255,255,255,0.85)",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)", pointerEvents: "none" }} />
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div key="sun" initial={{ rotate: -45, opacity: 0, scale: 0.6 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 45, opacity: 0, scale: 0.6 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
                  <Sun style={{ width: 13, height: 13, color: "#f59e0b" }} />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 45, opacity: 0, scale: 0.6 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: -45, opacity: 0, scale: 0.6 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
                  <Moon style={{ width: 13, height: 13, color: "#7c3aed" }} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.15, y: -1 }}
            whileTap={{ scaleX: 1.1, scaleY: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="flex items-center justify-center relative overflow-hidden"
            style={{
              width: 28, height: 28, borderRadius: 999, cursor: "pointer",
              background: isDark ? "linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))" : "linear-gradient(135deg,rgba(255,255,255,0.85),rgba(238,234,255,0.6))",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(109,40,217,0.2)",
              boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.15)" : "0 4px 12px rgba(109,40,217,0.12),inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)", pointerEvents: "none" }} />
            <Wifi style={{ width: 13, height: 13, color: isDark ? "rgba(0,229,255,0.6)" : "#6d28d9" }} />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.15, y: -1 }}
            whileTap={{ scaleX: 1.1, scaleY: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            onClick={() => setApiKeyModalOpen(true)}
            className="flex items-center justify-center relative overflow-hidden"
            style={{
              width: 28, height: 28, borderRadius: 999, cursor: "pointer",
              background: isDark ? "linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))" : "linear-gradient(135deg,rgba(255,255,255,0.85),rgba(238,234,255,0.6))",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(109,40,217,0.2)",
              boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.15)" : "0 4px 12px rgba(109,40,217,0.12),inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
            title="API Key Settings"
          >
            <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)", pointerEvents: "none" }} />
            <Settings style={{ width: 13, height: 13, color: isDark ? "rgba(0,229,255,0.6)" : "#6d28d9" }} />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.15, y: -1 }}
            whileTap={{ scaleX: 1.1, scaleY: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="flex items-center justify-center relative overflow-hidden"
            style={{
              width: 28, height: 28, borderRadius: 999, cursor: "pointer",
              background: isDark ? "linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))" : "linear-gradient(135deg,rgba(255,255,255,0.85),rgba(238,234,255,0.6))",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(109,40,217,0.2)",
              boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.15)" : "0 4px 12px rgba(109,40,217,0.12),inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)", pointerEvents: "none" }} />
            <LayoutGrid style={{ width: 13, height: 13, color: isDark ? "rgba(0,229,255,0.6)" : "#6d28d9" }} />
          </motion.div>
        </div>

        {/* Clock — liquid glass card */}
        <div className="relative overflow-hidden px-3 py-1"
          style={{
            borderRadius: 12,
            background: isDark
              ? "linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))"
              : "linear-gradient(135deg,rgba(255,255,255,0.92),rgba(238,234,255,0.65))",
            border: isDark ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(109,40,217,0.22)",
            boxShadow: isDark
              ? "0 6px 20px rgba(0,0,0,0.45),inset 0 1.5px 0 rgba(255,255,255,0.14)"
              : "0 4px 16px rgba(109,40,217,0.14),inset 0 1.5px 0 rgba(255,255,255,0.95)",
            borderLeft: isDark ? "1px solid rgba(0,229,255,0.15)" : "1px solid rgba(109,40,217,0.22)",
          }}>
          <div style={{
            position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
            background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)",
            pointerEvents: "none",
          }} />
          <div className="text-right font-mono relative z-10">
            <div style={{ color: isDark ? "#00e5ff" : "#5b21b6", fontSize: 13 }}>{formattedTime}</div>
            <div style={{ color: isDark ? "rgba(0,229,255,0.4)" : "rgba(91,33,182,0.55)", fontSize: 9 }}>{formattedDate}</div>
          </div>
        </div>
      </div>
    </div>
  );
}