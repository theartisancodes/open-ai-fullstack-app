// model Post {
//   id        String   @id @default(uuid())
//   title     String
//   content   String?
//   published Boolean  @default(false)
//   authorId  String
//   author    User     @relation(fields: [authorId], references: [id])
//   tags      Tag[]
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";

interface PostBody {
  title?: string;
  content?: string;
  published?: boolean;
  authorId?: string;
  tags?: string[];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PostBody;

    if (!body.title || !body.authorId) {
      return NextResponse.json({ error: "title and author are required" }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title: body.title.trim(),
        content: body.content,
        published: body.published ?? false,
        authorId: body.authorId,
        ...(body.tags && body.tags.length > 0
          ? {
              tags: {
                connectOrCreate: body.tags.map((name) => ({
                  where: { name },
                  create: { name },
                })),
              },
            }
          : {}),
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json({ ok: true, post }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


export async function GET() {
    try {
    const posts = await prisma.post.findMany({
        orderBy: {
            createdAt: "desc"
        }
    })
    return NextResponse.json({ok: true, status: 200, data: posts })
    }
    catch(error) {
        const message = error instanceof Error ? error.message : "Unknown Error";
        return NextResponse.json({ ok: false, error: message, status: 500 })
    }
}
