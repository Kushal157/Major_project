/**
 * ════════════════════════════════════════════════════════════════════════════
 *  AEGIS-PRIME :: /api/forge  — Synapse Forge Agentic Builder Dispatcher
 *
 *  USAGE: Copy this file to  app/api/forge/route.ts  in your Next.js project.
 *  Install dependencies first:
 *
 *    npm install next openai @anthropic-ai/sdk
 *
 *  Then add to .env.local:
 *    OPENAI_API_KEY=sk-...
 *    ANTHROPIC_API_KEY=sk-ant-...
 *    OLLAMA_BASE_URL=http://localhost:11434
 *
 *  REQUEST  (POST JSON)  { prompt: string, model: string }
 *  RESPONSE (JSON)       ForgeResponse — see type below
 * ════════════════════════════════════════════════════════════════════════════
 */

// ─── Next.js types (uncomment in a real Next.js project) ─────────────────────
// import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ForgeRequestBody { prompt: string; model: string; }

interface FileNode {
  id: string;
  name: string;
  type: "folder" | "file";
  fileType?: "tsx" | "py" | "json" | "md" | "yml" | "env";
  children?: FileNode[];
}

export interface ForgeResponse {
  projectName: string;
  fileTree: FileNode[];
  firstFileId: string;
  stats: { files: number; lines: number; lang: string };
  terminalLog: string[];
}

// ─── System prompt for the LLM ───────────────────────────────────────────────
const FORGE_SYSTEM_PROMPT = `You are Synapse Forge, an agentic full-stack code generator.
Given a user request, return ONLY valid JSON with this exact shape:
{
  "projectName": "kebab-case-name",
  "fileTree": [ /* recursive FileNode array */ ],
  "firstFileId": "id-of-first-important-file",
  "stats": { "files": <number>, "lines": <number>, "lang": "<stack>" },
  "terminalLog": ["<shell command>", ...]
}
Respond ONLY with valid JSON. No markdown. No commentary.`;

// ─── Model dispatcher ─────────────────────────────────────────────────────────
async function dispatchForge(prompt: string, model: string): Promise<ForgeResponse> {
  switch (model) {

    case "gpt-4o": {
      // PRODUCTION:
      // import OpenAI from "openai";
      // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      // const completion = await openai.chat.completions.create({
      //   model: "gpt-4o",
      //   response_format: { type: "json_object" },
      //   messages: [
      //     { role: "system", content: FORGE_SYSTEM_PROMPT },
      //     { role: "user", content: prompt },
      //   ],
      //   temperature: 0.3,
      //   max_tokens: 4096,
      // });
      // const raw = completion.choices[0].message.content ?? "{}";
      // return JSON.parse(raw) as ForgeResponse;
      return buildMockForgeResponse(prompt, "GPT-4o");
    }

    case "claude": {
      // PRODUCTION:
      // import Anthropic from "@anthropic-ai/sdk";
      // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      // const message = await client.messages.create({
      //   model: "claude-3-5-sonnet-20241022",
      //   max_tokens: 4096,
      //   system: FORGE_SYSTEM_PROMPT,
      //   messages: [{ role: "user", content: prompt }],
      // });
      // const block = message.content[0];
      // const raw = block.type === "text" ? block.text : "{}";
      // return JSON.parse(raw) as ForgeResponse;
      return buildMockForgeResponse(prompt, "Claude");
    }

    case "mistral-local": {
      // PRODUCTION (Ollama):
      // const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
      // const res = await fetch(`${baseUrl}/api/generate`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     model: "mistral",
      //     prompt: `${FORGE_SYSTEM_PROMPT}\n\nUser: ${prompt}`,
      //     stream: false,
      //     format: "json",
      //   }),
      // });
      // const data = await res.json();
      // return JSON.parse(data.response) as ForgeResponse;
      return buildMockForgeResponse(prompt, "Mistral-Local");
    }

    case "llama-local": {
      // PRODUCTION (Ollama):
      // const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
      // const res = await fetch(`${baseUrl}/api/generate`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     model: "llama3",
      //     prompt: `${FORGE_SYSTEM_PROMPT}\n\nUser: ${prompt}`,
      //     stream: false,
      //     format: "json",
      //   }),
      // });
      // const data = await res.json();
      // return JSON.parse(data.response) as ForgeResponse;
      return buildMockForgeResponse(prompt, "Llama-3-Local");
    }

    case "mixer": {
      // PRODUCTION (parallel fan-out + merge):
      // const [gptForge, claudeForge] = await Promise.all([
      //   dispatchForge(prompt, "gpt-4o"),
      //   dispatchForge(prompt, "claude"),
      // ]);
      // return {
      //   ...gptForge,
      //   fileTree: mergeFileTrees(gptForge.fileTree, claudeForge.fileTree),
      //   stats: {
      //     files: gptForge.stats.files + claudeForge.stats.files,
      //     lines: gptForge.stats.lines + claudeForge.stats.lines,
      //     lang: `${gptForge.stats.lang} / ${claudeForge.stats.lang}`,
      //   },
      //   terminalLog: [...gptForge.terminalLog, ...claudeForge.terminalLog],
      // };
      return buildMockForgeResponse(prompt, "Synapse-Mixer");
    }

    default:
      return buildMockForgeResponse(prompt, `Unknown(${model})`);
  }
}

// ─── Mock response builder ────────────────────────────────────────────────────
function buildMockForgeResponse(prompt: string, modelLabel: string): ForgeResponse {
  const slug = prompt.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim().split(" ").slice(0, 4).join("-");
  const projectName = slug || "aegis-project";

  const fileTree: FileNode[] = [
    {
      id: "root", name: `${projectName}/`, type: "folder",
      children: [
        {
          id: "frontend", name: "frontend/", type: "folder",
          children: [
            {
              id: "src", name: "src/", type: "folder",
              children: [
                {
                  id: "components", name: "components/", type: "folder",
                  children: [
                    { id: "LoginForm",     name: "LoginForm.tsx",     type: "file", fileType: "tsx" },
                    { id: "AuthGuard",     name: "AuthGuard.tsx",     type: "file", fileType: "tsx" },
                    { id: "SessionBanner", name: "SessionBanner.tsx", type: "file", fileType: "tsx" },
                  ],
                },
                { id: "App",  name: "App.tsx",  type: "file", fileType: "tsx" },
                { id: "main", name: "main.tsx", type: "file", fileType: "tsx" },
              ],
            },
            { id: "pkgjson", name: "package.json", type: "file", fileType: "json" },
          ],
        },
        {
          id: "backend", name: "backend/", type: "folder",
          children: [
            { id: "mainpy",   name: "main.py",          type: "file", fileType: "py" },
            { id: "authpy",   name: "auth.py",          type: "file", fileType: "py" },
            { id: "modelspy", name: "models.py",        type: "file", fileType: "py" },
            { id: "reqtxt",   name: "requirements.txt", type: "file", fileType: "md" },
          ],
        },
        { id: "compose", name: "docker-compose.yml", type: "file", fileType: "yml" },
        { id: "envfile", name: ".env.example",        type: "file", fileType: "env" },
        { id: "readme",  name: "README.md",           type: "file", fileType: "md" },
      ],
    },
  ];

  return {
    projectName,
    fileTree,
    firstFileId: "LoginForm",
    stats: { files: 12, lines: 423, lang: "TS / Python" },
    terminalLog: [
      `> [Synapse Forge :: ${modelLabel}] Received: "${prompt.slice(0, 60)}..."`,
      `> mkdir -p ${projectName}/{frontend/src/components,backend}`,
      `> npx create-vite@latest frontend --template react-ts`,
      `  ✓ React + TypeScript scaffolded`,
      `> [AGENT] Generating LoginForm.tsx, AuthGuard.tsx, SessionBanner.tsx...`,
      `  ✓ Component files written`,
      `> pip install fastapi uvicorn passlib[argon2] python-jose`,
      `  ✓ Backend dependencies installed`,
      `> [${modelLabel}] BUILD COMPLETE`,
    ],
  };
}

// ─── Next.js Route handler (restore in your Next.js project) ─────────────────
//
// export async function POST(request: NextRequest): Promise<NextResponse<ForgeResponse | { error: string }>> {
//   try {
//     const body = (await request.json()) as ForgeRequestBody;
//     const { prompt, model } = body;
//     if (!prompt?.trim()) return NextResponse.json({ error: "prompt is required" }, { status: 400 });
//     if (!model?.trim())  return NextResponse.json({ error: "model is required" }, { status: 400 });
//     const forgeData = await dispatchForge(prompt, model);
//     return NextResponse.json(forgeData);
//   } catch (err) {
//     console.error("[/api/forge] Error:", err);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }
//
// export async function GET(): Promise<NextResponse> {
//   return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 });
// }

// ─── Standalone mock handler (used by the Vite frontend in this project) ─────
export async function handleForgeRequest(body: ForgeRequestBody): Promise<ForgeResponse> {
  if (!body.prompt?.trim()) throw new Error("prompt is required");
  if (!body.model?.trim())  throw new Error("model is required");
  return dispatchForge(body.prompt, body.model);
}

// Export for reference
export { FORGE_SYSTEM_PROMPT };
