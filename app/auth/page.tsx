import Link from "next/link";

import AuthForm from "./AuthForm";

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16">
      <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-zinc-900">Sign in</h1>
        <p className="mt-3 text-zinc-600">Sign in or create an account.</p>
        <p className="mt-1 text-sm text-zinc-500">Demo: use any email and password.</p>

        <AuthForm />


        <p className="mt-4 text-xs text-zinc-400">
          If sign-in fails, add NEXTAUTH_SECRET and NEXTAUTH_URL to .env.local (see .env.example).
        </p>
        <div className="mt-6">
          <Link href="/" className="text-sm font-medium text-zinc-700 underline">
            Back to Main Page
          </Link>
        </div>
      </div>
    </main>
  );
}
