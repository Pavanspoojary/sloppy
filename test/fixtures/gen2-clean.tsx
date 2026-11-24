export function Dashboard() {
  return (
    <main className="min-h-screen bg-neutral-950 p-8 text-neutral-100">
      <nav className="backdrop-blur-md bg-neutral-900/70 p-4">Navigation</nav>
      <section className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Deployments</h1>
        <button className="mt-4 rounded border border-neutral-700 px-4 py-2 text-neutral-100 hover:bg-neutral-800">
          Deploy
        </button>
      </section>
    </main>
  );
}
