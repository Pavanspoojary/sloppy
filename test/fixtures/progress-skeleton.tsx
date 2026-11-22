export function UploadProgress() {
  return (
    <div className="flex flex-col gap-2" role="progressbar" aria-valuenow={48}>
      <div className="animate-pulse bg-neutral-800 h-2 rounded-full" />
      <span className="text-xs text-neutral-400">Uploading</span>
    </div>
  );
}
