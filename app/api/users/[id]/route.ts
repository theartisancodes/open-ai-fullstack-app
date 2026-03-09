import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await req.json()) as {
      fullName?: string;
      subscriptionStatus?: "INACTIVE" | "ACTIVE" | "CANCELED";
      subscriptionTier?: "FREE" | "PRO" | "ENTERPRISE";
    };

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(body.fullName !== undefined ? { fullName: body.fullName } : {}),
        ...(body.subscriptionStatus !== undefined
          ? { subscriptionStatus: body.subscriptionStatus }
          : {}),
        ...(body.subscriptionTier !== undefined ? { subscriptionTier: body.subscriptionTier } : {}),
      },
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await req.json()) as {
      title?: string;
      content?: string;
      published?: boolean;
    };

    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title: body.title.trim(),
        content: body.content,
        published: body.published ?? false,
        authorId: id,
      },
    });

    return NextResponse.json({ ok: true, post }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
