import { NextResponse } from "next/server";

import { getOpenAIClient } from "@/lib/openai/client";

type size = "1024x1024" | "1024x1536" | "1536x1024";

interface ImageRequest {
    prompt?: string;
    size?: size;
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as ImageRequest;
        if(!body.prompt?.trim()){
            return NextResponse.json({ ok: false, error: 'Prompt is required'},{
                status: 400
            })
        }
        const client = getOpenAIClient();
        const result = await client.images.generate({
            model: 'gpt-image-1',
            prompt: body.prompt,
            size: body.size ?? '1024x1024'
        })
        return NextResponse.json({
            ok: true,
            imageBase64: result.data?.[0]?.b64_json ?? null
        })

    }
    catch(error) {
        const message = error instanceof Error ? error.message : 'Unknown Error';
        return NextResponse.json({
            error: message,
            ok: false
        }, {
            status: 500
        })

    }
}
