export function Dashboard() {
  return (
    <main className="min-h-screen bg-neutral-950 p-8 text-neutral-100">
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
        <h1 className="text-xl font-semibold">Deployments</h1>
        <button className="mt-4 rounded bg-emerald-500 px-4 py-2 text-neutral-950 ring-2 ring-emerald-500/40 hover:bg-emerald-400">
          Deploy
        </button>
      </div>
    </main>
  );
}
