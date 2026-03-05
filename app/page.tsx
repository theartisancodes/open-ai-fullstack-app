import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-900 px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl rounded-xl bg-zinc-800 p-8 shadow-lg">
        <h1 className="text-4xl font-bold">Open AI Fullstack App</h1>
        <p className="mt-3 text-zinc-300">
          Your route structure is ready. Choose a page to continue.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Link
            href="/home"
            className="rounded-md bg-white px-4 py-3 text-center text-sm font-semibold text-zinc-900"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-zinc-500 px-4 py-3 text-center text-sm font-semibold"
          >
            Dashboard
          </Link>
          <Link
            href="/auth"
            className="rounded-md border border-zinc-500 px-4 py-3 text-center text-sm font-semibold"
          >
            Auth
          </Link>
        </div>
      </div>
    </main>
  );
}
