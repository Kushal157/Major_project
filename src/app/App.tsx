import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { TopNav } from "./components/aegis/TopNav";
import { LeftPanel } from "./components/aegis/LeftPanel";
import { KernelPanel } from "./components/aegis/KernelPanel";
import { CentralPanel } from "./components/aegis/CentralPanel";
import { RightPanel } from "./components/aegis/RightPanel";
import { KernelProvider } from "./components/aegis/KernelContext";
import { SynapseForgeWizard } from "./components/aegis/SynapseForgeWizard";
import { MixerPopup } from "./components/aegis/MixerPopup";
import { ApiKeyModal } from "./components/aegis/ApiKeyModal";
import { ThemeProvider, useTheme } from "./components/aegis/ThemeContext";

// ── Scan line ──────────────────────────────────────────────────────────────────
function ScanLine({ isDark }: { isDark: boolean }) {
  return (
    <motion.div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 1.5,
        background: isDark
          ? "linear-gradient(90deg, transparent, rgba(139,92,246,0.2), rgba(0,229,255,0.25), rgba(139,92,246,0.2), transparent)"
          : "linear-gradient(90deg, transparent, rgba(139,92,246,0.35), rgba(0,180,255,0.4), rgba(139,92,246,0.35), transparent)",
        zIndex: 9999, pointerEvents: "none",
      }}
      animate={{ y: ["0vh", "100vh"] }}
      transition={{ repeat: Infinity, duration: 9, ease: "linear", repeatDelay: 4 }}
    />
  );
}

// ── Dot grid ────────────────────────────────────────────────────────────────────
function DotGrid({ isDark }: { isDark: boolean }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      backgroundImage: `radial-gradient(${isDark ? "rgba(120,80,220,0.12)" : "rgba(109,40,217,0.11)"} 1px, transparent 1px)`,
      backgroundSize: "38px 38px",
    }} />
  );
}

// ── Aurora — two palettes depending on theme ────────────────────────────────────
function Aurora({ isDark }: { isDark: boolean }) {
  if (isDark) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <motion.div animate={{ x: [0, 50, -25, 0], y: [0, -40, 25, 0], scale: [1, 1.1, 0.93, 1] }} transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
          style={{ position: "absolute", top: "-18%", left: "-12%", width: 860, height: 860, borderRadius: "50%", background: "radial-gradient(circle at 42% 42%, rgba(139,92,246,0.55) 0%, rgba(100,60,220,0.28) 38%, transparent 70%)", filter: "blur(55px)" }} />
        <motion.div animate={{ x: [0, -40, 30, 0], y: [0, 35, -20, 0], scale: [1, 0.9, 1.08, 1] }} transition={{ repeat: Infinity, duration: 22, ease: "easeInOut", delay: 4 }}
          style={{ position: "absolute", top: "-12%", right: "-10%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle at 55% 40%, rgba(0,210,255,0.48) 0%, rgba(0,160,240,0.22) 40%, transparent 70%)", filter: "blur(60px)" }} />
        <motion.div animate={{ x: [0, 35, -45, 0], y: [0, -45, 30, 0], scale: [1, 1.08, 0.95, 1] }} transition={{ repeat: Infinity, duration: 20, ease: "easeInOut", delay: 7 }}
          style={{ position: "absolute", bottom: "-18%", right: "-8%", width: 780, height: 780, borderRadius: "50%", background: "radial-gradient(circle at 50% 55%, rgba(255,45,155,0.45) 0%, rgba(210,20,120,0.2) 40%, transparent 70%)", filter: "blur(62px)" }} />
        <motion.div animate={{ x: [0, -35, 55, 0], y: [0, 55, -30, 0], scale: [1, 1.12, 0.92, 1] }} transition={{ repeat: Infinity, duration: 26, ease: "easeInOut", delay: 10 }}
          style={{ position: "absolute", bottom: "-10%", left: "-8%", width: 620, height: 620, borderRadius: "50%", background: "radial-gradient(circle at 45% 45%, rgba(59,130,246,0.42) 0%, rgba(30,80,200,0.18) 42%, transparent 70%)", filter: "blur(58px)" }} />
        <motion.div animate={{ opacity: [0.55, 0.85, 0.55], scale: [1, 1.06, 1], y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 9, ease: "easeInOut", delay: 2 }}
          style={{ position: "absolute", bottom: "5%", left: "38%", width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle, rgba(251,191,36,0.35) 0%, rgba(240,160,0,0.12) 45%, transparent 70%)", filter: "blur(52px)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(10,4,28,0.1) 0%, rgba(4,1,14,0.6) 100%)" }} />
      </div>
    );
  }
  // Light mode — vivid amethyst aurora on cool lavender
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* Deep violet — top left anchor */}
      <motion.div
        animate={{ x: [0, 45, -22, 0], y: [0, -35, 22, 0], scale: [1, 1.09, 0.93, 1] }}
        transition={{ repeat: Infinity, duration: 22, ease: "easeInOut" }}
        style={{ position: "absolute", top: "-18%", left: "-12%", width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(139,92,246,0.7) 0%, rgba(109,40,217,0.38) 34%, transparent 68%)", filter: "blur(62px)" }}
      />
      {/* Electric cyan — top right */}
      <motion.div
        animate={{ x: [0, -38, 28, 0], y: [0, 32, -22, 0], scale: [1, 0.91, 1.11, 1] }}
        transition={{ repeat: Infinity, duration: 26, ease: "easeInOut", delay: 5 }}
        style={{ position: "absolute", top: "-14%", right: "-10%", width: 780, height: 780, borderRadius: "50%", background: "radial-gradient(circle at 55% 40%, rgba(0,229,255,0.6) 0%, rgba(0,180,240,0.30) 38%, transparent 68%)", filter: "blur(60px)" }}
      />
      {/* Hot magenta — bottom right */}
      <motion.div
        animate={{ x: [0, 32, -42, 0], y: [0, -42, 28, 0], scale: [1, 1.07, 0.94, 1] }}
        transition={{ repeat: Infinity, duration: 19, ease: "easeInOut", delay: 8 }}
        style={{ position: "absolute", bottom: "-16%", right: "-8%", width: 820, height: 820, borderRadius: "50%", background: "radial-gradient(circle at 50% 55%, rgba(219,39,119,0.62) 0%, rgba(190,24,93,0.30) 38%, transparent 68%)", filter: "blur(65px)" }}
      />
      {/* Royal indigo — bottom left */}
      <motion.div
        animate={{ x: [0, -32, 48, 0], y: [0, 48, -28, 0], scale: [1, 1.11, 0.92, 1] }}
        transition={{ repeat: Infinity, duration: 30, ease: "easeInOut", delay: 13 }}
        style={{ position: "absolute", bottom: "-12%", left: "-8%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle at 45% 45%, rgba(79,70,229,0.55) 0%, rgba(55,48,163,0.26) 42%, transparent 68%)", filter: "blur(58px)" }}
      />
      {/* Center lavender bloom */}
      <motion.div
        animate={{ opacity: [0.55, 0.82, 0.55], scale: [1, 1.07, 1] }}
        transition={{ repeat: Infinity, duration: 11, ease: "easeInOut", delay: 3 }}
        style={{ position: "absolute", top: "18%", left: "26%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.42) 0%, rgba(139,92,246,0.15) 45%, transparent 70%)", filter: "blur(58px)" }}
      />
      {/* White readability vignette in center */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 48%, rgba(255,255,255,0.42) 0%, rgba(9,15,26,0.18) 52%, transparent 100%)" }} />
    </div>
  );
}

// ── Corner decorations ──────────────────────────────────────────────────────────
function CornerDecor({ corner, isDark }: { corner: "tl" | "tr" | "bl" | "br"; isDark: boolean }) {
  const isLeft = corner.includes("l");
  const isTop  = corner.includes("t");
  const c1 = isDark ? "rgba(139,92,246,0.5)" : "rgba(139,92,246,0.6)";
  const c2 = isDark ? "rgba(0,210,255,0.45)" : "rgba(0,160,240,0.6)";
  return (
    <div style={{
      position: "fixed",
      top: isTop ? 56 : "auto", bottom: isTop ? "auto" : 6,
      left: isLeft ? 6 : "auto", right: isLeft ? "auto" : 6,
      width: 28, height: 28, zIndex: 100, pointerEvents: "none",
      borderTop:    isTop  ? `1.5px solid ${c1}` : "none",
      borderBottom: isTop  ? "none" : `1.5px solid ${c2}`,
      borderLeft:   isLeft ? `1.5px solid ${c2}` : "none",
      borderRight:  isLeft ? "none" : `1.5px solid ${c1}`,
    }} />
  );
}

// ── Status footer ───────────────────────────────────────────────────────────────
function StatusFooter({ isDark }: { isDark: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 110);
    return () => clearInterval(i);
  }, []);
  const bar = "▓".repeat((tick % 30) + 1) + "░".repeat(30 - (tick % 30));

  return (
    <div className="flex items-center justify-between px-5 py-1.5 shrink-0"
      style={{
        background: isDark ? "rgba(12,6,30,0.92)" : "rgba(9,15,26,0.96)",
        borderTop: isDark ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(109,40,217,0.22)",
        boxShadow: isDark ? "0 -6px 32px rgba(80,0,160,0.12)" : "0 -6px 32px rgba(109,40,217,0.1)",
        backdropFilter: "blur(32px)",
        zIndex: 50,
      }}>
      <div className="flex items-center gap-2">
        {[
          { label: "CPU",  val: "23%",      color: "#0ea5e9" },
          { label: "MEM",  val: "8.4 GB",   color: "#8b5cf6" },
          { label: "NET",  val: "1.2 GB/s", color: "#10b981" },
          { label: "ENC",  val: "AES+PQC",  color: "#ec4899" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 px-2.5 py-0.5 relative overflow-hidden"
            style={{
              borderRadius: 999,
              background: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.75)",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(109,40,217,0.2)",
              boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.16)" : "0 2px 8px rgba(109,40,217,0.12),inset 0 1px 0 rgba(255,255,255,0.9)",
            }}>
            <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)", pointerEvents: "none" }} />
            <span className="font-mono" style={{ fontSize: 8, color: isDark ? "rgba(200,180,255,0.55)" : "rgba(91,33,182,0.65)" }}>{s.label}:</span>
            <span className="font-mono" style={{ fontSize: 8, color: s.color }}>{s.val}</span>
          </div>
        ))}
      </div>
      <div className="font-mono" style={{ fontSize: 7.5, color: isDark ? "rgba(139,92,246,0.3)" : "rgba(109,40,217,0.35)" }}>{bar}</div>
      <div className="font-mono px-2.5 py-0.5 relative overflow-hidden"
        style={{
          fontSize: 8, color: isDark ? "rgba(200,180,255,0.5)" : "rgba(91,33,182,0.7)", borderRadius: 999,
          background: isDark ? "rgba(139,92,246,0.1)" : "rgba(109,40,217,0.08)",
          border: isDark ? "1px solid rgba(139,92,246,0.28)" : "1px solid rgba(109,40,217,0.22)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
        }}>
        Aegis-Prime v4.2.1 &nbsp;|&nbsp; Build: 20260409
      </div>
    </div>
  );
}

// ── Boot screen ────────────────────────────────────────────────────────────────
function BootScreen({ onDone }: { onDone: () => void }) {
  const [bootLines, setBootLines] = useState<string[]>([]);
  const bootSequence = [
    "Initializing Aegis-Prime OS kernel...",
    "Loading PQC cryptographic modules... [OK]",
    "Mounting secure enclave... [OK]",
    "Starting Hardware Security Module... [OK]",
    "Establishing ZK-Auth handshake... [OK]",
    "Connecting to Zenith-Mesh Ledger... [OK]",
    "Loading model orchestration layer... [OK]",
    "Starting Cypher-Shield lattice monitor... [OK]",
    "Initializing Synapse Fusion Engine... [OK]",
    "All systems nominal. Launching workstation...",
  ];

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      if (i < bootSequence.length) { setBootLines((p) => [...p, bootSequence[i]]); i++; }
      else { clearInterval(t); setTimeout(onDone, 600); }
    }, 210);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "monospace", background: "#06030F", position: "relative", overflow: "hidden" }}>
      <Aurora isDark={true} />
      <DotGrid isDark={true} />
      <motion.div initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 22 }} className="relative"
        style={{ maxWidth: 500, width: "100%", padding: "36px 40px", borderRadius: 22, background: "rgba(10,4,28,0.82)", border: "1px solid rgba(139,92,246,0.35)", boxShadow: "0 40px 90px rgba(80,0,160,0.25), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1.5px 0 rgba(255,255,255,0.18)", backdropFilter: "blur(36px)", zIndex: 10 }}>
        <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: 1.5, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.65),transparent)", borderRadius: 999, pointerEvents: "none" }} />
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <motion.div animate={{ opacity: [0.75, 1, 0.75] }} transition={{ repeat: Infinity, duration: 2.5 }}
            style={{ fontSize: 26, color: "#00e5ff", letterSpacing: "0.22em", marginBottom: 4, textShadow: "0 0 30px rgba(0,229,255,0.6), 0 0 60px rgba(0,229,255,0.25)" }}>
            AEGIS-PRIME
          </motion.div>
          <div style={{ fontSize: 9.5, color: "rgba(180,150,255,0.6)", letterSpacing: "0.28em" }}>SYNAPSE-OS WORKSTATION v4.2.1</div>
          <div style={{ marginTop: 16, height: 1, background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.7), rgba(0,229,255,0.6), transparent)" }} />
        </div>
        <div style={{ minHeight: 200 }}>
          {bootLines.map((line, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
              style={{ fontSize: 10.5, marginBottom: 6, paddingLeft: 8, color: i === bootLines.length - 1 ? "#00e5ff" : "rgba(200,180,255,0.55)" }}>
              {i === bootLines.length - 1 && (
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.5 }} style={{ marginRight: 8, color: "#00e5ff" }}>▶</motion.span>
              )}
              {line}
            </motion.div>
          ))}
        </div>
        <div style={{ marginTop: 16, height: 3, background: "rgba(139,92,246,0.18)", borderRadius: 2, overflow: "hidden" }}>
          <motion.div style={{ height: "100%", background: "linear-gradient(90deg, #00e5ff, #8b5cf6, #ff2d9b)", borderRadius: 2 }}
            animate={{ width: `${(bootLines.length / bootSequence.length) * 100}%` }} transition={{ duration: 0.2 }} />
        </div>
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 8.5, color: "rgba(139,92,246,0.45)", letterSpacing: "0.15em" }}>
          PQC-FIPS 140-3 CERTIFIED &nbsp;|&nbsp; ZK-AUTH ENABLED
        </div>
      </motion.div>
    </div>
  );
}

// ── AppContent reads theme and renders accordingly ──────────────────────────────
function AppContent() {
  const { isDark } = useTheme();
  const [booting, setBooting] = useState(true);

  const bg = isDark ? "#06030F" : "#090f1a";

  useEffect(() => {
    document.body.style.backgroundColor = bg;
    document.body.style.transition = "background-color 0.7s ease";
  }, [bg]);

  if (booting) return <BootScreen onDone={() => setBooting(false)} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, ease: "easeOut" }}
      style={{ width: "100vw", height: "100vh", background: bg, display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'JetBrains Mono', 'Share Tech Mono', 'Courier New', Courier, monospace", position: "relative", transition: "background 0.7s ease" }}>
      <Aurora isDark={isDark} />
      <DotGrid isDark={isDark} />
      <ScanLine isDark={isDark} />
      <CornerDecor corner="tl" isDark={isDark} />
      <CornerDecor corner="tr" isDark={isDark} />
      <CornerDecor corner="bl" isDark={isDark} />
      <CornerDecor corner="br" isDark={isDark} />
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", height: "100vh" }}>
        <KernelProvider>
          <TopNav />
          <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
            <LeftPanel />
            <KernelPanel />
            <CentralPanel />
            <RightPanel />
          </div>
          <StatusFooter isDark={isDark} />
          <SynapseForgeWizard />
          <MixerPopup />
          <ApiKeyModal />
        </KernelProvider>
      </div>
    </motion.div>
  );
}

// ── Root App ───────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}