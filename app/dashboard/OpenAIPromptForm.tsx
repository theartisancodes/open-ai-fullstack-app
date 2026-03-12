"use client";

import Link from "next/link";
import { useState } from "react";

type ApiResult =
  | { ok: true; output: string; responseId?: string }
  | { ok: false; error: string; detail?: string };

export default function OpenAIPromptForm() {
  const [prompt, setPrompt] = useState("");
  const [instructions, setInstructions] = useState("");
  const [maxTokens, setMaxTokens] = useState("");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          ...(instructions.trim() ? { instructions: instructions.trim() } : {}),
          ...(maxTokens.trim() ? { max_output_tokens: parseInt(maxTokens, 10) } : {}),
        }),
      });
      const data = (await res.json()) as ApiResult & { responseId?: string; detail?: string };
      if (!res.ok) {
        const message =
          res.status === 401
            ? "Sign in required."
            : (data as { error?: string }).error ?? "Request failed";
        setResult({
          ok: false,
          error: message,
          detail: (data as { detail?: string }).detail,
        });
        return;
      }
      setResult({
        ok: true,
        output: (data as { output?: string }).output ?? "",
        responseId: (data as { responseId?: string }).responseId,
      });
    } catch (err) {
      setResult({
        ok: false,
        error: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-lg border border-zinc-200 p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Try OpenAI</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Send a prompt to the Responses API and see the result below.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-zinc-700">
            Prompt (required)
          </label>
          <input
            id="prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Write a short welcome message"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            required
          />
        </div>
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-zinc-700">
            Instructions (optional)
          </label>
          <input
            id="instructions"
            type="text"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. You are a helpful assistant. Be concise."
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <div>
          <label htmlFor="max_tokens" className="block text-sm font-medium text-zinc-700">
            Max output tokens (optional)
          </label>
          <input
            id="max_tokens"
            type="number"
            min={1}
            value={maxTokens}
            onChange={(e) => setMaxTokens(e.target.value)}
            placeholder="e.g. 500"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </form>
      {result && (
        <div className="mt-6 rounded-md border border-zinc-200 bg-zinc-50 p-4">
          {result.ok ? (
            <>
              <p className="text-sm font-medium text-zinc-700">Output</p>
              <p className="mt-1 whitespace-pre-wrap text-zinc-900">{result.output}</p>
              {result.responseId && (
                <p className="mt-2 text-xs text-zinc-500">Response ID: {result.responseId}</p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-red-700">Error</p>
              <p className="mt-1 text-red-800">{result.error}</p>
              {result.detail && (
                <p className="mt-1 text-xs text-red-600/70">{result.detail}</p>
              )}
              {result.error === "Sign in required." && (
                <Link
                  href="/auth?callbackUrl=/dashboard"
                  className="mt-2 inline-block text-sm font-medium text-zinc-700 underline"
                >
                  Go to sign in
                </Link>
              )}
            </>
          )}
        </div>
      )}

      <StreamTest />
    </div>
  );
}

function StreamTest() {
  const [prompt, setPrompt] = useState("");
  const [streamed, setStreamed] = useState("");
  const [streamError, setStreamError] = useState("");
  const [streaming, setStreaming] = useState(false);

  async function handleStream() {
    if (!prompt.trim()) return;
    setStreamed("");
    setStreamError("");
    setStreaming(true);
    try {
      const res = await fetch("/api/openai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStreamError((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      const reader = res.body?.getReader();
      if (!reader) {
        setStreamError("No response body");
        return;
      }
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6)) as { type: string; delta?: string; error?: string };
              if (data.type === "delta" && data.delta) setStreamed((s) => s + data.delta);
              if (data.type === "error") setStreamError(data.error ?? "Stream error");
            } catch {
              // skip non-JSON lines
            }
          }
        }
      }
    } catch (err) {
      setStreamError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="mt-8 rounded-lg border border-zinc-200 p-6">
      <h2 className="text-lg font-semibold text-zinc-900">Stream test</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Stream a response from <code className="rounded bg-zinc-200 px-1">/api/openai/stream</code>.
      </p>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Prompt for streaming"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        <button
          type="button"
          onClick={handleStream}
          disabled={streaming || !prompt.trim()}
          className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {streaming ? "Streaming…" : "Stream"}
        </button>
      </div>
      {(streamed || streamError) && (
        <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-4">
          {streamError ? (
            <p className="text-sm text-red-700">{streamError}</p>
          ) : (
            <p className="whitespace-pre-wrap text-sm text-zinc-900">{streamed || "(empty)"}</p>
          )}
        </div>
      )}
    </div>
  );
}
