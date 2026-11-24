export function Intro() {
  return (
    <section className="bg-neutral-50 p-6 text-neutral-900">
      <h1 className="text-xl font-semibold">Deploy a container in 40 seconds</h1>
      <p>The CLI builds the image, runs the tests, and streams logs from the target cluster.</p>
      <button type="button" className="mt-3 rounded border px-3 py-2 hover:bg-neutral-200">Read the deploy guide</button>
    </section>
  );
}
