export function BillingOverview() {
  return (
    <section className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-neutral-100">Billing overview</h1>
        <p className="text-sm text-neutral-400">
          Track invoices, payment methods, tax documents, and upcoming renewals for every
          workspace your team manages across regions and currencies in one place.
        </p>
      </header>
      <p className="text-sm text-neutral-300">
        Your next renewal is scheduled for the first day of the month. Update the payment
        method before then to avoid a failed charge and a temporary service pause.
      </p>
    </section>
  );
}
