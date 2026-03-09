import { NextResponse } from "next/server";

interface Params {
title:     string;
content:   string;
published?: boolean;
authorId: string; 
tags: string;
}

export async function GET(req: Request, { params }: Params ){
    try {
    const { id } = params;
    if(!id){
        return NextResponse.json({ok: false, status: 400, error: 'Unable to find Post.'})
    }
    
    } 
    catch(error) {
        const message = error instanceof Error ? error.message : 'Unknown Error';
        return NextResponse.json({ ok: false, status: 500, error: message })
    }
}