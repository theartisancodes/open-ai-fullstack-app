import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-zinc-900">Home</h1>
        <p className="mt-3 text-zinc-600">This is the Home page for your fullstack app.</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/auth"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800"
          >
            Go to Auth
          </Link>
        </div>
      </div>
    </main>
  );
}
