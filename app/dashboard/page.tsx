import Link from "next/link";

import DashboardAuth from "./DashboardAuth";
import OpenAIPromptForm from "./OpenAIPromptForm";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-16">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
          <DashboardAuth />
        </div>
        <p className="mt-3 text-zinc-600">
          Overview metrics, user activity, and quick actions will live here.
        </p>

        <OpenAIPromptForm />

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 p-4">
            <p className="text-sm text-zinc-500">Users</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">1,280</p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4">
            <p className="text-sm text-zinc-500">Revenue</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">$24,900</p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4">
            <p className="text-sm text-zinc-500">Conversions</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">4.8%</p>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-sm font-medium text-zinc-700 underline">
            Back to Main Page
          </Link>
        </div>
      </div>
    </main>
  );
}
