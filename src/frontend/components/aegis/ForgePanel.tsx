import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Folder, FolderOpen, FileCode,
  Download, Terminal, CheckCircle2,
  Hammer, Loader, Send, Eye, Code2, MessageSquare, Sparkles,
} from "lucide-react";
import { useKernel, MODELS } from "./KernelContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FileNode {
  id: string; name: string; type: "folder" | "file";
  fileType?: "tsx" | "py" | "json" | "md" | "yml" | "env";
  children?: FileNode[];
}

// ─── File tree template ────────────────────────────────────────────────────────
const FILE_TREE: FileNode[] = [
  { id: "root", name: "secure-login-portal/", type: "folder", children: [
    { id: "frontend", name: "frontend/", type: "folder", children: [
      { id: "src", name: "src/", type: "folder", children: [
        { id: "components", name: "components/", type: "folder", children: [
          { id: "LoginForm", name: "LoginForm.tsx", type: "file", fileType: "tsx" },
          { id: "AuthGuard", name: "AuthGuard.tsx", type: "file", fileType: "tsx" },
          { id: "SessionBanner", name: "SessionBanner.tsx", type: "file", fileType: "tsx" },
        ]},
        { id: "App", name: "App.tsx", type: "file", fileType: "tsx" },
        { id: "main", name: "main.tsx", type: "file", fileType: "tsx" },
      ]},
      { id: "pkgjson", name: "package.json", type: "file", fileType: "json" },
    ]},
    { id: "backend", name: "backend/", type: "folder", children: [
      { id: "mainpy", name: "main.py", type: "file", fileType: "py" },
      { id: "authpy", name: "auth.py", type: "file", fileType: "py" },
      { id: "modelspy", name: "models.py", type: "file", fileType: "py" },
      { id: "reqtxt", name: "requirements.txt", type: "file", fileType: "md" },
    ]},
    { id: "compose", name: "docker-compose.yml", type: "file", fileType: "yml" },
    { id: "envfile", name: ".env.example", type: "file", fileType: "env" },
    { id: "readme", name: "README.md", type: "file", fileType: "md" },
  ]},
];

// ─── Code samples ─────────────────────────────────────────────────────────────
type CodeLine = { tokens: { text: string; color: string }[] };

const CODE_SAMPLES: Record<string, CodeLine[]> = {
  LoginForm: [
    { tokens: [{ text: "import ", color: "#c792ea" }, { text: "React, { useState }", color: "#82aaff" }, { text: " from ", color: "#c792ea" }, { text: "'react'", color: "#c3e88d" }, { text: ";", color: "#89ddff" }] },
    { tokens: [{ text: "import ", color: "#c792ea" }, { text: "{ authenticateUser }", color: "#82aaff" }, { text: " from ", color: "#c792ea" }, { text: "'../api/auth'", color: "#c3e88d" }, { text: ";", color: "#89ddff" }] },
    { tokens: [] },
    { tokens: [{ text: "export const ", color: "#c792ea" }, { text: "LoginForm", color: "#82aaff" }, { text: ": React.FC = () => {", color: "#89ddff" }] },
    { tokens: [{ text: "  const ", color: "#c792ea" }, { text: "[email, setEmail]", color: "#82aaff" }, { text: " = useState(", color: "#89ddff" }, { text: "''", color: "#c3e88d" }, { text: ");", color: "#89ddff" }] },
    { tokens: [{ text: "  const ", color: "#c792ea" }, { text: "[password, setPassword]", color: "#82aaff" }, { text: " = useState(", color: "#89ddff" }, { text: "''", color: "#c3e88d" }, { text: ");", color: "#89ddff" }] },
    { tokens: [{ text: "  const ", color: "#c792ea" }, { text: "[loading, setLoading]", color: "#82aaff" }, { text: " = useState(", color: "#89ddff" }, { text: "false", color: "#f78c6c" }, { text: ");", color: "#89ddff" }] },
    { tokens: [] },
    { tokens: [{ text: "  // PQC-hardened submit handler", color: "#546e7a" }] },
    { tokens: [{ text: "  const ", color: "#c792ea" }, { text: "handleSubmit ", color: "#82aaff" }, { text: "= async (", color: "#89ddff" }, { text: "e", color: "#f07178" }, { text: ": React.FormEvent) => {", color: "#89ddff" }] },
    { tokens: [{ text: "    e.preventDefault();", color: "#89ddff" }] },
    { tokens: [{ text: "    setLoading(", color: "#82aaff" }, { text: "true", color: "#f78c6c" }, { text: ");", color: "#89ddff" }] },
    { tokens: [{ text: "    try {", color: "#89ddff" }] },
    { tokens: [{ text: "      const ", color: "#c792ea" }, { text: "token ", color: "#82aaff" }, { text: "= await ", color: "#c792ea" }, { text: "authenticateUser", color: "#82aaff" }, { text: "({ email, password });", color: "#89ddff" }] },
    { tokens: [{ text: "    } catch ", color: "#c792ea" }, { text: "(err) { setError(", color: "#89ddff" }, { text: "'Auth failed.'", color: "#c3e88d" }, { text: "); }", color: "#89ddff" }] },
    { tokens: [{ text: "    } finally { setLoading(", color: "#89ddff" }, { text: "false", color: "#f78c6c" }, { text: "); }", color: "#89ddff" }] },
    { tokens: [{ text: "  };", color: "#89ddff" }] },
    { tokens: [] },
    { tokens: [{ text: "  return (", color: "#89ddff" }] },
    { tokens: [{ text: "    <", color: "#89ddff" }, { text: "form ", color: "#f07178" }, { text: "onSubmit", color: "#82aaff" }, { text: "={handleSubmit}>", color: "#89ddff" }] },
    { tokens: [{ text: "      <", color: "#89ddff" }, { text: "input ", color: "#f07178" }, { text: "type", color: "#82aaff" }, { text: "=", color: "#89ddff" }, { text: "\"email\" ", color: "#c3e88d" }, { text: "value", color: "#82aaff" }, { text: "={email} />", color: "#89ddff" }] },
    { tokens: [{ text: "      <", color: "#89ddff" }, { text: "input ", color: "#f07178" }, { text: "type", color: "#82aaff" }, { text: "=", color: "#89ddff" }, { text: "\"password\" ", color: "#c3e88d" }, { text: "value", color: "#82aaff" }, { text: "={password} />", color: "#89ddff" }] },
    { tokens: [{ text: "      <", color: "#89ddff" }, { text: "button ", color: "#f07178" }, { text: "disabled", color: "#82aaff" }, { text: "={loading}>{loading ? ", color: "#89ddff" }, { text: "'...' ", color: "#c3e88d" }, { text: ": ", color: "#89ddff" }, { text: "'Sign In'", color: "#c3e88d" }, { text: "}</", color: "#89ddff" }, { text: "button", color: "#f07178" }, { text: ">", color: "#89ddff" }] },
    { tokens: [{ text: "    </", color: "#89ddff" }, { text: "form", color: "#f07178" }, { text: ">", color: "#89ddff" }] },
    { tokens: [{ text: "  );", color: "#89ddff" }] },
    { tokens: [{ text: "};", color: "#89ddff" }] },
  ],
  authpy: [
    { tokens: [{ text: "from ", color: "#c792ea" }, { text: "fastapi ", color: "#82aaff" }, { text: "import ", color: "#c792ea" }, { text: "APIRouter, HTTPException", color: "#f07178" }] },
    { tokens: [{ text: "from ", color: "#c792ea" }, { text: "jose ", color: "#82aaff" }, { text: "import ", color: "#c792ea" }, { text: "JWTError, jwt", color: "#f07178" }] },
    { tokens: [{ text: "from ", color: "#c792ea" }, { text: "passlib.context ", color: "#82aaff" }, { text: "import ", color: "#c792ea" }, { text: "CryptContext", color: "#f07178" }] },
    { tokens: [] },
    { tokens: [{ text: "pwd_context ", color: "#82aaff" }, { text: "= CryptContext(schemes=[", color: "#89ddff" }, { text: "'argon2'", color: "#c3e88d" }, { text: "])", color: "#89ddff" }] },
    { tokens: [{ text: "router ", color: "#82aaff" }, { text: "= APIRouter(prefix=", color: "#89ddff" }, { text: "'/auth'", color: "#c3e88d" }, { text: ", tags=[", color: "#89ddff" }, { text: "'auth'", color: "#c3e88d" }, { text: "])", color: "#89ddff" }] },
    { tokens: [] },
    { tokens: [{ text: "@router.post(", color: "#f07178" }, { text: "'/token'", color: "#c3e88d" }, { text: ")", color: "#89ddff" }] },
    { tokens: [{ text: "async ", color: "#c792ea" }, { text: "def ", color: "#c792ea" }, { text: "login", color: "#82aaff" }, { text: "(form_data: OAuth2PasswordRequestForm = Depends()):", color: "#89ddff" }] },
    { tokens: [{ text: "    user ", color: "#f07178" }, { text: "= authenticate_user(form_data.username, form_data.password)", color: "#89ddff" }] },
    { tokens: [{ text: "    if not ", color: "#c792ea" }, { text: "user:", color: "#89ddff" }] },
    { tokens: [{ text: "        raise ", color: "#c792ea" }, { text: "HTTPException(status_code=", color: "#89ddff" }, { text: "401", color: "#f78c6c" }, { text: ")", color: "#89ddff" }] },
    { tokens: [{ text: "    token ", color: "#f07178" }, { text: "= create_access_token({", color: "#89ddff" }, { text: "'sub'", color: "#c3e88d" }, { text: ": user.email})", color: "#89ddff" }] },
    { tokens: [{ text: "    return ", color: "#c792ea" }, { text: "{", color: "#89ddff" }, { text: "'access_token'", color: "#c3e88d" }, { text: ": token}", color: "#89ddff" }] },
  ],
  pkgjson: [
    { tokens: [{ text: "{", color: "#89ddff" }] },
    { tokens: [{ text: "  ", color: "#fff" }, { text: "\"name\"", color: "#c3e88d" }, { text: ": ", color: "#89ddff" }, { text: "\"secure-login-portal\"", color: "#c3e88d" }, { text: ",", color: "#89ddff" }] },
    { tokens: [{ text: "  ", color: "#fff" }, { text: "\"version\"", color: "#c3e88d" }, { text: ": ", color: "#89ddff" }, { text: "\"1.0.0\"", color: "#c3e88d" }, { text: ",", color: "#89ddff" }] },
    { tokens: [{ text: "  ", color: "#fff" }, { text: "\"dependencies\"", color: "#c3e88d" }, { text: ": {", color: "#89ddff" }] },
    { tokens: [{ text: "    ", color: "#fff" }, { text: "\"react\"", color: "#c3e88d" }, { text: ": ", color: "#89ddff" }, { text: "\"^18.3.0\"", color: "#c3e88d" }, { text: ",", color: "#89ddff" }] },
    { tokens: [{ text: "    ", color: "#fff" }, { text: "\"react-router-dom\"", color: "#c3e88d" }, { text: ": ", color: "#89ddff" }, { text: "\"^6.26.0\"", color: "#c3e88d" }, { text: ",", color: "#89ddff" }] },
    { tokens: [{ text: "    ", color: "#fff" }, { text: "\"axios\"", color: "#c3e88d" }, { text: ": ", color: "#89ddff" }, { text: "\"^1.7.0\"", color: "#c3e88d" }] },
    { tokens: [{ text: "  },", color: "#89ddff" }] },
    { tokens: [{ text: "}", color: "#89ddff" }] },
  ],
};

// ─── Terminal steps ────────────────────────────────────────────────────────────
const TERMINAL_STEPS: { cmd: string; delay: number; color?: string }[] = [
  { cmd: "> Initializing Synapse Forge agent...", delay: 400, color: "#f59e0b" },
  { cmd: "> mkdir -p secure-login-portal/{frontend/src/components,backend}", delay: 700 },
  { cmd: "> npx create-vite@latest frontend --template react-ts", delay: 900 },
  { cmd: "  ✓ Scaffolding React + TypeScript project", delay: 200, color: "#00ff64" },
  { cmd: "> npm install react-router-dom axios @tanstack/react-query", delay: 1100 },
  { cmd: "  added 247 packages in 8.3s", delay: 200, color: "#00e5ff" },
  { cmd: "> [AGENT] Generating LoginForm.tsx with PQC-hardened auth...", delay: 800, color: "#f59e0b" },
  { cmd: "  ✓ Writing LoginForm.tsx  [46 lines]", delay: 300, color: "#00ff64" },
  { cmd: "  ✓ Writing AuthGuard.tsx  [28 lines]", delay: 250, color: "#00ff64" },
  { cmd: "> [AGENT] Generating auth.py with OAuth2 + JWT (HS512)...", delay: 700, color: "#f59e0b" },
  { cmd: "  ✓ Writing auth.py    [88 lines]", delay: 300, color: "#00ff64" },
  { cmd: "> docker-compose build --no-cache", delay: 1400 },
  { cmd: "  [+] Building 2/2 layers complete", delay: 400, color: "#00e5ff" },
  { cmd: "> [SYNAPSE FORGE] ✓ BUILD COMPLETE", delay: 600, color: "#f59e0b" },
];

// ─── Live preview components by file ──────────────────────────────────────────
function LivePreview({ fileId, query }: { fileId: string; query: string }) {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("••••••••");

  if (fileId === "LoginForm" || fileId === "App") {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0f172a,#1e1b4b)" }}>
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 320, damping: 22 }}
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 16, padding: "28px 24px", width: 240, boxShadow: "0 24px 60px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.15)", backdropFilter: "blur(24px)" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: "#a78bfa", letterSpacing: "0.12em", marginBottom: 4 }}>SECURE LOGIN</div>
            <div style={{ fontSize: 9, color: "rgba(139,92,246,0.5)" }}>PQC-FIPS 140-3 Protected</div>
          </div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com"
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 8, padding: "7px 10px", fontSize: 10, color: "rgba(255,255,255,0.8)", outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
          <div style={{ position: "relative", marginBottom: 14 }}>
            <input value={showPass ? pw : "••••••••"} onChange={() => {}} placeholder="password"
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 8, padding: "7px 10px", fontSize: 10, color: "rgba(255,255,255,0.8)", outline: "none", boxSizing: "border-box" }} />
            <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(139,92,246,0.6)", cursor: "pointer", fontSize: 9 }}>
              {showPass ? "HIDE" : "SHOW"}
            </button>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ width: "100%", background: "linear-gradient(135deg,rgba(139,92,246,0.7),rgba(99,60,220,0.8))", border: "1px solid rgba(139,92,246,0.5)", borderRadius: 8, padding: "8px 0", fontSize: 10, color: "#fff", cursor: "pointer", letterSpacing: "0.1em" }}>
            AUTHENTICATE →
          </motion.button>
          <div style={{ marginTop: 10, textAlign: "center", fontSize: 8, color: "rgba(139,92,246,0.35)" }}>ZK-AUTH ENABLED · E2E ENCRYPTED</div>
        </motion.div>
      </div>
    );
  }

  if (fileId === "authpy" || fileId === "mainpy") {
    return (
      <div style={{ height: "100%", background: "#0d1117", padding: 16, overflowY: "auto" }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#58a6ff", marginBottom: 4 }}>API Documentation</div>
          <div style={{ fontSize: 9, color: "rgba(88,166,255,0.5)" }}>FastAPI + OAuth2 + JWT(HS512)</div>
        </div>
        {[
          { method: "POST", path: "/auth/token", desc: "Obtain JWT access token", color: "#3fb950" },
          { method: "GET",  path: "/auth/me",    desc: "Current user profile",    color: "#58a6ff" },
          { method: "POST", path: "/auth/refresh", desc: "Refresh access token",  color: "#d29922" },
          { method: "DELETE", path: "/auth/logout", desc: "Revoke session",       color: "#f85149" },
        ].map((ep) => (
          <div key={ep.path} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, marginBottom: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 8, color: ep.color, border: `1px solid ${ep.color}40`, padding: "2px 6px", borderRadius: 4, minWidth: 44, textAlign: "center" }}>{ep.method}</span>
            <span style={{ fontSize: 9, color: "#e6edf3", flex: 1 }}>{ep.path}</span>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{ep.desc}</span>
          </div>
        ))}
      </div>
    );
  }

  if (fileId === "pkgjson") {
    return (
      <div style={{ height: "100%", background: "#1e1e1e", padding: 16, overflowY: "auto" }}>
        <div style={{ fontSize: 11, color: "#d4d4d4", marginBottom: 8 }}>📦 secure-login-portal</div>
        <div style={{ fontSize: 9, color: "#6a9955", marginBottom: 12 }}>// package.json</div>
        {[["react", "^18.3.0", "#61dafb"], ["react-router-dom", "^6.26.0", "#f0f0f0"], ["axios", "^1.7.0", "#5a29e4"], ["@tanstack/react-query", "^5.40.0", "#ff4154"]].map(([pkg, ver, col]) => (
          <div key={pkg} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ fontSize: 9, color: col }}>{pkg}</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{ver}</span>
          </div>
        ))}
      </div>
    );
  }

  // Default preview
  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1117" }}>
      <div style={{ textAlign: "center" }}>
        <Eye style={{ width: 24, height: 24, color: "rgba(139,92,246,0.3)", margin: "0 auto 8px" }} />
        <div style={{ fontSize: 10, color: "rgba(139,92,246,0.4)" }}>Select a file to preview</div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.15)", marginTop: 4 }}>Building: {query || "—"}</div>
      </div>
    </div>
  );
}

// ─── Flat tree ────────────────────────────────────────────────────────────────
function flattenTree(nodes: FileNode[], depth = 0): (FileNode & { depth: number })[] {
  const result: (FileNode & { depth: number })[] = [];
  for (const node of nodes) {
    result.push({ ...node, depth });
    if (node.type === "folder" && node.children) {
      result.push(...flattenTree(node.children, depth + 1));
    }
  }
  return result;
}

// ─── File icon ────────────────────────────────────────────────────────────────
function FileIcon({ type, fileType, open }: { type: string; fileType?: string; open?: boolean }) {
  if (type === "folder") return open
    ? <FolderOpen style={{ width: 10, height: 10, color: "#f59e0b", flexShrink: 0 }} />
    : <Folder style={{ width: 10, height: 10, color: "#f59e0b", flexShrink: 0 }} />;
  const colors: Record<string, string> = { tsx: "#61dafb", py: "#3b82f6", json: "#f59e0b", yml: "#a78bfa", md: "#94a3b8", env: "#00ff64" };
  return <FileCode style={{ width: 9, height: 9, color: colors[fileType ?? ""] ?? "#64748b", flexShrink: 0 }} />;
}

// ─── Code block ───────────────────────────────────────────────────────────────
function CodeBlock({ fileId, highlightLine }: { fileId: string; highlightLine: number }) {
  const lines = CODE_SAMPLES[fileId] ?? [];
  return (
    <div className="font-mono" style={{ fontSize: 9.5, lineHeight: 1.65 }}>
      {lines.map((line, li) => (
        <motion.div key={li} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: li * 0.014, duration: 0.12 }}
          className="flex"
          style={{ background: li === highlightLine ? "rgba(0,229,255,0.07)" : "transparent", borderLeft: li === highlightLine ? "2px solid #00e5ff" : "2px solid transparent", paddingLeft: 4 }}>
          <span style={{ color: "rgba(0,229,255,0.2)", marginRight: 10, userSelect: "none", minWidth: 20, textAlign: "right", fontSize: 8 }}>{li + 1}</span>
          <span>
            {line.tokens.length === 0 ? <>&nbsp;</> : line.tokens.map((tok, ti) => (
              <span key={ti} style={{ color: tok.color }}>{tok.text}</span>
            ))}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Agent Terminal ───────────────────────────────────────────────────────────
function AgentTerminal({ running, customSteps }: { running: boolean; customSteps?: typeof TERMINAL_STEPS }) {
  const [visibleLines, setVisibleLines] = useState<typeof TERMINAL_STEPS>([]);
  const [cursor, setCursor] = useState(true);
  const [done, setDone] = useState(false);
  const termRef = useRef<HTMLDivElement>(null);
  const steps = customSteps ?? TERMINAL_STEPS;

  useEffect(() => {
    if (!running) return;
    setVisibleLines([]); setDone(false);
    let i = 0, cumDelay = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const step of steps) {
      cumDelay += step.delay;
      const t = setTimeout(() => {
        setVisibleLines((prev) => [...prev, step]);
        i++;
        if (i === steps.length) setDone(true);
      }, cumDelay);
      timers.push(t);
    }
    return () => timers.forEach(clearTimeout);
  }, [running]);

  useEffect(() => {
    if (done) { setCursor(false); return; }
    const t = setInterval(() => setCursor((c) => !c), 520);
    return () => clearInterval(t);
  }, [done]);

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [visibleLines]);

  return (
    <div style={{ height: "100%", background: "rgba(0,0,0,0.75)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="flex items-center gap-2 px-3 py-1.5 shrink-0" style={{ background: "rgba(251,191,36,0.06)", borderBottom: "1px solid rgba(251,191,36,0.12)" }}>
        <Terminal style={{ width: 9, height: 9, color: "#f59e0b" }} />
        <span className="font-mono" style={{ fontSize: 8.5, color: "#f59e0b", letterSpacing: "0.1em" }}>AGENT TERMINAL</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {[{ c: "#ff5f57" }, { c: "#ffbd2e" }, { c: "#28ca41" }].map((dot, di) => (
            <div key={di} style={{ width: 6, height: 6, borderRadius: "50%", background: dot.c, opacity: 0.7 }} />
          ))}
        </div>
      </div>
      <div ref={termRef} className="flex-1 overflow-y-auto p-2 font-mono" style={{ fontSize: 9.5, scrollBehavior: "smooth" }}>
        <AnimatePresence initial={false}>
          {visibleLines.map((line, i) => (
            <motion.div key={i} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.1 }}
              style={{ color: line.color ?? "rgba(0,229,255,0.75)", lineHeight: 1.55 }}>
              {line.cmd}
            </motion.div>
          ))}
        </AnimatePresence>
        {running && !done && <span style={{ color: "#f59e0b" }}>{cursor ? "█" : " "}</span>}
        {done && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-1">
            <CheckCircle2 style={{ width: 9, height: 9, color: "#00ff64" }} />
            <span style={{ color: "#00ff64", fontSize: 9 }}>Build complete. All systems nominal.</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Forge Chat ───────────────────────────────────────────────────────────────
interface ForgeMsg { id: string; role: "user" | "forge"; text: string }

const FORGE_RESPONSES: Record<string, string> = {
  default: "◈ Synapse Forge: Understood. Applying changes to the codebase — regenerating affected modules with your specifications...",
  button: "◈ Synapse Forge: Updating button styles across LoginForm.tsx and UI components. Applying new color palette and border-radius tokens...",
  dark: "◈ Synapse Forge: Switching to dark theme — updating Tailwind config, adding CSS variables, and injecting dark-mode overrides across all components...",
  simple: "◈ Synapse Forge: Simplifying component tree — removing unused dependencies and streamlining the auth flow to 3 steps...",
  api: "◈ Synapse Forge: Refactoring API layer — switching to React Query with optimistic updates and automatic retry on network failure...",
};

function getForgeReply(input: string): string {
  const l = input.toLowerCase();
  if (l.includes("button")) return FORGE_RESPONSES.button;
  if (l.includes("dark")) return FORGE_RESPONSES.dark;
  if (l.includes("simpl")) return FORGE_RESPONSES.simple;
  if (l.includes("api") || l.includes("fetch")) return FORGE_RESPONSES.api;
  return FORGE_RESPONSES.default;
}

function ForgeChat({ primaryModelId }: { primaryModelId: string }) {
  const [messages, setMessages] = useState<ForgeMsg[]>([
    { id: "init", role: "forge", text: "◈ Synapse Forge is ready. Type changes or refinements below — I will update the build in real time." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const model = MODELS.find(m => m.id === primaryModelId);

  const send = async () => {
    if (!input.trim() || thinking) return;
    const userMsg: ForgeMsg = { id: Date.now().toString(), role: "user", text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setThinking(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
    const reply = getForgeReply(userMsg.text);
    setMessages(prev => [...prev, { id: Date.now().toString() + "f", role: "forge", text: reply }]);
    setThinking(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "rgba(0,0,0,0.55)" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 shrink-0" style={{ background: "rgba(139,92,246,0.06)", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
        <MessageSquare style={{ width: 9, height: 9, color: "#8b5cf6" }} />
        <span className="font-mono" style={{ fontSize: 8.5, color: "#8b5cf6", letterSpacing: "0.08em" }}>FORGE CHAT</span>
        {model && (
          <span className="font-mono px-1.5 rounded-full ml-auto" style={{ fontSize: 7, color: model.color, border: `1px solid ${model.color}35`, background: `${model.color}0a` }}>
            {model.modelTag}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}
              style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div className="font-mono" style={{
                maxWidth: "88%", padding: "5px 10px", borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                fontSize: 8.5, lineHeight: 1.55,
                background: msg.role === "user" ? "linear-gradient(135deg,rgba(139,92,246,0.25),rgba(139,92,246,0.12))" : "rgba(0,229,255,0.05)",
                border: msg.role === "user" ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(0,229,255,0.1)",
                color: msg.role === "user" ? "rgba(255,255,255,0.85)" : "rgba(0,229,255,0.75)",
                boxShadow: msg.role === "user" ? "0 4px 12px rgba(139,92,246,0.15),inset 0 1px 0 rgba(255,255,255,0.15)" : "none",
              }}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {thinking && (
            <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="font-mono flex items-center gap-1.5" style={{ fontSize: 8, color: "rgba(139,92,246,0.5)", padding: "4px 8px" }}>
                <Sparkles style={{ width: 8, height: 8 }} />
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 0.7 }}>Forge is processing...</motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-2 py-2 shrink-0" style={{ borderTop: "1px solid rgba(139,92,246,0.12)" }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a change... e.g. 'make the button blue'"
          className="flex-1 bg-transparent outline-none font-mono"
          style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", caretColor: "#8b5cf6", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 8, padding: "5px 10px", background: "rgba(139,92,246,0.04)" }} />
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={send} disabled={!input.trim() || thinking}
          style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.35)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Send style={{ width: 10, height: 10, color: "#8b5cf6" }} />
        </motion.button>
      </div>
    </div>
  );
}

// ─── Main ForgePanel ──────────────────────────────────────────────────────────
export function ForgePanel({ query }: { query: string }) {
  const { forgeApiLoading, primaryModel } = useKernel();

  const [selectedFileId, setSelectedFileId] = useState("LoginForm");
  const [highlightLine, setHighlightLine] = useState(9);
  const [closedFolders, setClosedFolders] = useState<Set<string>>(new Set());
  const [agentRunning] = useState(true);
  const [downloadFlash, setDownloadFlash] = useState(false);
  const [phase, setPhase] = useState<"scaffold" | "ready">("scaffold");
  const [activeView, setActiveView] = useState<"code" | "preview">("code");
  const [pane, setPane] = useState<"terminal" | "chat">("terminal");

  // Animate highlight line
  useEffect(() => {
    const lines = CODE_SAMPLES[selectedFileId]?.length ?? 0;
    if (lines === 0) return;
    const t = setInterval(() => {
      setHighlightLine(Math.floor(Math.random() * lines));
    }, 1800);
    return () => clearInterval(t);
  }, [selectedFileId]);

  // Transition scaffold → ready
  useEffect(() => {
    const totalDelay = TERMINAL_STEPS.reduce((s, x) => s + x.delay, 0) + 800;
    const t = setTimeout(() => setPhase("ready"), totalDelay);
    return () => clearTimeout(t);
  }, []);

  const flatTree = flattenTree(FILE_TREE);
  const toggleFolder = (id: string) => {
    setClosedFolders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDownload = () => {
    setDownloadFlash(true);
    setTimeout(() => setDownloadFlash(false), 1200);
  };

  const isLoading = forgeApiLoading;
  const model = MODELS.find((m) => m.id === primaryModel);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* ── Forge header bar ── */}
      <div className="flex items-center gap-3 px-4 py-2 shrink-0"
        style={{ background: "rgba(251,191,36,0.06)", borderBottom: "1px solid rgba(251,191,36,0.18)" }}>
        <motion.div animate={{ rotate: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 1.8 }}>
          <Hammer style={{ width: 14, height: 14, color: "#f59e0b" }} />
        </motion.div>
        <div>
          <div className="font-mono tracking-widest" style={{ fontSize: 12, color: "#f59e0b", letterSpacing: "0.1em" }}>
            SYNAPSE FORGE
          </div>
          <div className="font-mono" style={{ fontSize: 8, color: "rgba(251,191,36,0.4)" }}>
            {query || "Waiting for build prompt..."}
          </div>
        </div>

        {/* Model badge */}
        {model && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded ml-2" style={{ background: `${model.color}0a`, border: `1px solid ${model.color}30` }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: model.color, boxShadow: `0 0 6px ${model.color}` }} />
            <span className="font-mono" style={{ fontSize: 8, color: model.color }}>{model.modelTag}</span>
          </div>
        )}

        {/* View toggle: code / preview */}
        <div className="flex items-center gap-1 ml-auto">
          {[{ key: "code", icon: Code2, label: "CODE" }, { key: "preview", icon: Eye, label: "PREVIEW" }].map((v) => (
            <motion.button key={v.key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveView(v.key as any)}
              style={{
                display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, cursor: "pointer", border: "1px solid",
                fontSize: 8, fontFamily: "monospace",
                background: activeView === v.key ? "rgba(251,191,36,0.12)" : "transparent",
                borderColor: activeView === v.key ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.08)",
                color: activeView === v.key ? "#f59e0b" : "rgba(255,255,255,0.3)",
              }}>
              <v.icon style={{ width: 9, height: 9 }} />
              {v.label}
            </motion.button>
          ))}
        </div>

        {/* Phase badge */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded"
          style={{ background: phase === "ready" ? "rgba(0,255,100,0.06)" : "rgba(251,191,36,0.06)", border: `1px solid ${phase === "ready" ? "rgba(0,255,100,0.25)" : "rgba(251,191,36,0.2)"}` }}>
          {phase === "scaffold"
            ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Loader style={{ width: 9, height: 9, color: "#f59e0b" }} /></motion.div>
            : <CheckCircle2 style={{ width: 9, height: 9, color: "#00ff64" }} />}
          <span className="font-mono" style={{ fontSize: 8, color: phase === "ready" ? "#00ff64" : "#f59e0b" }}>
            {phase === "ready" ? "BUILD READY" : "BUILDING..."}
          </span>
        </div>

        {/* Download */}
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scaleX: 1.05, scaleY: 0.92 }} onClick={handleDownload}
          style={{
            display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 8,
            background: downloadFlash ? "rgba(0,229,255,0.15)" : "linear-gradient(135deg,rgba(0,229,255,0.1),rgba(0,229,255,0.03))",
            border: `1px solid ${downloadFlash ? "rgba(0,229,255,0.5)" : "rgba(0,229,255,0.22)"}`,
            boxShadow: "0 4px 12px rgba(0,229,255,0.12),inset 0 1px 0 rgba(255,255,255,0.15)",
            cursor: "pointer", transition: "all 0.25s ease",
          }}>
          <Download style={{ width: 10, height: 10, color: "#00e5ff" }} />
          <span className="font-mono" style={{ fontSize: 9, color: "#00e5ff" }}>DOWNLOAD</span>
        </motion.button>
      </div>

      {/* ── Main area: file tree + code/preview ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

        {/* File tree sidebar */}
        <div style={{ width: 180, minWidth: 180, background: "rgba(0,0,0,0.35)", borderRight: "1px solid rgba(251,191,36,0.1)", overflowY: "auto" }}>
          <div className="px-2 py-1.5 font-mono" style={{ fontSize: 8, color: "rgba(251,191,36,0.4)", letterSpacing: "0.1em", borderBottom: "1px solid rgba(251,191,36,0.08)" }}>
            EXPLORER
          </div>
          {flatTree.map((node) => {
            if (node.type === "folder" && node.depth > 0) {
              const parentId = flatTree.find(n => n.children?.some(c => c.id === node.id))?.id;
              if (parentId && closedFolders.has(parentId)) return null;
            }
            const isOpen = !closedFolders.has(node.id);
            const isSelected = selectedFileId === node.id;

            return (
              <motion.div key={node.id} whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                onClick={() => node.type === "folder" ? toggleFolder(node.id) : setSelectedFileId(node.id)}
                className="flex items-center gap-1 py-0.5 px-2 cursor-pointer"
                style={{ paddingLeft: 8 + node.depth * 12, background: isSelected ? "rgba(251,191,36,0.08)" : "transparent", borderLeft: isSelected ? "1.5px solid rgba(251,191,36,0.5)" : "1.5px solid transparent" }}>
                <FileIcon type={node.type} fileType={node.fileType} open={isOpen} />
                <span className="font-mono truncate" style={{ fontSize: 8.5, color: isSelected ? "#f59e0b" : "rgba(255,255,255,0.55)" }}>{node.name}</span>
                {node.type === "file" && phase === "scaffold" && (
                  <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
                    style={{ width: 3, height: 3, borderRadius: "50%", background: "#f59e0b", marginLeft: "auto", flexShrink: 0 }} />
                )}
              </motion.div>
            );
          })}

          {/* Stats footer */}
          <div className="px-2 py-2 font-mono" style={{ borderTop: "1px solid rgba(251,191,36,0.08)", marginTop: 4 }}>
            <div style={{ fontSize: 7.5, color: "rgba(251,191,36,0.35)" }}>Files: 12 · Lines: ~423</div>
            <div style={{ fontSize: 7.5, color: "rgba(251,191,36,0.25)" }}>TS/PY · PQC-sealed</div>
          </div>
        </div>

        {/* Code or Preview pane */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <AnimatePresence mode="wait">
            {activeView === "code" ? (
              <motion.div key="code" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }} style={{ height: "100%", overflow: "auto", padding: "12px 16px" }}>
                {/* File tab */}
                <div className="flex items-center gap-2 mb-3">
                  <FileIcon type="file" fileType={flatTree.find(n => n.id === selectedFileId)?.fileType} />
                  <span className="font-mono" style={{ fontSize: 9, color: "rgba(251,191,36,0.6)" }}>
                    {flatTree.find(n => n.id === selectedFileId)?.name ?? selectedFileId}
                  </span>
                  {isLoading && (
                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}
                      className="flex items-center gap-1 ml-auto">
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#f59e0b" }} />
                      <span className="font-mono" style={{ fontSize: 7.5, color: "#f59e0b" }}>WRITING...</span>
                    </motion.div>
                  )}
                </div>
                <CodeBlock fileId={selectedFileId} highlightLine={highlightLine} />
              </motion.div>
            ) : (
              <motion.div key="preview" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                {/* Browser chrome */}
                <div style={{ background: "#1c1c1e", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "6px 12px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <div style={{ display: "flex", gap: 5 }}>
                    {["#ff5f57", "#ffbd2e", "#28ca41"].map((c, i) => (
                      <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                    ))}
                  </div>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "3px 10px", fontSize: 8, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                    localhost:3000 / {selectedFileId === "LoginForm" ? "" : selectedFileId.toLowerCase()}
                  </div>
                  <motion.div animate={{ opacity: [1, 0.6, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "#28ca41", boxShadow: "0 0 6px #28ca41" }} />
                </div>
                {/* Preview content */}
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <LivePreview fileId={selectedFileId} query={query} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom pane: terminal + chat tabs ── */}
      <div style={{ height: 200, borderTop: "1px solid rgba(251,191,36,0.15)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Pane tabs */}
        <div className="flex items-center" style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {[{ key: "terminal", icon: Terminal, label: "TERMINAL", color: "#f59e0b" }, { key: "chat", icon: MessageSquare, label: "FORGE CHAT", color: "#8b5cf6" }].map((t) => (
            <button key={t.key} onClick={() => setPane(t.key as any)}
              style={{
                display: "flex", alignItems: "center", gap: 4, padding: "6px 14px", cursor: "pointer",
                background: "none", border: "none", borderBottom: pane === t.key ? `2px solid ${t.color}` : "2px solid transparent",
                color: pane === t.key ? t.color : "rgba(255,255,255,0.3)", fontSize: 8, fontFamily: "monospace",
                transition: "all 0.2s ease",
              }}>
              <t.icon style={{ width: 8, height: 8 }} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Pane content */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            {pane === "terminal" ? (
              <motion.div key="term" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: "100%" }}>
                <AgentTerminal running={agentRunning} />
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: "100%" }}>
                <ForgeChat primaryModelId={primaryModel} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
