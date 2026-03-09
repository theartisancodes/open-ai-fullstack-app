import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";

/* 
 email                       String   @unique
  passwordHash                String? @map("password_hash")
  fullName                    String? @map("full_name")
  posts                       Post[]
  profile                     Profile?
  role                        UserRole @default(USER)
  subscriptionTier            SubscriptionTier @default(FREE) @map("subscription_tier")
  subscriptionStatus          SubscriptionStatus @default(INACTIVE) @map("subscription_status")
  subscriptionStartDate       DateTime? @map("subscription_start_date")
  subscriptionEndDate         DateTime? @map("subscription_end_date")
  createdAt            
  */

export interface UserBody {
  email?: string;
  password?: string;
  fullName?: string;
  role?: "USER" | "ADMIN";
  subscriptionTier?: "FREE" | "PRO" | "ENTERPRISE";
  subscriptionStatus?: "INACTIVE" | "ACTIVE" | "CANCELED";
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as UserBody;

    if (!body.email || !body.password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const passwordHash = await hashPassword(body.password);

    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase().trim(),
        passwordHash,
        ...(body.fullName !== undefined ? { fullName: body.fullName } : {}),
        ...(body.role !== undefined ? { role: body.role } : {}),
        ...(body.subscriptionTier !== undefined ? { subscriptionTier: body.subscriptionTier } : {}),
        ...(body.subscriptionStatus !== undefined
          ? { subscriptionStatus: body.subscriptionStatus }
          : {}),
        ...(body.subscriptionStartDate
          ? { subscriptionStartDate: new Date(body.subscriptionStartDate) }
          : {}),
        ...(body.subscriptionEndDate
          ? { subscriptionEndDate: new Date(body.subscriptionEndDate) }
          : {}),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.toLowerCase().includes("unique") || message.includes("P2002")) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
