"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function DashboardAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="text-sm text-zinc-500">Checking session…</span>;
  }

  if (session?.user?.email) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-600">Signed in as {session.user.email}</span>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm font-medium text-zinc-700 underline hover:no-underline"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link href="/auth?callbackUrl=/dashboard" className="text-sm font-medium text-zinc-700 underline">
      Sign in
    </Link>
  );
}
