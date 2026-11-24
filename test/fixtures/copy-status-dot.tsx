export function StatusBanner() {
  return (
    <div className="flex items-center gap-2 bg-neutral-100 p-4 text-neutral-900">
      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      <span>All Systems Operational</span>
    </div>
  );
}
