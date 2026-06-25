import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "motion/react";
import { CheckCircle, Lock, Cpu, Activity, AlertTriangle, ShieldAlert } from "lucide-react";
import { useKernel } from "./KernelContext";
import { useTheme } from "./ThemeContext";

// ─── ISO block geometry ───────────────────────────────────────────────────────
const W = 22, H = 11, D = 14;
function isoPoints(cx: number, cy: number) {
  const top   = [[0,-H],[W,0],[0,H],[-W,0]].map(([x,y]) => `${cx+x},${cy+y}`).join(" ");
  const right  = [[W,0],[W,D],[0,H+D],[0,H]].map(([x,y]) => `${cx+x},${cy+y}`).join(" ");
  const left   = [[-W,0],[-W,D],[0,H+D],[0,H]].map(([x,y]) => `${cx+x},${cy+y}`).join(" ");
  return { top, right, left };
}

// sandbox block definitions — grow toward the camera (back to front)
const BLOCKS_DEF = [
  { label: "CORE", cx: 100, cy: 55, color: "rgba(0,229,255,0.55)", border: "rgba(0,229,255,0.8)", tier: "kernel" },
  { label: "IPC",  cx: 68,  cy: 72, color: "rgba(139,92,246,0.5)", border: "rgba(139,92,246,0.9)", tier: "ipc" },
  { label: "SCH",  cx: 132, cy: 72, color: "rgba(0,229,255,0.35)", border: "rgba(0,229,255,0.7)", tier: "scheduler" },
  { label: "FD4",  cx: 84,  cy: 92, color: "rgba(0,229,255,0.28)", border: "rgba(0,229,255,0.55)", tier: "sandbox" },
  { label: "AC1",  cx: 116, cy: 92, color: "rgba(139,92,246,0.32)", border: "rgba(139,92,246,0.6)", tier: "sandbox" },
  { label: "B07",  cx: 100, cy: 110, color: "rgba(0,229,255,0.2)",  border: "rgba(0,229,255,0.45)", tier: "sandbox" },
  { label: "E33",  cx: 68,  cy: 112, color: "rgba(255,45,155,0.22)", border: "rgba(255,45,155,0.5)", tier: "process" },
  { label: "K09",  cx: 132, cy: 112, color: "rgba(0,229,255,0.18)", border: "rgba(0,229,255,0.4)", tier: "process" },
  { label: "P12",  cx: 84,  cy: 130, color: "rgba(0,229,255,0.15)", border: "rgba(0,229,255,0.35)", tier: "process" },
];

const TUNNEL_LINES = [
  { x1: 100, y1: 66, x2: 68, y2: 83, color: "rgba(0,229,255,0.4)" },
  { x1: 100, y1: 66, x2: 132, y2: 83, color: "rgba(139,92,246,0.45)" },
  { x1: 68,  y1: 83, x2: 84, y2: 103, color: "rgba(0,229,255,0.3)" },
  { x1: 132, y1: 83, x2: 116, y2: 103, color: "rgba(0,229,255,0.3)" },
  { x1: 84,  y1: 103, x2: 100, y2: 121, color: "rgba(0,229,255,0.25)" },
  { x1: 116, y1: 103, x2: 100, y2: 121, color: "rgba(0,229,255,0.25)" },
];

const generateHash = () => {
  const chars = "0123456789abcdef";
  return "0x" + Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)]).join("") + "...f@lk933taao";
};

const TAMPER_MSGS = [
  "[HSM] ⚠ ANOMALOUS SIGNAL DETECTED — entropy spike",
  "[HSM] ⚠ MOUSE VELOCITY THRESHOLD EXCEEDED",
  "[HSM] ⚠ BEHAVIOURAL FINGERPRINT MISMATCH",
  "[HSM] ⚠ BUS TIMING ANOMALY DETECTED",
  "[HSM] ⚠ SIDE-CHANNEL PROBE ATTEMPT",
  "[HSM] ⚠ LATENCY JITTER OUT OF BOUNDS",
];

const SAFE_PREFIXES = ["[SYS]", "[HSM]", "[KERN]", "[CRYPT]", "[AUTH]"];
const SAFE_OPS = ["entropy_ok", "key_verified", "hmac_pass", "sig_valid", "nonce_fresh"];
const generateSafeLog = () => {
  const p = SAFE_PREFIXES[Math.floor(Math.random() * SAFE_PREFIXES.length)];
  const h = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  const op = SAFE_OPS[Math.floor(Math.random() * SAFE_OPS.length)];
  return `${p} 0x${h} :: ${op} :: ts:${Date.now()}`;
};

// ─── Iso Block Component ───────────────────────────────────────────────────────
function IsoBlock({ cx, cy, label, color, border, visible, delay }: {
  cx: number; cy: number; label: string; color: string; border: string;
  visible: boolean; delay: number;
}) {
  const pts = isoPoints(cx, cy);
  return (
    <AnimatePresence>
      {visible && (
        <motion.g
          initial={{ opacity: 0, y: -18, scaleY: 0.4 }}
          animate={{ opacity: 1, y: 0, scaleY: 1 }}
          exit={{ opacity: 0, y: 18 }}
          transition={{ type: "spring", stiffness: 420, damping: 18, delay }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <polygon points={pts.left}  fill="rgba(0,5,20,0.65)" stroke={border} strokeWidth="0.5" />
          <polygon points={pts.right} fill="rgba(0,5,20,0.45)" stroke={border} strokeWidth="0.5" />
          <polygon points={pts.top}   fill={color} stroke={border} strokeWidth="0.9" />
          {/* Specular shimmer on top face */}
          <ellipse cx={cx} cy={cy - H * 0.3} rx={W * 0.5} ry={H * 0.3} fill="rgba(255,255,255,0.12)" style={{ pointerEvents: "none" }} />
          <text x={cx} y={cy - H / 2 + 3} textAnchor="middle" fontFamily="monospace" fontSize="6.5" fill="rgba(255,255,255,0.9)">{label}</text>
        </motion.g>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function KernelPanel() {
  const { queryTick, tamperAlert, setTamperAlert } = useKernel();
  const { isDark } = useTheme();

  // ── Build animation ─────────────────────────────────────────────────────────
  const [visibleCount, setVisibleCount] = useState(BLOCKS_DEF.length); // start full
  const [buildKey, setBuildKey] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);

  useEffect(() => {
    if (queryTick === 0) return;
    setVisibleCount(0);
    setIsBuilding(true);
    setBuildKey((k) => k + 1);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= BLOCKS_DEF.length) {
        clearInterval(interval);
        setTimeout(() => setIsBuilding(false), 400);
      }
    }, 130);
    return () => clearInterval(interval);
  }, [queryTick]);

  // ── HSM tamper detection ─────────────────────────────────────────────────────
  const lastPos = useRef({ x: 0, y: 0, t: 0 });
  const velocityHistory = useRef<number[]>([]);
  const [logs, setLogs] = useState<{ text: string; isAlert: boolean }[]>(() =>
    Array.from({ length: 4 }, () => ({ text: generateSafeLog(), isAlert: false }))
  );
  const [rotKey, setRotKey] = useState(generateHash());
  const [tamperCount, setTamperCount] = useState(0);

  const pushLog = useCallback((text: string, isAlert: boolean) => {
    setLogs((prev) => [{ text, isAlert }, ...prev.slice(0, 10)]);
  }, []);

  // Mouse velocity monitoring
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const dt = Math.max(1, now - lastPos.current.t);
      const velocity = Math.sqrt(dx * dx + dy * dy) / dt;
      lastPos.current = { x: e.clientX, y: e.clientY, t: now };
      velocityHistory.current = [...velocityHistory.current.slice(-8), velocity];
      const avg = velocityHistory.current.reduce((a, b) => a + b, 0) / velocityHistory.current.length;
      if (avg > 3.5 && velocityHistory.current.length >= 6) {
        const msg = TAMPER_MSGS[Math.floor(Math.random() * TAMPER_MSGS.length)];
        setTamperAlert(true);
        setTamperCount((c) => c + 1);
        pushLog(msg, true);
        // Auto-clear after 3s of no tamper
        setTimeout(() => {
          velocityHistory.current = [];
          setTamperAlert(false);
        }, 3000);
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [pushLog, setTamperAlert]);

  // DevTools detection
  useEffect(() => {
    const check = () => {
      if (window.outerWidth - window.innerWidth > 120 || window.outerHeight - window.innerHeight > 120) {
        setTamperAlert(true);
        pushLog("[HSM] ⚠ DEVTOOLS SIDE-CHANNEL DETECTED — forensic probe?", true);
      }
    };
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [pushLog, setTamperAlert]);

  // Page blur = suspicious
  useEffect(() => {
    const onBlur = () => {
      pushLog("[HSM] VISIBILITY CHANGE — user left workstation context", false);
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [pushLog]);

  // Routine log ticking
  useEffect(() => {
    const interval = setInterval(() => {
      if (!tamperAlert) {
        pushLog(generateSafeLog(), false);
        if (Math.random() > 0.7) setRotKey(generateHash());
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [tamperAlert, pushLog]);

  const healthParams = [
    { label: "CPU Temp",      value: tamperAlert ? "ALERT" : "42°C",    ok: !tamperAlert },
    { label: "DRAM Integrity", value: tamperAlert ? "PROBING" : "100%",  ok: !tamperAlert },
    { label: "Secure Enclave", value: tamperAlert ? "BREACH?" : "LOCKED", ok: !tamperAlert },
    { label: "Bus Encryption", value: tamperAlert ? "SUSPECT" : "AES-256", ok: !tamperAlert },
    { label: "TPM Status",    value: tamperAlert ? "ALERT" : "ACTIVE",  ok: !tamperAlert },
  ];

  return (
    <div
      className="flex flex-col gap-2 p-2.5 overflow-y-auto shrink-0"
      style={{
        width: 220, minWidth: 220,
        background: isDark ? "rgba(10,4,26,0.86)" : "rgba(9,15,26,0.93)",
        borderRight: isDark ? "1px solid rgba(139,92,246,0.25)" : "1px solid rgba(109,40,217,0.2)",
        backdropFilter: "blur(40px)",
        boxShadow: isDark ? "4px 0 32px rgba(60,0,140,0.1)" : "4px 0 22px rgba(109,40,217,0.1)",
      }}
    >
      {/* ── Microkernel & Sandbox Map ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        className="lg-panel p-2.5"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1.5 relative z-10">
          <div className="flex items-center gap-1.5">
            <Cpu style={{ width: 10, height: 10, color: isDark ? "#00e5ff" : "#5b21b6" }} />
            <span className="font-mono uppercase tracking-widest" style={{ fontSize: 8.5, color: isDark ? "#00e5ff" : "#5b21b6" }}>
              Microkernel & Sandbox Map
            </span>
          </div>
          {isBuilding && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}
            >
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#f59e0b" }} />
              <span className="font-mono" style={{ fontSize: 7, color: "#f59e0b" }}>BUILDING</span>
            </motion.div>
          )}
        </div>

        {/* Build progress bar */}
        {isBuilding && (
          <div style={{ height: 2, background: "rgba(0,229,255,0.1)", borderRadius: 2, overflow: "hidden", marginBottom: 4 }}>
            <motion.div
              style={{ height: "100%", background: "linear-gradient(90deg,#00e5ff,#8b5cf6,#ff2d9b)", borderRadius: 2 }}
              animate={{ width: `${(visibleCount / BLOCKS_DEF.length) * 100}%` }}
              transition={{ duration: 0.12 }}
            />
          </div>
        )}

        {/* Isometric SVG */}
        <svg width="100%" height="158" viewBox="30 38 165 115" style={{ overflow: "visible" }} key={buildKey}>
          {/* Background grid */}
          {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
            <g key={i}>
              <line x1={100 + i * 28} y1={38} x2={100 + i * 28 - 50} y2={38 + 50} stroke="rgba(0,229,255,0.04)" strokeWidth="0.5" />
              <line x1={100 + i * 28} y1={38} x2={100 + i * 28 + 50} y2={38 + 50} stroke="rgba(0,229,255,0.04)" strokeWidth="0.5" />
            </g>
          ))}

          {/* Tunnel connections */}
          {TUNNEL_LINES.map((line, i) => (
            visibleCount >= i + 2 && (
              <motion.line
                key={i}
                x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                stroke={line.color} strokeWidth="0.9" strokeDasharray="3,2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              />
            )
          ))}

          {/* Isometric blocks */}
          {BLOCKS_DEF.map((b, i) => (
            <IsoBlock
              key={b.label}
              cx={b.cx} cy={b.cy}
              label={b.label}
              color={b.color} border={b.border}
              visible={visibleCount > i}
              delay={0}
            />
          ))}

          {/* Scanning pulse on CORE block */}
          {visibleCount > 0 && (
            <motion.circle
              cx={100} cy={55} r={5}
              fill="none" stroke="rgba(0,229,255,0.7)" strokeWidth="1"
              animate={{ r: [5, 22], opacity: [0.9, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut", repeatDelay: 0.5 }}
            />
          )}
        </svg>

        {/* Status row */}
        <div className="flex items-center gap-1.5 relative z-10">
          <CheckCircle style={{ width: 9, height: 9, color: "#00ff64" }} />
          <span className="font-mono" style={{ fontSize: 8, color: isDark ? "rgba(0,229,255,0.7)" : "rgba(91,33,182,0.75)" }}>
            Kernel Isolation: <span style={{ color: "#00ff64" }}>100%</span>
            {" "}| Sandboxes: <span style={{ color: isDark ? "#00e5ff" : "#5b21b6" }}>{visibleCount < BLOCKS_DEF.length ? visibleCount : 6}</span> active
          </span>
        </div>
        {isBuilding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono mt-0.5 relative z-10"
            style={{ fontSize: 7.5, color: "rgba(251,191,36,0.6)" }}
          >
            ▶ Spawning sandbox block {visibleCount}/{BLOCKS_DEF.length}...
          </motion.div>
        )}
      </motion.div>

      {/* ── Hardware Security Module ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.08 }}
        className="lg-panel p-2.5 flex-1 relative overflow-hidden"
      >
        {/* Tamper blink overlay */}
        <AnimatePresence>
          {tamperAlert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.18, 0, 0.18, 0, 0.14] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{
                position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
                background: "rgba(255,30,30,0.15)",
                border: "1px solid rgba(255,30,30,0.5)",
                borderRadius: "inherit",
              }}
            />
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-1.5">
            {tamperAlert
              ? <ShieldAlert style={{ width: 10, height: 10, color: "#ff2d2d" }} />
              : <Lock style={{ width: 10, height: 10, color: "#ff2d9b" }} />
            }
            <span className="font-mono uppercase tracking-widest" style={{ fontSize: 8.5, color: tamperAlert ? "#ff4444" : "#00e5ff" }}>
              Hardware Security Module
            </span>
          </div>
          <AnimatePresence mode="wait">
            {tamperAlert ? (
              <motion.div
                key="tamper"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(255,30,30,0.15)", border: "1px solid rgba(255,30,30,0.5)" }}
              >
                <AlertTriangle style={{ width: 8, height: 8, color: "#ff4444" }} />
                <span className="font-mono" style={{ fontSize: 7, color: "#ff4444" }}>TAMPER</span>
              </motion.div>
            ) : (
              <motion.div
                key="ok"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(0,255,100,0.08)", border: "1px solid rgba(0,255,100,0.25)" }}
              >
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#00ff64", boxShadow: "0 0 6px #00ff64" }} />
                <span className="font-mono" style={{ fontSize: 7, color: "#00ff64" }}>ALL OK</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tamper count if any */}
        {tamperCount > 0 && (
          <div className="flex items-center gap-1.5 mb-1.5 px-1.5 py-1 rounded relative z-10"
            style={{ background: "rgba(255,30,30,0.06)", border: "1px solid rgba(255,30,30,0.2)" }}>
            <AlertTriangle style={{ width: 8, height: 8, color: "#ff6060", flexShrink: 0 }} />
            <span className="font-mono" style={{ fontSize: 7.5, color: "rgba(255,90,90,0.8)" }}>
              {tamperCount} tamper event{tamperCount > 1 ? "s" : ""} detected this session
            </span>
          </div>
        )}

        {/* Live log */}
        <div className="mb-2 relative z-10">
          <div className="font-mono mb-1" style={{ fontSize: 7.5, color: tamperAlert ? "rgba(255,100,100,0.7)" : isDark ? "rgba(0,229,255,0.5)" : "rgba(91,33,182,0.65)" }}>
            Live tamper-detection log:
          </div>
          <div className="rounded overflow-hidden" style={{
            background: tamperAlert
              ? "rgba(30,0,0,0.5)"
              : isDark ? "rgba(0,0,0,0.4)" : "rgba(9,15,26,0.85)",
            border: tamperAlert
              ? "1px solid rgba(255,30,30,0.25)"
              : isDark ? "1px solid rgba(0,229,255,0.08)" : "1px solid rgba(109,40,217,0.14)",
            height: 80, overflow: "hidden",
            transition: "all 0.3s ease",
          }}>
            <AnimatePresence initial={false}>
              {logs.slice(0, 6).map((log, i) => (
                <motion.div
                  key={log.text + i}
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1 - i * 0.1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-mono px-1.5 py-0.5 truncate"
                  style={{
                    fontSize: 7,
                    color: log.isAlert
                      ? (i === 0 ? "#ff6060" : `rgba(255,80,80,${0.55 - i * 0.06})`)
                      : isDark
                      ? (i === 0 ? "rgba(0,229,255,0.9)" : `rgba(0,229,255,${0.4 - i * 0.04})`)
                      : (i === 0 ? "rgba(20,10,50,0.85)" : `rgba(20,10,50,${0.5 - i * 0.05})`),
                    borderBottom: i === 0 ? `1px solid ${log.isAlert ? "rgba(255,50,50,0.15)" : isDark ? "rgba(0,229,255,0.06)" : "rgba(139,92,246,0.08)"}` : "none",
                  }}
                >
                  {i === 0 && <span style={{ color: log.isAlert ? "#ff4444" : "#ff2d9b", marginRight: 4 }}>▶</span>}
                  {log.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Key rotation */}
        <div className="mb-2 relative z-10">
          <div className="flex items-center gap-1 mb-1">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} style={{ width: 8, height: 8 }}>
              <svg viewBox="0 0 16 16" fill="none"><path d="M14 8A6 6 0 1 1 8 2" stroke="#ff2d9b" strokeWidth="2" strokeLinecap="round" /><path d="M14 2v6h-6" stroke="#ff2d9b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </motion.div>
            <span className="font-mono" style={{ fontSize: 7.5, color: "rgba(255,45,155,0.8)" }}>Key rotation: active</span>
          </div>
          <div className="font-mono truncate" style={{ fontSize: 7, color: isDark ? "rgba(0,229,255,0.35)" : "rgba(91,33,182,0.45)" }}>[{rotKey}]</div>
        </div>

        {/* Hardware health */}
        <div className="relative z-10">
          <div className="flex items-center gap-1 mb-1.5">
            <Activity style={{ width: 9, height: 9, color: tamperAlert ? "#ff4444" : "#00ff64" }} />
            <span className="font-mono" style={{ fontSize: 7.5, color: tamperAlert ? "#ff4444" : "#00ff64" }}>
              {tamperAlert ? "HARDWARE SECURITY BREACH DETECTED" : "Hardware health: 100% secure"}
            </span>
          </div>
          {healthParams.map((p) => (
            <motion.div
              key={p.label}
              animate={tamperAlert ? { x: [-1, 1, -1, 1, 0] } : { x: 0 }}
              transition={tamperAlert ? { duration: 0.3, repeat: Infinity } : {}}
              className="flex items-center justify-between py-0.5 px-1.5 rounded mb-0.5"
              style={{
                background: tamperAlert
                  ? "rgba(255,30,30,0.06)"
                  : isDark ? "rgba(255,255,255,0.02)" : "rgba(9,15,26,0.7)",
                border: `1px solid ${tamperAlert ? "rgba(255,50,50,0.15)" : isDark ? "rgba(0,229,255,0.06)" : "rgba(109,40,217,0.12)"}`,
                transition: "all 0.3s ease",
              }}
            >
              <span className="font-mono" style={{ fontSize: 7, color: tamperAlert ? "rgba(255,120,120,0.6)" : isDark ? "rgba(0,229,255,0.45)" : "rgba(91,33,182,0.65)" }}>{p.label}</span>
              <motion.span
                animate={tamperAlert && !p.ok ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
                transition={tamperAlert ? { repeat: Infinity, duration: 0.5 } : {}}
                className="font-mono"
                style={{ fontSize: 7, color: p.ok ? "#00ff64" : "#ff4444" }}
              >{p.value}</motion.span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}