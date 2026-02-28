import clsx from 'clsx';

import styles from './PortalBilling.module.css';

type InvoiceStatus = 'paid' | 'pending';

type Invoice = {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: InvoiceStatus;
};

const invoices: Invoice[] = [
  {
    id: 'inv-2402',
    date: 'Feb 1, 2026',
    description: 'Monthly Storage — North Bay A',
    amount: 825,
    status: 'paid',
  },
  {
    id: 'inv-2401',
    date: 'Jan 1, 2026',
    description: 'Monthly Storage — North Bay A',
    amount: 825,
    status: 'paid',
  },
  {
    id: 'inv-2312',
    date: 'Dec 1, 2025',
    description: 'Monthly Storage — North Bay A',
    amount: 825,
    status: 'paid',
  },
  {
    id: 'inv-2311',
    date: 'Nov 1, 2025',
    description: 'Monthly Storage — North Bay A',
    amount: 825,
    status: 'pending',
  },
];

const manageSubscriptionUrl = 'https://billing.stripe.com/p/test_members_portal';

export default function BillingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Billing &amp; Subscription</h1>
        <p>Track your storage plan, invoices, and payment status in one place.</p>
      </header>

      <section className={styles.card}>
        <div className={styles.planMeta}>
          <span className={styles.planStatus}>Current Plan</span>
          <span className={styles.planName}>Monthly Storage — North Bay</span>
          <span className={styles.planPrice}>
            $825
            <span className={styles.planPriceUnit}>/mo</span>
          </span>
          <p>Dedicated North Bay unit, climate monitoring, access control included.</p>
        </div>
        <a href={manageSubscriptionUrl} className={styles.manageButton} target="_blank" rel="noreferrer">
          Manage Subscription
        </a>
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h3>Invoice History</h3>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.invoiceTable}>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Description</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
                <th scope="col">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>{invoice.date}</td>
                  <td>{invoice.description}</td>
                  <td>${invoice.amount.toFixed(2)}</td>
                  <td>
                    <span
                      className={clsx(
                        styles.statusDot,
                        invoice.status === 'paid' ? styles.statusPaid : styles.statusPending,
                      )}
                    >
                      {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <a href={`#${invoice.id}`} className={styles.downloadLink}>
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
