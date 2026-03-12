import { NextResponse } from "next/server";

// OpenAI TTS voices — fixed set, no list API exists.
const VOICES = [
  { id: "alloy",   label: "Alloy"   },
  { id: "ash",     label: "Ash"     },
  { id: "ballad",  label: "Ballad"  },
  { id: "coral",   label: "Coral"   },
  { id: "echo",    label: "Echo"    },
  { id: "sage",    label: "Sage"    },
  { id: "shimmer", label: "Shimmer" },
  { id: "verse",   label: "Verse"   },
] as const;

export async function GET() {
  return NextResponse.json({ ok: true, voices: VOICES });
}
