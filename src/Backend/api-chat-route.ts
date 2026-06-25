/**
 * ════════════════════════════════════════════════════════════════════════════
 *  AEGIS-PRIME :: /api/chat  — Universal Chat Dispatcher
 *
 *  USAGE: Copy this file to  app/api/chat/route.ts  in your Next.js project.
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
 *  RESPONSE (JSON)       { response: string, model: string, latencyMs: number }
 * ════════════════════════════════════════════════════════════════════════════
 */

// ─── Next.js types (uncomment in a real Next.js project) ─────────────────────
// import { NextRequest, NextResponse } from "next/server";

// ─── OpenAI (uncomment + npm install openai) ──────────────────────────────────
// import OpenAI from "openai";
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Anthropic (uncomment + npm install @anthropic-ai/sdk) ───────────────────
// import Anthropic from "@anthropic-ai/sdk";
// const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Local mock types (used only in this Vite project for reference) ─────────
interface ChatRequestBody { prompt: string; model: string; }
interface ChatResponse { response: string; model: string; latencyMs: number; }

// ─── Model router ─────────────────────────────────────────────────────────────
// In your Next.js project, replace the mock returns below with real API calls.
async function dispatchToModel(prompt: string, model: string): Promise<string> {
  switch (model) {

    case "gpt-4o": {
      // PRODUCTION:
      // const completion = await openai.chat.completions.create({
      //   model: "gpt-4o",
      //   messages: [{ role: "user", content: prompt }],
      //   temperature: 0.7,
      //   max_tokens: 2048,
      // });
      // return completion.choices[0].message.content ?? "";
      return `[GPT-4o MOCK] Prompt: "${prompt}" — replace this with the OpenAI call above.`;
    }

    case "claude": {
      // PRODUCTION:
      // const message = await anthropic.messages.create({
      //   model: "claude-3-5-sonnet-20241022",
      //   max_tokens: 2048,
      //   messages: [{ role: "user", content: prompt }],
      // });
      // const block = message.content[0];
      // return block.type === "text" ? block.text : "";
      return `[Claude MOCK] Prompt: "${prompt}" — replace this with the Anthropic call above.`;
    }

    case "mistral-local": {
      // PRODUCTION (Ollama):
      // const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
      // const res = await fetch(`${baseUrl}/api/generate`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ model: "mistral", prompt, stream: false }),
      // });
      // const data = await res.json();
      // return data.response ?? "";
      return `[Mistral-Local MOCK] Prompt: "${prompt}" — replace with Ollama call above.`;
    }

    case "llama-local": {
      // PRODUCTION (Ollama):
      // const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
      // const res = await fetch(`${baseUrl}/api/generate`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ model: "llama3", prompt, stream: false }),
      // });
      // const data = await res.json();
      // return data.response ?? "";
      return `[Llama-Local MOCK] Prompt: "${prompt}" — replace with Ollama call above.`;
    }

    case "mixer": {
      // PRODUCTION (parallel fan-out):
      // const [gptResp, claudeResp] = await Promise.all([
      //   dispatchToModel(prompt, "gpt-4o"),
      //   dispatchToModel(prompt, "claude"),
      // ]);
      // // Meta-synthesis call:
      // const synthesis = await openai.chat.completions.create({
      //   model: "gpt-4o",
      //   messages: [{
      //     role: "user",
      //     content: `Synthesize these two AI responses:\nGPT-4o: ${gptResp}\nClaude: ${claudeResp}`,
      //   }],
      // });
      // return synthesis.choices[0].message.content ?? "";
      return `[Mixer MOCK] Fan-out + synthesis for: "${prompt}" — replace with parallel calls above.`;
    }

    default:
      return `Unknown model "${model}". Valid values: gpt-4o, claude, mistral-local, llama-local, mixer.`;
  }
}

// ─── Route handler (Next.js App Router format) ───────────────────────────────
// In your Next.js project, restore these exports:
//
// export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse | { error: string }>> {
//   const startMs = Date.now();
//   try {
//     const body = (await request.json()) as ChatRequestBody;
//     const { prompt, model } = body;
//     if (!prompt?.trim()) return NextResponse.json({ error: "prompt is required" }, { status: 400 });
//     if (!model?.trim())  return NextResponse.json({ error: "model is required" }, { status: 400 });
//     const response = await dispatchToModel(prompt, model);
//     return NextResponse.json({ response, model, latencyMs: Date.now() - startMs });
//   } catch (err) {
//     console.error("[/api/chat] Error:", err);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }
//
// export async function GET(): Promise<NextResponse> {
//   return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 });
// }

// ─── Standalone mock handler (used by the Vite frontend in this project) ─────
export async function handleChatRequest(body: ChatRequestBody): Promise<ChatResponse> {
  const startMs = Date.now();
  if (!body.prompt?.trim()) throw new Error("prompt is required");
  if (!body.model?.trim())  throw new Error("model is required");
  const response = await dispatchToModel(body.prompt, body.model);
  return { response, model: body.model, latencyMs: Date.now() - startMs };
}
