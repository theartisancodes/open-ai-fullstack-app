'use client';

import Image from "next/image";
import { useEffect, useState } from "react";

interface Voice {
  id: string;
  label: string;
}

const ImageGenerator = () => {
  const [imageBase64, setImageBase64] = useState("");
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [speechValue, setInputText] = useState("");
  const [speechError, setSpeechError] = useState("");
  const [speechLoading, setSpeechLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("alloy");

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    fetch("/api/sauti/voices")
      .then((res) => res.json())
      .then((data: { ok: boolean; voices: Voice[] }) => {
        if (data.ok) setVoices(data.voices);
      })
      .catch(() => {/* voices dropdown just stays empty */});
  }, []);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const prompt = inputValue.trim();
    if (!prompt) {
      setError("Enter a prompt to proceed");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/reasoning", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          model: "gpt-image-1-mini",
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Image generation failed");
        return;
      }

      setImageBase64(data.imageBase64 ?? "");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const submitSpeech = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const text = speechValue.trim();
    if (!text) {
      setSpeechError("Enter text to synthesize");
      return;
    }

    setSpeechError("");
    setSpeechLoading(true);

    try {
      const response = await fetch("/api/sauti", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model: "gpt-4o-mini-tts",
          voice: selectedVoice,
        }),
      });

      if (!response.ok) {
        let message = `Speech generation failed (${response.status})`;
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload.error) {
            message = payload.error;
          }
        } catch {
          // Keep default message for non-JSON responses.
        }
        setSpeechError(message);
        return;
      }

      const blob = await response.blob();
      const nextUrl = URL.createObjectURL(blob);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(nextUrl);
    } catch (error) {
      setSpeechError(error instanceof Error ? error.message : "Unexpected speech error");
    } finally {
      setSpeechLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 px-4 py-6">
      <input
        placeholder="enter prompt"
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />

      <button type="submit" disabled={loading} className="w-fit">
        {loading ? "generating..." : "generate image"}
      </button>

      {error ? <p>{error}</p> : null}

      {imageBase64 ? (
        <Image
          src={`data:image/png;base64,${imageBase64}`}
          alt="Generated image"
          width={512}
          height={512}
          unoptimized
        />
      ) : null}

      <input
        type="text"
        value={speechValue}
        onChange={(event) => setInputText(event.target.value)}
        placeholder="enter text for speech"
      />

      {voices.length > 0 ? (
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="w-fit rounded border px-2 py-1 text-sm"
        >
          {voices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      ) : null}

      <button type="button" onClick={submitSpeech} disabled={speechLoading} className="w-fit">
        {speechLoading ? "generating speech..." : "generate speech"}
      </button>
      {speechError ? <p>{speechError}</p> : null}

      {audioUrl ? <audio controls src={audioUrl} /> : null}
    </form>
  );
};

export default ImageGenerator;
