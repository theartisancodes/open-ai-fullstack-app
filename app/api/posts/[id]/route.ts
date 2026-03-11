import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

interface AuthorBody {
    id: string;
    email: string;
    fullName?: string | null;
}

interface TagBody {
    id: string;
    name: string;
}

interface PostBody {
    title?: string;
    content?: string | null;
    published?: boolean;
    authorId: string;
    author: AuthorBody;
    tags: TagBody[];
}

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    const postData = await prisma.post.findUnique({
        where: { id }
    });

    if (!postData) {
        return NextResponse.json({ ok: false, status: 404, error: "No post found for given ID" });
    }
    return NextResponse.json({ ok: true, data: postData });


    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown Error";
        return NextResponse.json({ ok: false, status: 500, error: message });
    }
}


export async function PUT(req: Request, { params }: Params) {
    try {
        const { id } = await params;
        const body = (await req.json()) as PostBody;

        const updatedBody = await prisma.post.update({
            where: { id },
            data: {
                ...(body.title !== undefined ? { title: body.title.trim() } : {}),
                ...(body.content !== undefined ? { content: body.content } : {}),
                ...(body.published !== undefined ? { published: body.published } : {}),
            }
        });

        return NextResponse.json({ ok: true, data: updatedBody });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown Error";
        return NextResponse.json({ ok: false, status: 500, error: message });
    }
}

export async function DELETE(_: Request, { params }: Params) {
    try {
        const { id } = await params;

        const existing = await prisma.post.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Item not found" },
        { status: 404 }
      )
    }

        return NextResponse.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown Error";
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}