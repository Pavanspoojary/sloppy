export function MultiLineSloppyPanel() {
  return (
    <div
      className={[
        'flex flex-col gap-4',
        'bg-gradient-to-br',
        'from-purple-500',
        'via-fuchsia-500',
        'to-indigo-600',
        'p-8',
        'rounded-2xl'
      ].join(' ')}
    >
      <span>Untitled board</span>
    </div>
  );
}
