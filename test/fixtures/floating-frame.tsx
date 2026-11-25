import { Window } from '@sloppy-ai/kit';

export function FloatingFrame() {
  return (
    <Window
      title="Invoices"
      className="mx-auto my-8 max-w-md p-8 rounded-xl border border-neutral-800"
    >
      <span>Unpaid</span>
    </Window>
  );
}
