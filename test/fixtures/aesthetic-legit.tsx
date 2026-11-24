export function OperationsDashboard() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-6 py-4">
        <h1 className="text-xl font-semibold">Deployments</h1>
        <p className="text-sm text-neutral-400">Production cluster</p>
      </header>

      <section aria-label="Cluster health" className="grid gap-4 p-6 md:grid-cols-3">
        <article className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <h2 className="text-sm text-neutral-400">p99 latency</h2>
          <p className="text-2xl font-semibold">14 ms</p>
        </article>
        <article className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <h2 className="text-sm text-neutral-400">Error rate</h2>
          <p className="text-2xl font-semibold">0.02%</p>
        </article>
        <article className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <h2 className="text-sm text-neutral-400">Open incidents</h2>
          <p className="text-2xl font-semibold">0</p>
        </article>
      </section>

      <section className="p-6">
        <table className="w-full text-left text-sm">
          <thead className="text-neutral-400">
            <tr>
              <th className="py-2 font-medium">Service</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Region</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-neutral-800">
              <td className="py-2">api-gateway</td>
              <td className="py-2">healthy</td>
              <td className="py-2">iad1</td>
            </tr>
            <tr className="border-t border-neutral-800">
              <td className="py-2">billing-worker</td>
              <td className="py-2">healthy</td>
              <td className="py-2">fra1</td>
            </tr>
            <tr className="border-t border-neutral-800">
              <td className="py-2">search-index</td>
              <td className="py-2">degraded</td>
              <td className="py-2">sin1</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}
