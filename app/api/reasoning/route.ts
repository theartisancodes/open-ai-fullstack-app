import { NextRequest, NextResponse } from "next/server";
import OpenAI, { RateLimitError } from "openai";

interface AIRequest {
    prompt: string;
    model: string;
    instructions?: string;
    max_output_token?: number;
}

let cachedSDK :OpenAI | undefined;

const getOpenAIClient = (): OpenAI => {
    if(!cachedSDK){

     cachedSDK = new OpenAI({apiKey: process.env.OPEN_AI_API_KEY});
    }

    return cachedSDK;
}

export async function POST(req:NextRequest) {
    try {
        const body = (await req.json()) as AIRequest;
        if(!body.prompt){
            return NextResponse.json({
                ok: false,
                error: 'Prompt is required'
            })
        }

        const client = getOpenAIClient();
        const response = await client.images.generate({
            prompt: body.prompt.trim(),
            model: 'gpt-image-1-mini',
            size: '1024x1024'
        });
        return NextResponse.json({
            ok: true,
            imageBase64: response.data?.[0]?.b64_json || null
        })
    }
    catch(error){
        let message: string;
        if(error instanceof RateLimitError){
            message = error.message || 'Rate limit has been exceeded';
           return NextResponse.json({
                ok:false,
                error: message
            }, {
                status: 429
            })
        }
        return NextResponse.json({
            ok: false,
            error: error instanceof Error ? error.message : 'An unknown error has occured'
        }, {
            status: 500
        })
    }
}