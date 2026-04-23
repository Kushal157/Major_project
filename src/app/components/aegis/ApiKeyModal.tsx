import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Eye, EyeOff, Key, CheckCircle2, ExternalLink, AlertTriangle } from "lucide-react";
import { useKernel, ApiKeys } from "./KernelContext";

interface ProviderConfig {
  key: keyof ApiKeys;
  label: string;
  shortName: string;
  color: string;
  borderColor: string;
  bgColor: string;
  placeholder: string;
  getKeyUrl: string;
  models: string[];
  note?: string;
}

const PROVIDERS: ProviderConfig[] = [
  {
    key: "groq",
    label: "Groq API Key",
    shortName: "GROQ",
    color: "#00e5ff",
    borderColor: "rgba(0,229,255,0.4)",
    bgColor: "rgba(0,229,255,0.06)",
    placeholder: "gsk_••••••••••••••••••••••••••••••••••••••••••••••••••",
    getKeyUrl: "https://console.groq.com/keys",
    models: ["Llama-3.3-70B", "Mixtral-8x7B"],
    note: "Free tier available — fastest inference",
  },
  {
    key: "openai",
    label: "OpenAI API Key",
    shortName: "OPENAI",
    color: "#8b5cf6",
    borderColor: "rgba(139,92,246,0.4)",
    bgColor: "rgba(139,92,246,0.06)",
    placeholder: "sk-••••••••••••••••••••••••••••••••••••••••••••••••••",
    getKeyUrl: "https://platform.openai.com/api-keys",
    models: ["GPT-4o"],
    note: "Requires billing setup on OpenAI platform",
  },
  {
    key: "openrouter",
    label: "OpenRouter API Key",
    shortName: "OPENROUTER",
    color: "#ff9500",
    borderColor: "rgba(255,149,0,0.4)",
    bgColor: "rgba(255,149,0,0.06)",
    placeholder: "sk-or-••••••••••••••••••••••••••••••••••••••••••••••",
    getKeyUrl: "https://openrouter.ai/keys",
    models: ["Claude-3.5-Sonnet", "Qwen-2.5-72B"],
    note: "Single key for Claude + Qwen — pay-per-use",
  },
  {
    key: "google",
    label: "Gemini API Key",
    shortName: "GOOGLE",
    color: "#a78bfa",
    borderColor: "rgba(167,139,250,0.4)",
    bgColor: "rgba(167,139,250,0.06)",
    placeholder: "AIzaSy•••••••••••••••••••••••••••••••••••••",
    getKeyUrl: "https://aistudio.google.com/app/apikey",
    models: ["Gemini-1.5-Flash"],
    note: "Free tier available on Google AI Studio",
  },
];

export function ApiKeyModal() {
  const { apiKeyModalOpen, setApiKeyModalOpen, apiKeys, setApiKeys } = useKernel();
  const [localKeys, setLocalKeys] = useState<ApiKeys>({ ...apiKeys });
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKeys(localKeys);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClose = () => {
    setLocalKeys({ ...apiKeys });
    setApiKeyModalOpen(false);
  };

  const toggleShow = (key: string) => {
    setShowKey((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasAnyKey = Object.values(localKeys).some((v) => v.trim().length > 0);

  return (
    <AnimatePresence>
      {apiKeyModalOpen && (
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

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              position: "fixed",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(540px, 94vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "rgba(4,8,28,0.98)",
              border: "1px solid rgba(0,229,255,0.25)",
              borderRadius: 8,
              boxShadow: "0 0 60px rgba(0,229,255,0.08), 0 0 120px rgba(139,92,246,0.06)",
              zIndex: 2001,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 shrink-0"
              style={{ borderBottom: "1px solid rgba(0,229,255,0.12)", background: "rgba(0,0,0,0.3)" }}
            >
              <div className="flex items-center gap-3">
                <div style={{ position: "relative" }}>
                  <Key style={{ width: 16, height: 16, color: "#00e5ff" }} />
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{
                      position: "absolute", inset: -3,
                      border: "1px solid rgba(0,229,255,0.3)",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                <div>
                  <div className="font-mono tracking-widest" style={{ fontSize: 12, color: "#00e5ff" }}>
                    API KEY VAULT
                  </div>
                  <div className="font-mono" style={{ fontSize: 9, color: "rgba(0,229,255,0.4)" }}>
                    PQC-encrypted local storage
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex items-center justify-center rounded"
                style={{
                  width: 28, height: 28,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(0,229,255,0.15)",
                  color: "rgba(0,229,255,0.6)",
                  cursor: "pointer",
                }}
              >
                <X style={{ width: 12, height: 12 }} />
              </button>
            </div>

            {/* Security notice */}
            <div
              className="flex items-start gap-2 mx-6 mt-4 px-3 py-2 rounded"
              style={{ background: "rgba(255,149,0,0.06)", border: "1px solid rgba(255,149,0,0.2)" }}
            >
              <AlertTriangle style={{ width: 12, height: 12, color: "#ff9500", flexShrink: 0, marginTop: 1 }} />
              <div className="font-mono" style={{ fontSize: 8.5, color: "rgba(255,149,0,0.75)", lineHeight: 1.6 }}>
                Keys are stored in browser localStorage only — never transmitted to any third party.
                Each key is used only to call its respective provider API directly from your browser.
                Clear browser data to remove keys.
              </div>
            </div>

            {/* Provider sections */}
            <div className="px-6 py-4 flex flex-col gap-4">
              {PROVIDERS.map((provider) => {
                const value = localKeys[provider.key];
                const isSet = value?.trim().length > 0;
                const isVisible = showKey[provider.key];

                return (
                  <div
                    key={provider.key}
                    className="rounded p-4"
                    style={{
                      background: provider.bgColor,
                      border: `1px solid ${isSet ? provider.borderColor : "rgba(0,229,255,0.1)"}`,
                      transition: "border-color 0.2s ease",
                    }}
                  >
                    {/* Provider header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono px-1.5 py-0.5 rounded"
                          style={{
                            fontSize: 8,
                            color: provider.color,
                            border: `1px solid ${provider.borderColor}`,
                            background: `${provider.bgColor}`,
                          }}
                        >
                          {provider.shortName}
                        </span>
                        <span className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                          {provider.label}
                        </span>
                        {isSet && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <CheckCircle2 style={{ width: 10, height: 10, color: "#00ff64" }} />
                          </motion.div>
                        )}
                      </div>
                      <a
                        href={provider.getKeyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-mono"
                        style={{ fontSize: 8, color: provider.color, textDecoration: "none", opacity: 0.7 }}
                      >
                        Get Key <ExternalLink style={{ width: 9, height: 9 }} />
                      </a>
                    </div>

                    {/* Models list */}
                    <div className="flex items-center gap-1.5 mb-2">
                      {provider.models.map((m) => (
                        <span
                          key={m}
                          className="font-mono px-1 rounded"
                          style={{ fontSize: 7.5, color: `${provider.color}aa`, border: `1px solid ${provider.color}25`, background: `${provider.color}0a` }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>

                    {/* Input */}
                    <div
                      className="flex items-center gap-2 rounded px-3 py-2"
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        border: `1px solid ${isSet ? provider.borderColor : "rgba(0,229,255,0.1)"}`,
                      }}
                    >
                      <input
                        type={isVisible ? "text" : "password"}
                        value={value || ""}
                        onChange={(e) => setLocalKeys((prev) => ({ ...prev, [provider.key]: e.target.value }))}
                        placeholder={provider.placeholder}
                        className="flex-1 bg-transparent outline-none font-mono"
                        style={{ fontSize: 9.5, color: isSet ? provider.color : "rgba(255,255,255,0.35)" }}
                        autoComplete="off"
                        spellCheck={false}
                      />
                      <button
                        onClick={() => toggleShow(provider.key)}
                        style={{ color: "rgba(0,229,255,0.4)", cursor: "pointer", background: "none", border: "none", padding: 0 }}
                      >
                        {isVisible
                          ? <EyeOff style={{ width: 12, height: 12 }} />
                          : <Eye style={{ width: 12, height: 12 }} />
                        }
                      </button>
                      {value && (
                        <button
                          onClick={() => setLocalKeys((prev) => ({ ...prev, [provider.key]: "" }))}
                          style={{ color: "rgba(255,45,155,0.5)", cursor: "pointer", background: "none", border: "none", padding: 0 }}
                        >
                          <X style={{ width: 11, height: 11 }} />
                        </button>
                      )}
                    </div>

                    {/* Note */}
                    {provider.note && (
                      <div className="font-mono mt-1.5" style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>
                        ↳ {provider.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderTop: "1px solid rgba(0,229,255,0.1)", background: "rgba(0,0,0,0.2)" }}
            >
              <div className="font-mono" style={{ fontSize: 8, color: "rgba(0,229,255,0.3)" }}>
                {hasAnyKey ? "Keys configured — APIs will be called directly" : "No keys set — demo mode active"}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClose}
                  className="font-mono px-3 py-1.5 rounded"
                  style={{
                    fontSize: 10, color: "rgba(0,229,255,0.5)",
                    border: "1px solid rgba(0,229,255,0.2)", background: "transparent", cursor: "pointer",
                  }}
                >
                  CANCEL
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  className="font-mono px-4 py-1.5 rounded flex items-center gap-2"
                  style={{
                    fontSize: 10,
                    color: saved ? "#00ff64" : "#00e5ff",
                    border: `1px solid ${saved ? "rgba(0,255,100,0.4)" : "rgba(0,229,255,0.4)"}`,
                    background: saved ? "rgba(0,255,100,0.08)" : "rgba(0,229,255,0.1)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {saved ? (
                      <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-1">
                        <CheckCircle2 style={{ width: 10, height: 10 }} /> SAVED
                      </motion.span>
                    ) : (
                      <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        SAVE KEYS
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
