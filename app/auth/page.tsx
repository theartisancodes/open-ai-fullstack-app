import Link from "next/link";

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16">
      <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-zinc-900">Auth</h1>
        <p className="mt-3 text-zinc-600">Sign in or create an account.</p>

        <form className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="********"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            />
          </div>
          <button
            type="button"
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          >
            Continue
          </button>
        </form>

        <div className="mt-6">
          <Link href="/" className="text-sm font-medium text-zinc-700 underline">
            Back to Main Page
          </Link>
        </div>
      </div>
    </main>
  );
}
