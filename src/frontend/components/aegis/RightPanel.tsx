import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";
import { Activity, Link2, BarChart2, History, Clock, ChevronRight, Trash2, ShieldCheck, LogIn } from "lucide-react";
import { useKernel } from "./KernelContext";
import { useTheme } from "./ThemeContext";

// ─── Wave data generators ──────────────────────────────────────────────────────
const generateWavePoint = (i: number, t: number, boost = 1) => ({
  x: i,
  enc:     Math.min(100, Math.max(0, 72 + Math.sin((i + t) * 0.35) * 18 * boost + Math.sin((i + t) * 0.8) * 6)),
  entropy: Math.min(100, Math.max(0, 60 + Math.cos((i + t) * 0.25) * 22 * boost + Math.cos((i + t) * 0.6) * 8)),
  shield:  Math.min(100, Math.max(0, 85 + Math.sin((i + t) * 0.5 + 1.5) * 10 * boost + Math.cos((i + t) * 0.4) * 5)),
});

const makeHash = (len = 20) => {
  const chars = "0123456789abcdef";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};
const generateHash = () => `0x${makeHash(20)}...f@lk933taao`;

// ─── Session-aware security log ��───────────────────────────────────────────────
const SESSION_ID = `SID-${makeHash(8).toUpperCase()}`;

type LogEntry = { text: string; tag: string; color: string; ts: number };

const mkLog = (tag: string, text: string, color = "#00e5ff"): LogEntry =>
  ({ tag, text, color, ts: Date.now() });

const SESSION_INIT_EVENTS: LogEntry[] = [
  mkLog("AUTH",  `Session opened :: ${SESSION_ID}`,              "#00ff64"),
  mkLog("ZK",    "ZK-Auth handshake complete :: proof_valid",     "#00e5ff"),
  mkLog("PQC",   "Tunnel established :: CRYSTALS-Kyber-1024",     "#8b5cf6"),
  mkLog("HSM",   "Hardware enclave sealed :: TPM 2.0 active",     "#ff2d9b"),
  mkLog("KERN",  "Sandbox isolation verified :: KASLR on",        "#00e5ff"),
];

function buildQueryEvents(query: string, modelId: string, isMixed: boolean): LogEntry[] {
  const qHash = `0x${makeHash(12)}`;
  const chars = query.length;
  const tok = Math.floor(chars * 1.3 + Math.random() * 40);
  const model = isMixed ? "FUSION" : modelId.toUpperCase();
  return [
    mkLog("QUERY",  `Prompt received :: ${qHash} :: chars:${chars}`,         "#00e5ff"),
    mkLog("AUTH",   `Session ${SESSION_ID.slice(0, 12)} :: query_auth_ok`,   "#00ff64"),
    mkLog("MODEL",  `${model} :: sandbox_spawn :: tokens_est:${tok}`,        "#8b5cf6"),
    mkLog("KERN",   `IPC channel open :: model↔kernel :: aes256_enc`,         "#00e5ff"),
    mkLog("STREAM", `Response streaming :: pqc_tunnel :: active`,             "#00e5ff"),
    mkLog("HMAC",   `Output integrity :: hmac_sha512 :: pass`,               "#00ff64"),
    mkLog("AUTH",   `Query cycle complete :: entropy_ok :: keys_fresh`,       "#00ff64"),
  ];
}

const IDLE_MSGS: [string, string, string][] = [
  ["KERN",  "Idle watchdog :: all sandboxes nominal",                "#00e5ff"],
  ["HSM",   "Key rotation check :: in_window :: ok",                 "#00e5ff"],
  ["PQC",   "Tunnel keepalive :: latency 2ms :: ok",                 "#8b5cf6"],
  ["AUTH",  `Session ${SESSION_ID.slice(0, 12)} :: alive`,           "#00ff64"],
  ["ZK",    "Zero-knowledge proof refresh :: valid",                 "#8b5cf6"],
  ["CRYPT", "AES-256-GCM nonce fresh :: rotation_pending",           "#00e5ff"],
];
const idleHeartbeat = (): LogEntry => {
  const [tag, text, color] = IDLE_MSGS[Math.floor(Math.random() * IDLE_MSGS.length)];
  return mkLog(tag, text, color);
};

// ─── Spider Web ────────────────────────────────────────────────────────────────
const CX = 90, CY = 80, R1 = 38, R2 = 68, R1_N = 5, R2_N = 7;
const ring1 = Array.from({ length: R1_N }, (_, i) => {
  const a = (i * 2 * Math.PI / R1_N) - Math.PI / 2;
  return { x: CX + R1 * Math.cos(a), y: CY + R1 * Math.sin(a), id: `r1_${i}`,
    label: ["Query\nParse","Context\nMap","Logic\nChain","Ref\nBank","Syntax\nTree"][i], color: "#8b5cf6" };
});
const ring2 = Array.from({ length: R2_N }, (_, i) => {
  const a = (i * 2 * Math.PI / R2_N) - Math.PI / 2;
  return { x: CX + R2 * Math.cos(a), y: CY + R2 * Math.sin(a), id: `r2_${i}`,
    label: ["Fact\nCheck","Semantic\nLink","Temporal\nCtx","Output\nSynth","Bias\nFilter","Recall\nNet","Conf\nScore"][i], color: "#06b6d4" };
});
const CENTER_NODE = { x: CX, y: CY, id: "center", label: "Core\nReason", color: "#00e5ff" };

type WebEl = { type: "node"|"edge"; key: string; x1?: number; y1?: number; x2?: number; y2?: number; node?: typeof CENTER_NODE; color: string };
const WEB_ELEMENTS: WebEl[] = [];
WEB_ELEMENTS.push({ type: "node", key: "center", node: CENTER_NODE, color: CENTER_NODE.color });
ring1.forEach((n, i) => {
  WEB_ELEMENTS.push({ type: "edge", key: `c_r1_${i}`, x1: CX, y1: CY, x2: n.x, y2: n.y, color: "#8b5cf6" });
  WEB_ELEMENTS.push({ type: "node", key: n.id, node: n, color: n.color });
});
ring1.forEach((n, i) => {
  const next = ring1[(i + 1) % R1_N];
  WEB_ELEMENTS.push({ type: "edge", key: `r1_pen_${i}`, x1: n.x, y1: n.y, x2: next.x, y2: next.y, color: "rgba(139,92,246,0.5)" });
});
ring2.forEach((n, i) => {
  let nearest = ring1[0]; let minDist = Infinity;
  ring1.forEach(r => { const d = Math.hypot(n.x - r.x, n.y - r.y); if (d < minDist) { minDist = d; nearest = r; } });
  WEB_ELEMENTS.push({ type: "edge", key: `r1_r2_${i}`, x1: nearest.x, y1: nearest.y, x2: n.x, y2: n.y, color: "rgba(6,182,212,0.55)" });
  WEB_ELEMENTS.push({ type: "node", key: n.id, node: n, color: n.color });
});
ring2.forEach((n, i) => {
  const next = ring2[(i + 1) % R2_N];
  WEB_ELEMENTS.push({ type: "edge", key: `r2_hex_${i}`, x1: n.x, y1: n.y, x2: next.x, y2: next.y, color: "rgba(6,182,212,0.3)" });
});
[[0,2],[1,3],[2,4],[3,5],[4,6],[5,0],[6,1]].forEach(([a, b], i) => {
  WEB_ELEMENTS.push({ type: "edge", key: `cross_${i}`, x1: ring2[a].x, y1: ring2[a].y, x2: ring2[b].x, y2: ring2[b].y, color: "rgba(139,92,246,0.15)" });
});

function SpiderWeb({ queryTick, isActive }: { queryTick: number; isActive: boolean }) {
  const [visibleCount, setVisibleCount] = useState(WEB_ELEMENTS.length);
  useEffect(() => {
    if (queryTick === 0) return;
    setVisibleCount(0);
    let count = 0;
    const iv = setInterval(() => { count++; setVisibleCount(count); if (count >= WEB_ELEMENTS.length) clearInterval(iv); }, 55);
    return () => clearInterval(iv);
  }, [queryTick]);
  const visibleNodes = useMemo(() => WEB_ELEMENTS.slice(0, visibleCount).filter(e => e.type === "node"), [visibleCount]);
  const visibleEdges = useMemo(() => WEB_ELEMENTS.slice(0, visibleCount).filter(e => e.type === "edge"), [visibleCount]);
  return (
    <svg width="100%" height="162" viewBox="8 8 165 158" style={{ overflow: "visible" }}>
      {visibleEdges.map((e, i) => (
        <motion.line key={e.key} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
          stroke={isActive ? e.color.replace(/[\d.]+\)$/, m => `${Math.min(1, parseFloat(m)*1.8)})`) : e.color}
          strokeWidth={isActive && e.color.includes("8b5cf6") ? 1.2 : 0.8}
          strokeDasharray={e.key.startsWith("cross") ? "2,3" : "none"}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, delay: i * 0.01 }}
          style={{ filter: isActive && !e.key.startsWith("cross") ? `drop-shadow(0 0 2px ${e.color})` : "none" }} />
      ))}
      {visibleNodes.map(e => {
        const n = e.node!; const isCtr = n.id === "center";
        const r = isCtr ? 9 : n.id.startsWith("r1") ? 7 : 6;
        return (
          <motion.g key={e.key} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 520, damping: 18 }} style={{ transformOrigin: `${n.x}px ${n.y}px` }}>
            {isActive && (
              <motion.circle cx={n.x} cy={n.y} r={r+2} fill="none" stroke={n.color} strokeWidth="1"
                animate={{ r: [r+2, r+10], opacity: [0.7, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: n.id==="center" ? 0 : parseInt(n.id.split("_")[1]??"")*0.2 }} />
            )}
            <circle cx={n.x} cy={n.y} r={r} fill={`${n.color}20`} stroke={n.color} strokeWidth={isActive ? 1.2 : 0.8}
              style={{ filter: isActive ? `drop-shadow(0 0 6px ${n.color})` : "none" }} />
            {n.label.split("\n").map((line, li) => (
              <text key={li} x={n.x} y={n.y+(li===0 ? -2.5 : 5.5)} textAnchor="middle" fontFamily="monospace"
                fontSize={isCtr ? 5.5 : 4.8} fill={isActive ? n.color : `${n.color}bb`}>{line}</text>
            ))}
          </motion.g>
        );
      })}
      {isActive && visibleCount >= WEB_ELEMENTS.length && (
        <motion.circle r={3} fill="#00e5ff" style={{ filter: "drop-shadow(0 0 4px #00e5ff)" }}
          animate={{ cx: [CX,ring1[0].x,ring1[1].x,ring2[0].x,ring2[1].x,ring1[2].x,CX], cy: [CY,ring1[0].y,ring1[1].y,ring2[0].y,ring2[1].y,ring1[2].y,CY] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }} />
      )}
    </svg>
  );
}

// ─── Custom Lattice Tooltip ────────────────────────────────────────────────────
function LatticeTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const defs = [
    { key: "enc",     label: "Encryption Strength", color: "#00e5ff" },
    { key: "entropy", label: "Key Entropy",          color: "#8b5cf6" },
    { key: "shield",  label: "Threat Shield",        color: "#ff2d9b" },
  ];
  return (
    <div style={{ background: "rgba(4,1,18,0.95)", border: "1px solid rgba(0,229,255,0.18)", borderRadius: 8, padding: "7px 10px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
      <div style={{ fontFamily: "monospace", fontSize: 7, color: "rgba(0,229,255,0.4)", marginBottom: 5, letterSpacing: "0.1em" }}>
        CRYPTOGRAPHIC METRICS
      </div>
      {defs.map(item => {
        const d = payload.find((p: any) => p.dataKey === item.key);
        if (!d) return null;
        return (
          <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ width: 10, height: 2, background: item.color, borderRadius: 1 }} />
            <span style={{ fontFamily: "monospace", fontSize: 8, color: "rgba(255,255,255,0.5)" }}>{item.label}:</span>
            <span style={{ fontFamily: "monospace", fontSize: 9, color: item.color, fontWeight: "bold" }}>{d.value.toFixed(1)}%</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main RightPanel ───────────────────────────────────────────────────────────
export function RightPanel() {
  const kernelCtx = useKernel();
  const { systemState, entropyTick, chatLog, queryTick } = kernelCtx;
  const { isDark } = useTheme();
  const isStreaming = systemState === "Streaming" || systemState === "Synthesizing";

  // ── Lattice / wave state ──────────────────────────────────────────────────
  const [entropyBoost, setEntropyBoost] = useState(1);
  const [waveData, setWaveData] = useState(() =>
    Array.from({ length: 35 }, (_, i) => generateWavePoint(i, 0))
  );
  const [liveEnc, setLiveEnc]       = useState(72);
  const [liveEnt, setLiveEnt]       = useState(60);
  const [liveShield, setLiveShield] = useState(85);

  // ── Session-aware security log ────────────────────────────────────────────
  const [sessionActive, setSessionActive] = useState(false);
  const [securityLog, setSecurityLog]     = useState<LogEntry[]>([]);
  const prevChatLen = useRef(0);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Init: stagger session boot events after mount
  useEffect(() => {
    let cumDelay = 0;
    SESSION_INIT_EVENTS.forEach((evt, i) => {
      cumDelay += 500 + i * 160;
      setTimeout(() => setSecurityLog(prev => [evt, ...prev]), cumDelay);
    });
    setTimeout(() => setSessionActive(true), cumDelay + 300);
  }, []);

  // Per query: inject meaningful log burst
  useEffect(() => {
    if (!chatLog || chatLog.length === 0) return;
    if (chatLog.length <= prevChatLen.current) return;
    prevChatLen.current = chatLog.length;
    const latest = chatLog[chatLog.length - 1];
    const events = buildQueryEvents(latest.query, latest.models?.[0] ?? "llama3", latest.isMixed);
    let delay = 0;
    events.forEach(evt => {
      delay += 260 + Math.random() * 200;
      setTimeout(() => setSecurityLog(prev => [evt, ...prev.slice(0, 18)]), delay);
    });
  }, [chatLog]);

  // Idle heartbeat — after session active, not when streaming
  useEffect(() => {
    if (!sessionActive) return;
    const iv = setInterval(() => {
      if (!isStreaming) setSecurityLog(prev => [idleHeartbeat(), ...prev.slice(0, 18)]);
    }, 5000);
    return () => clearInterval(iv);
  }, [sessionActive, isStreaming]);

  // Auto scroll to top
  useEffect(() => {
    if (logContainerRef.current) logContainerRef.current.scrollTop = 0;
  }, [securityLog]);

  // ── Telemetry ─────────────────────────────────────────────────────────────
  const [keyTimer, setKeyTimer]     = useState(971.8);
  const [merkleRoot, setMerkleRoot] = useState(generateHash());
  const [blockHashes, setBlockHashes] = useState(() =>
    Array.from({ length: 4 }, (_, i) => ({ hash: generateHash(), ts: `0${i+1}.04.2026`, height: 3443 + i }))
  );
  const [integrity, setIntegrity] = useState(99.98);
  const [dataRate, setDataRate]   = useState(12.3);

  // Entropy burst on keystroke
  useEffect(() => {
    if (entropyTick === 0) return;
    setEntropyBoost(1.8);
    setWaveData(prev => prev.map(pt => ({
      ...pt,
      enc:     Math.min(100, Math.max(0, pt.enc     + (Math.random()-0.3)*28)),
      entropy: Math.min(100, Math.max(0, pt.entropy + (Math.random()-0.35)*22)),
      shield:  Math.min(100, Math.max(0, pt.shield  + (Math.random()-0.25)*16)),
    })));
    const t = setTimeout(() => setEntropyBoost(1), 600);
    return () => clearTimeout(t);
  }, [entropyTick]);

  // Wave animation tick
  useEffect(() => {
    let t = 0;
    const iv = setInterval(() => {
      t++;
      const pts = Array.from({ length: 35 }, (_, i) => generateWavePoint(i, t, entropyBoost));
      setWaveData(pts);
      const last = pts[pts.length - 1];
      setLiveEnc(Math.round(last.enc));
      setLiveEnt(Math.round(last.entropy));
      setLiveShield(Math.round(last.shield));
      setKeyTimer(k => k > 0 ? +(k - 0.2).toFixed(1) : 971.8);
    }, 150);
    return () => clearInterval(iv);
  }, [entropyBoost]);

  // Block / merkle ticker
  useEffect(() => {
    const iv = setInterval(() => {
      setDataRate(r => +(r + (Math.random()-0.5)*0.8).toFixed(1));
      if (Math.random() > 0.75) {
        setMerkleRoot(generateHash());
        setBlockHashes(prev => [{ hash: generateHash(), ts: "14.04.2026", height: prev[0].height+1 }, ...prev.slice(0,3)]);
        setIntegrity(+(99.9 + Math.random()*0.09).toFixed(2));
      }
    }, isStreaming ? 1200 : 2000);
    return () => clearInterval(iv);
  }, [isStreaming]);

  // Session grouping
  const sessionGroups = useMemo(() => {
    if (!chatLog || chatLog.length === 0) return [];
    const groups: { label: string; entries: typeof chatLog }[] = [];
    let current: typeof chatLog = [];
    let lastTime: Date | null = null;
    const sorted = [...chatLog].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    for (const entry of sorted) {
      const t = new Date(entry.timestamp);
      if (!lastTime || (t.getTime() - lastTime.getTime()) > 30*60*1000) {
        if (current.length > 0) groups.push({ label: lastTime!.toLocaleDateString("en-US",{month:"short",day:"numeric"})+" "+lastTime!.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false}), entries: current });
        current = [entry];
      } else { current.push(entry); }
      lastTime = t;
    }
    if (current.length > 0 && lastTime) groups.push({ label: lastTime.toLocaleDateString("en-US",{month:"short",day:"numeric"})+" Session", entries: current });
    return groups.reverse();
  }, [chatLog]);

  const clearHistory = () => {
    try { localStorage.removeItem("aegis_chat_log"); } catch {}
    window.location.reload();
  };

  const METRICS = [
    { key: "enc",     label: "Enc. Strength", color: "#00e5ff", val: liveEnc,    grad: "rgba(0,229,255,0.14)",  gId: "gEnc" },
    { key: "entropy", label: "Key Entropy",   color: "#8b5cf6", val: liveEnt,    grad: "rgba(139,92,246,0.14)", gId: "gEnt" },
    { key: "shield",  label: "Threat Shield", color: "#ff2d9b", val: liveShield, grad: "rgba(255,45,155,0.10)", gId: "gShi" },
  ];

  return (
    <div className="flex flex-col overflow-y-auto shrink-0"
      style={{
        width: 265, minWidth: 265,
        background: isDark ? "rgba(10,4,26,0.86)" : "rgba(9,15,26,0.93)",
        borderLeft: isDark ? "1px solid rgba(139,92,246,0.25)" : "1px solid rgba(109,40,217,0.2)",
        backdropFilter: "blur(40px)",
        boxShadow: isDark ? "-4px 0 32px rgba(60,0,140,0.1)" : "-4px 0 22px rgba(109,40,217,0.1)",
      }}>

      {/* ═══════════════════════════════════════════════════════
          LATTICE DENSITY  — label fixed, chart redesigned
          ═══════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity:0,y:14,scale:0.94 }} animate={{ opacity:1,y:0,scale:1 }}
        transition={{ type:"spring", stiffness:360, damping:22 }} className="lg-panel m-2 mb-0 p-2.5">

        {/* Header — "Lattice Density" only */}
        <div className="flex items-center justify-between mb-0.5 relative z-10">
          <div className="flex items-center gap-1.5">
            <Activity style={{ width:10, height:10, color: isDark ? "#00e5ff" : "#5b21b6" }} />
            <span className="font-mono uppercase tracking-widest" style={{ fontSize:8.5, color: isDark ? "#00e5ff" : "#5b21b6" }}>
              Lattice Density
            </span>
          </div>
          <AnimatePresence>
            {entropyBoost > 1 && (
              <motion.span initial={{ opacity:0,scale:0.7,x:8 }} animate={{ opacity:1,scale:1,x:0 }} exit={{ opacity:0,scale:0.7,x:8 }}
                transition={{ type:"spring", stiffness:500, damping:20 }}
                className="font-mono px-1.5 rounded-full"
                style={{ fontSize:7, color:"#ff2d9b", border:"1px solid rgba(255,45,155,0.35)", background:"rgba(255,45,155,0.1)", boxShadow:"0 0 8px rgba(255,45,155,0.25)" }}>
                ENTROPY↑
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Subtitle */}
        <div className="font-mono mb-2 relative z-10" style={{ fontSize:7, color: isDark ? "rgba(0,229,255,0.35)" : "rgba(91,33,182,0.55)", letterSpacing:"0.04em" }}>
          Live cryptographic protection levels — 0 to 100%
        </div>

        {/* Live metric pills with spring-bouncing numbers */}
        <div className="flex gap-1.5 mb-2 relative z-10">
          {METRICS.map(m => (
            <motion.div key={m.key}
              animate={{ boxShadow: entropyBoost > 1 ? `0 0 14px ${m.color}45` : "none" }}
              transition={{ duration:0.3 }}
              style={{ flex:1, borderRadius:8, padding:"5px 6px", textAlign:"center",
                background: m.grad, border:`1px solid ${m.color}35`,
                boxShadow:"inset 0 1px 0 rgba(255,255,255,0.1)" }}>
              <div style={{ fontFamily:"monospace", fontSize:6.5, color:`${m.color}88`, marginBottom:1 }}>{m.label}</div>
              <motion.div key={m.val} initial={{ scale:1.25, y:-2 }} animate={{ scale:1, y:0 }}
                transition={{ type:"spring", stiffness:600, damping:18 }}
                style={{ fontFamily:"monospace", fontSize:13, color:m.color, textShadow:`0 0 12px ${m.color}55` }}>
                {m.val}<span style={{ fontSize:7, opacity:0.55 }}>%</span>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* AreaChart with proper labels and tooltip */}
        <div style={{ height:85 }} className="relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={waveData} margin={{ top:2, right:2, left:-32, bottom:0 }}>
              <defs>
                {METRICS.map(m => (
                  <linearGradient key={m.gId} id={m.gId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={m.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={m.color} stopOpacity={0.01} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="2 5" stroke="rgba(0,229,255,0.05)" />
              <XAxis dataKey="x" hide />
              <YAxis domain={[0,100]}
                tick={{ fontSize:6.5, fill:"rgba(0,229,255,0.28)", fontFamily:"monospace" }}
                tickCount={5} tickFormatter={v => `${v}%`} />
              {/* Danger threshold */}
              <ReferenceLine y={50} stroke="rgba(255,45,155,0.22)" strokeDasharray="4 3"
                label={{ value:"threshold", position:"insideTopLeft", fontSize:5.5, fill:"rgba(255,45,155,0.4)", fontFamily:"monospace" }} />
              <Tooltip content={<LatticeTooltip />} />
              <Area type="monotone" dataKey="enc"     stroke="#00e5ff" strokeWidth={entropyBoost>1?1.7:1.1} fill="url(#gEnc)" dot={false} isAnimationActive={false} />
              <Area type="monotone" dataKey="entropy" stroke="#8b5cf6" strokeWidth={entropyBoost>1?1.4:0.9} fill="url(#gEnt)" dot={false} isAnimationActive={false} />
              <Area type="monotone" dataKey="shield"  stroke="#ff2d9b" strokeWidth={entropyBoost>1?1.2:0.8} fill="url(#gShi)" dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex gap-2.5 mt-1.5 relative z-10">
          {METRICS.map(m => (
            <div key={m.key} className="flex items-center gap-1">
              <div style={{ width:14, height:1.5, background:m.color, borderRadius:1 }} />
              <span className="font-mono" style={{ fontSize:6.5, color: isDark ? "rgba(255,255,255,0.36)" : "rgba(30,10,80,0.55)" }}>{m.label}</span>
            </div>
          ))}
        </div>

        {/* Overall integrity */}
        <div className="flex items-center gap-1.5 mt-1.5 relative z-10">
          <motion.div animate={{ opacity:[1,0.5,1] }} transition={{ repeat:Infinity, duration:2.2 }}
            style={{ width:5, height:5, borderRadius:"50%", background:"#00ff64", boxShadow:"0 0 6px #00ff64" }} />
          <span className="font-mono" style={{ fontSize:8, color:"rgba(0,229,255,0.65)" }}>
            Overall Integrity: <span style={{ color:"#00ff64" }}>{integrity}%</span>
          </span>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          REAL-TIME SECURITY LOG
          ═══════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity:0,y:14,scale:0.94 }} animate={{ opacity:1,y:0,scale:1 }}
        transition={{ type:"spring", stiffness:360, damping:22, delay:0.05 }} className="lg-panel m-2 mb-0 p-2.5">

        {/* Header */}
        <div className="flex items-center justify-between mb-1 relative z-10">
          <div className="flex items-center gap-1.5">
            <Link2 style={{ width:10, height:10, color:"#ff2d9b" }} />
            <span className="font-mono uppercase tracking-widest" style={{ fontSize:8.5, color: isDark ? "#00e5ff" : "#5b21b6" }}>Security Log</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AnimatePresence>
              {sessionActive && (
                <motion.div initial={{ opacity:0,scale:0.7,x:8 }} animate={{ opacity:1,scale:1,x:0 }} exit={{ opacity:0,scale:0.7 }}
                  transition={{ type:"spring", stiffness:500, damping:22 }}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                  style={{ background:"rgba(0,255,100,0.06)", border:"1px solid rgba(0,255,100,0.2)" }}>
                  <ShieldCheck style={{ width:7, height:7, color:"#00ff64" }} />
                  <span className="font-mono" style={{ fontSize:6.5, color:"#00ff64" }}>{SESSION_ID.slice(0,12)}</span>
                </motion.div>
              )}
            </AnimatePresence>
            {isStreaming && (
              <motion.div animate={{ opacity:[1,0.4,1] }} transition={{ repeat:Infinity, duration:0.7 }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                style={{ background:"rgba(255,45,155,0.12)", border:"1px solid rgba(255,45,155,0.3)" }}>
                <div style={{ width:4, height:4, borderRadius:"50%", background:"#ff2d9b" }} />
                <span className="font-mono" style={{ fontSize:7, color:"#ff2d9b" }}>LIVE</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Body: placeholder until session initializes */}
        {!sessionActive ? (
          <motion.div animate={{ opacity:[0.4,0.8,0.4] }} transition={{ repeat:Infinity, duration:1.8 }}
            className="flex flex-col items-center justify-center rounded-lg gap-1.5"
            style={{ height:108, background: isDark ? "rgba(0,0,0,0.3)" : "rgba(9,15,26,0.7)", border: isDark ? "1px solid rgba(0,229,255,0.07)" : "1px solid rgba(109,40,217,0.12)" }}>
            <LogIn style={{ width:16, height:16, color: isDark ? "rgba(0,229,255,0.22)" : "rgba(91,33,182,0.35)" }} />
            <span className="font-mono" style={{ fontSize:7.5, color: isDark ? "rgba(0,229,255,0.25)" : "rgba(30,10,80,0.5)" }}>Initializing secure session...</span>
            <div style={{ height:2, width:80, background:"rgba(0,229,255,0.08)", borderRadius:2, overflow:"hidden" }}>
              <motion.div animate={{ x:["-100%","100%"] }} transition={{ repeat:Infinity, duration:1.4, ease:"easeInOut" }}
                style={{ height:"100%", width:"50%", background:"linear-gradient(90deg,transparent,#00e5ff,transparent)" }} />
            </div>
          </motion.div>
        ) : (
          <div ref={logContainerRef} className="custom-scrollbar relative z-10"
            style={{ height:108, overflowY:"auto", background: isDark ? "rgba(0,0,0,0.35)" : "rgba(9,15,26,0.8)", border: isDark ? "1px solid rgba(0,229,255,0.07)" : "1px solid rgba(109,40,217,0.12)", borderRadius:8 }}>
            <AnimatePresence initial={false}>
              {securityLog.map((entry, i) => (
                <motion.div key={`${entry.ts}_${i}`}
                  initial={{ opacity:0, height:0, y:-10 }}
                  animate={{ opacity: Math.max(0.1, 1 - i*0.062), height:"auto", y:0 }}
                  exit={{ opacity:0, height:0 }}
                  transition={{ type:"spring", stiffness:400, damping:22 }}
                  className="px-1.5 py-0.5 flex items-baseline gap-1.5"
                  style={{ borderBottom: i===0 ? isDark ? "1px solid rgba(0,229,255,0.07)" : "1px solid rgba(139,92,246,0.08)" : "none" }}>
                  {/* Tag badge */}
                  <span className="font-mono shrink-0"
                    style={{ fontSize:6.5, color:entry.color, background:`${entry.color}14`,
                      border:`1px solid ${entry.color}28`, borderRadius:3, padding:"0px 3px", letterSpacing:"0.04em" }}>
                    {entry.tag}
                  </span>
                  {/* Message */}
                  <span className="font-mono truncate flex-1"
                    style={{ fontSize:7, color: i===0 ? isDark ? "rgba(255,255,255,0.78)" : "rgba(20,10,50,0.85)" : isDark ? "rgba(255,255,255,0.35)" : "rgba(20,10,50,0.45)" }}>
                    {entry.text}
                  </span>
                  {/* Timestamp on latest */}
                  {i === 0 && (
                    <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} className="font-mono shrink-0"
                      style={{ fontSize:6, color: isDark ? "rgba(0,229,255,0.22)" : "rgba(20,10,60,0.3)" }}>
                      {new Date(entry.ts).toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})}
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Telemetry footer */}
        {sessionActive && (
          <div className="mt-1.5 flex flex-col gap-0.5 relative z-10">
            {[
              { label:"Session:",    val: SESSION_ID,         color:"rgba(0,229,255,0.55)" },
              { label:"Data rate:",  val:`${dataRate} GB/s`,  color: isStreaming ? "#ff2d9b" : "#00e5ff" },
              { label:"Key timer:",  val:`${keyTimer}s`,      color: keyTimer < 200 ? "#ff2d9b" : "#00e5ff" },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between">
                <span className="font-mono" style={{ fontSize:7, color:"rgba(0,229,255,0.38)" }}>{r.label}</span>
                <motion.span animate={{ color:r.color }} className="font-mono truncate ml-2"
                  style={{ fontSize:7, maxWidth:140, textAlign:"right" }}>{r.val}</motion.span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Cognitive Reasoning Path ───────────────────────────────────────── */}
      <motion.div initial={{ opacity:0,y:14,scale:0.94 }} animate={{ opacity:1,y:0,scale:1 }}
        transition={{ type:"spring", stiffness:360, damping:22, delay:0.1 }} className="lg-panel m-2 mb-0 p-2.5">
        <div className="flex items-center justify-between mb-1 relative z-10">
          <div className="flex items-center gap-1.5">
            <BarChart2 style={{ width:10, height:10, color:"#8b5cf6" }} />
            <span className="font-mono uppercase tracking-widest" style={{ fontSize:8.5, color:"#00e5ff" }}>Cognitive Reasoning</span>
          </div>
          {isStreaming && (
            <motion.span animate={{ opacity:[1,0.4,1] }} transition={{ repeat:Infinity, duration:0.55 }}
              className="font-mono" style={{ fontSize:7.5, color:"rgba(139,92,246,0.8)" }}>◈ stitching...</motion.span>
          )}
        </div>
        <div className="rounded-lg relative z-10"
          style={{ background:"rgba(0,0,0,0.28)", border:`1px solid ${isStreaming?"rgba(139,92,246,0.35)":"rgba(139,92,246,0.12)"}`,
            boxShadow: isStreaming ? "0 0 20px rgba(139,92,246,0.1)" : "none", transition:"all 0.4s ease" }}>
          <SpiderWeb queryTick={queryTick ?? 0} isActive={isStreaming} />
        </div>
        <div className="font-mono mt-1 relative z-10" style={{ fontSize:7, color:"rgba(139,92,246,0.42)" }}>
          {isStreaming ? "► Web stitching active — reasoning threads live" : "Idle — send query to activate web"}
        </div>
      </motion.div>

      {/* ── Version History ────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity:0,y:14,scale:0.94 }} animate={{ opacity:1,y:0,scale:1 }}
        transition={{ type:"spring", stiffness:360, damping:22, delay:0.14 }} className="lg-panel m-2 mb-0 p-2.5">
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-1.5">
            <History style={{ width:10, height:10, color:"#8b5cf6" }} />
            <span className="font-mono uppercase tracking-widest" style={{ fontSize:8.5, color:"#00e5ff" }}>Version History</span>
          </div>
          <div className="flex items-center gap-1.5">
            <motion.span key={chatLog?.length} initial={{ scale:1.3,color:"#8b5cf6" }} animate={{ scale:1,color:"rgba(139,92,246,0.6)" }}
              transition={{ duration:0.3 }} className="font-mono px-1.5 rounded"
              style={{ fontSize:7.5, border:"1px solid rgba(139,92,246,0.2)", background:"rgba(139,92,246,0.06)" }}>
              {chatLog?.length ?? 0} entries
            </motion.span>
            {(chatLog?.length ?? 0) > 0 && (
              <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }} onClick={clearHistory}
                title="Clear all history" style={{ background:"none", border:"none", cursor:"pointer", padding:2 }}>
                <Trash2 style={{ width:9, height:9, color:"rgba(255,45,155,0.5)" }} />
              </motion.button>
            )}
          </div>
        </div>

        {!chatLog || chatLog.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg py-5 gap-2 relative z-10"
            style={{ background:"rgba(0,0,0,0.25)", border:"1px solid rgba(139,92,246,0.1)" }}>
            <Clock style={{ width:16, height:16, color:"rgba(139,92,246,0.25)" }} />
            <span className="font-mono text-center" style={{ fontSize:7.5, color:"rgba(0,229,255,0.2)" }}>
              No sessions yet — queries are recorded here
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 relative z-10" style={{ maxHeight:200, overflowY:"auto" }}>
            {sessionGroups.map((group, gi) => (
              <div key={gi}>
                <div className="flex items-center gap-1.5 mb-1">
                  <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(139,92,246,0.4),transparent)" }} />
                  <span className="font-mono" style={{ fontSize:6.5, color:"rgba(139,92,246,0.5)" }}>
                    {group.label} · {group.entries.length} quer{group.entries.length>1?"ies":"y"}
                  </span>
                  <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(139,92,246,0.4))" }} />
                </div>
                <div className="flex flex-col gap-1">
                  <AnimatePresence initial={false}>
                    {[...group.entries].reverse().map((entry, i) => {
                      const isLatest = gi===0 && i===0;
                      return (
                        <motion.div key={entry.id}
                          initial={{ opacity:0,x:12,scale:0.9 }} animate={{ opacity:1,x:0,scale:1 }} exit={{ opacity:0,height:0 }}
                          transition={{ type:"spring", stiffness:400, damping:22 }}
                          className="px-2 py-1.5 relative overflow-hidden"
                          style={{ borderRadius:10,
                            background: isLatest ? "linear-gradient(135deg,rgba(139,92,246,0.14),rgba(139,92,246,0.04))" : "rgba(0,0,0,0.2)",
                            border:`1px solid ${isLatest?"rgba(139,92,246,0.35)":"rgba(0,229,255,0.06)"}`,
                            boxShadow: isLatest ? "0 6px 18px rgba(0,0,0,0.4),0 0 14px rgba(139,92,246,0.1),inset 0 1px 0 rgba(255,255,255,0.1)" : "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                          {isLatest && <div style={{ position:"absolute",top:0,left:"8%",right:"8%",height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)",pointerEvents:"none" }} />}
                          <div className="flex items-start gap-1">
                            <ChevronRight style={{ width:8,height:8,color:isLatest?"#8b5cf6":"rgba(0,229,255,0.25)",flexShrink:0,marginTop:1 }} />
                            <div className="flex-1 min-w-0">
                              <div className="font-mono truncate" style={{ fontSize:7.5, color:isLatest?"rgba(255,255,255,0.85)":"rgba(255,255,255,0.4)" }}>
                                {entry.query.slice(0,34)}{entry.query.length>34?"…":""}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                <span className="font-mono" style={{ fontSize:6, color:"rgba(0,229,255,0.3)" }}>
                                  {new Date(entry.timestamp).toLocaleTimeString("en-US",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})}
                                </span>
                                {entry.isMixed ? (
                                  <span className="font-mono px-1 rounded" style={{ fontSize:6,color:"#ff2d9b",border:"1px solid rgba(255,45,155,0.25)",background:"rgba(255,45,155,0.06)" }}>FUSION</span>
                                ) : (
                                  (entry.models??[]).slice(0,2).map((m:string) => (
                                    <span key={m} className="font-mono px-1 rounded" style={{ fontSize:6,color:"rgba(0,229,255,0.5)",border:"1px solid rgba(0,229,255,0.15)",background:"rgba(0,229,255,0.04)" }}>{m}</span>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Merkle Tree + Block Log ───────────────────────────────────────── */}
      <motion.div initial={{ opacity:0,y:14,scale:0.94 }} animate={{ opacity:1,y:0,scale:1 }}
        transition={{ type:"spring", stiffness:360, damping:22, delay:0.18 }} className="lg-panel m-2 p-2.5">
        <div className="font-mono mb-1.5" style={{ fontSize:7.5, color:"rgba(0,229,255,0.45)" }}>Merkle Tree Root:</div>
        <motion.div key={merkleRoot} initial={{ opacity:0 }} animate={{ opacity:1 }} className="font-mono mb-2 truncate" style={{ fontSize:7.5, color:"rgba(0,229,255,0.6)" }}>{merkleRoot}</motion.div>
        <div className="flex flex-col gap-1">
          <AnimatePresence initial={false}>
            {blockHashes.map((bh, i) => (
              <motion.div key={bh.hash} initial={{ opacity:0,y:-6,height:0 }} animate={{ opacity:1,y:0,height:"auto" }} exit={{ opacity:0,height:0 }} transition={{ duration:0.22 }}
                className="flex items-center justify-between rounded px-2 py-1"
                style={{ background:i===0?"rgba(0,229,255,0.06)":"rgba(0,0,0,0.2)", border:`1px solid ${i===0?"rgba(0,229,255,0.2)":"rgba(0,229,255,0.06)"}` }}>
                <div>
                  <div className="font-mono truncate" style={{ fontSize:7, color:i===0?"#00e5ff":"rgba(0,229,255,0.4)", maxWidth:155 }}>{bh.hash}</div>
                  <div className="font-mono" style={{ fontSize:6, color:"rgba(0,229,255,0.25)" }}>{bh.ts} · Block #{bh.height}</div>
                </div>
                {i===0 && (
                  <motion.div animate={{ opacity:[1,0.4,1] }} transition={{ repeat:Infinity, duration:0.9 }}
                    style={{ width:5,height:5,borderRadius:"50%",background:"#00ff64",boxShadow:"0 0 6px #00ff64",flexShrink:0 }} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}