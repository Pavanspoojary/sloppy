export function Overlays() {
  return (
    <div className="bg-neutral-900 p-8">
      <nav className="backdrop-blur-md bg-neutral-900/70 p-4">Navigation</nav>
      <aside className="backdrop-blur-lg bg-neutral-900/60 p-4">Filters</aside>
      <section className="backdrop-blur-xl bg-neutral-900/50 p-4">Details</section>
    </div>
  );
}
