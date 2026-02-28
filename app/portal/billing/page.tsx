import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getMemberPortalData } from "@/lib/portal/member-data";

const manageSubscriptionUrl = "https://billing.stripe.com/p/test_members_portal";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login?session=expired");
  }

  const portal = await getMemberPortalData(session.user.email);
  const billing = portal.billing;
  const nextBilling = dateFormatter.format(new Date(billing.nextChargeDate));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Billing</p>
        <h1 className="text-2xl font-semibold text-[var(--text)]">Storage subscription</h1>
        <p className="text-sm text-[rgba(var(--text-rgb),0.65)]">Plan metadata + invoices rendered in a format that’s easy to skim while parked at the gate.</p>
      </header>

      <section className="mobile-card space-y-4 border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface2-rgb),0.95)]">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Current plan</p>
          <h2 className="text-lg font-semibold text-[var(--text)]">{billing.planName}</h2>
          <p className="text-sm text-[rgba(var(--text-rgb),0.65)]">{billing.description}</p>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.55)]">Monthly</p>
            <p className="text-4xl font-semibold text-[var(--text)]">${billing.monthlyAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.55)]">Next billing</p>
            <p className="text-xl font-semibold text-[var(--text)]">{nextBilling}</p>
            <p className="text-xs text-[rgba(var(--text-rgb),0.6)]">Auto-charge on file</p>
          </div>
        </div>
        <a
          href={manageSubscriptionUrl}
          target="_blank"
          rel="noreferrer"
          className="tappable-area inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-[rgba(var(--blue-rgb),0.45)] bg-[rgba(var(--blue-rgb),0.15)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--text)]"
        >
          Manage subscription
        </a>
      </section>

      <section className="mobile-card space-y-4 border-[rgba(var(--border-rgb),0.5)] bg-[rgba(var(--surface3-rgb),0.92)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Invoices</p>
            <h2 className="text-lg font-semibold text-[var(--text)]">History</h2>
          </div>
          <span className="text-sm text-[rgba(var(--text-rgb),0.65)]">Auto-sync via Stripe</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-[0.65rem] uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.55)]">
                <th className="pb-3 pr-4 font-normal">Date</th>
                <th className="pb-3 pr-4 font-normal">Description</th>
                <th className="pb-3 pr-4 font-normal">Amount</th>
                <th className="pb-3 pr-4 font-normal">Status</th>
                <th className="pb-3 font-normal">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {billing.invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t border-[rgba(var(--border-rgb),0.2)]">
                  <td className="py-3 pr-4 text-[var(--text)]">{dateFormatter.format(new Date(invoice.date))}</td>
                  <td className="py-3 pr-4 text-[rgba(var(--text-rgb),0.8)]">{invoice.description}</td>
                  <td className="py-3 pr-4 text-[var(--text)]">${invoice.amount.toFixed(2)}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-2xl px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
                        invoice.status === "paid"
                          ? "bg-[rgba(var(--success-rgb),0.2)] text-[var(--success)]"
                          : "bg-[rgba(var(--amber-rgb),0.2)] text-[var(--amber)]"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <a href={invoice.downloadUrl ?? manageSubscriptionUrl} className="text-sm font-semibold text-[var(--blue)]">
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
