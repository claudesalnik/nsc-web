import Link from 'next/link';
import clsx from 'clsx';
import { DoorOpen, AlertTriangle, History } from 'lucide-react';

import styles from './PortalDashboard.module.css';

type VehicleStatus = 'STORED' | 'OUT';

type PortalVehicle = {
  id: string;
  year: number;
  make: string;
  model: string;
  color: string;
  storageSpot: {
    label: string;
    section: string;
    zone: string;
  };
  status: VehicleStatus;
};

type AccessEvent = {
  id: string;
  timestamp: string;
  vehicle: string;
  eventType: 'IN' | 'OUT';
  note?: string;
};

type BillingEntry = {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending';
};

const vehicles: PortalVehicle[] = [
  {
    id: 'veh-911',
    year: 2022,
    make: 'Porsche',
    model: '911 GT3',
    color: 'Paint-to-Sample Viola',
    storageSpot: { label: 'NB-A12', section: 'Row A', zone: 'North Bay' },
    status: 'STORED',
  },
  {
    id: 'veh-gt40',
    year: 1967,
    make: 'Ford',
    model: 'GT40 MK I',
    color: 'Heritage Blue',
    storageSpot: { label: 'HB-02', section: 'Heritage', zone: 'Heritage Vault' },
    status: 'OUT',
  },
  {
    id: 'veh-g63',
    year: 2020,
    make: 'Mercedes-AMG',
    model: 'G 63',
    color: 'Night Black Magno',
    storageSpot: { label: 'NA-07', section: 'Annex', zone: 'North Annex' },
    status: 'STORED',
  },
];

const storageAssignment = {
  bayLabel: 'NB-A17',
  section: 'Row A',
  zone: 'North Bay',
  accessWindow: '24/7 — Badge + PIN',
  lastVisit: 'Feb 22 · 18:42',
  gateCode: '7329 · A',
};

const accessEvents: AccessEvent[] = [
  {
    id: 'ae-01',
    timestamp: 'Feb 22 · 18:42',
    vehicle: '2022 Porsche 911 GT3',
    eventType: 'IN',
    note: 'Vehicle returned by concierge',
  },
  {
    id: 'ae-02',
    timestamp: 'Feb 18 · 09:11',
    vehicle: '1967 Ford GT40 MK I',
    eventType: 'OUT',
    note: 'Track day checkout',
  },
  {
    id: 'ae-03',
    timestamp: 'Feb 11 · 21:07',
    vehicle: '2020 Mercedes-AMG G 63',
    eventType: 'IN',
    note: 'Night access via member fob',
  },
];

const billingHistory: BillingEntry[] = [
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
];

const quickActions = [
  { label: 'Request Access', icon: DoorOpen },
  { label: 'Report Issue', icon: AlertTriangle },
  { label: 'View Access History', icon: History },
];

const vehicleStatusCopy: Record<VehicleStatus, { label: string; badgeClass: string }> = {
  STORED: { label: 'In Storage', badgeClass: styles.statusIn },
  OUT: { label: 'Checked Out', badgeClass: styles.statusOut },
};

export default function PortalDashboard() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.tag}>Member Dashboard</span>
        <h1 className={styles.title}>Welcome back, Oleg.</h1>
        <p className={styles.subtitle}>
          Everything is quiet at the clubhouse. Climate systems nominal, last motion event 02:14.
        </p>
      </header>

      <section className={clsx(styles.sectionCard)} id="vehicles">
        <div className={styles.sectionHeader}>
          <h3>My Vehicles</h3>
          <span>{vehicles.length} stored vehicles</span>
        </div>

        <div className={styles.vehicleGrid}>
          {vehicles.map(vehicle => (
            <article key={vehicle.id} className={styles.vehicleCard}>
              <div className={styles.vehicleThumb} aria-hidden />
              <div className={styles.vehicleMeta}>
                <strong>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </strong>
                <span>
                  {vehicle.color} · {vehicle.storageSpot.zone} · {vehicle.storageSpot.label}
                </span>
              </div>
              <span className={clsx(styles.statusBadge, vehicleStatusCopy[vehicle.status].badgeClass)}>
                {vehicleStatusCopy[vehicle.status].label}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className={clsx(styles.sectionCard, styles.storageCard)}>
        <div className={styles.sectionHeader}>
          <h3>Storage Assignment</h3>
          <span>{storageAssignment.zone} · {storageAssignment.section}</span>
        </div>

        <div className={styles.storageDetails}>
          <div className={styles.storageDetailBlock}>
            <label>Bay Label</label>
            <span>{storageAssignment.bayLabel}</span>
          </div>
          <div className={styles.storageDetailBlock}>
            <label>Section</label>
            <span>{storageAssignment.section}</span>
          </div>
          <div className={styles.storageDetailBlock}>
            <label>Zone</label>
            <span>{storageAssignment.zone}</span>
          </div>
          <div className={styles.storageDetailBlock}>
            <label>Access Window</label>
            <span>{storageAssignment.accessWindow}</span>
          </div>
          <div className={styles.storageDetailBlock}>
            <label>Last Visit</label>
            <span>{storageAssignment.lastVisit}</span>
          </div>
          <div className={styles.storageDetailBlock}>
            <label>Gate Code</label>
            <span className={styles.accessCode}>{storageAssignment.gateCode}</span>
          </div>
        </div>
      </section>

      <section className={clsx(styles.sectionCard, styles.billingCard)}>
        <div className={styles.sectionHeader}>
          <h3>Billing Snapshot</h3>
          <Link href="/portal/billing" className={styles.sectionLink}>
            View billing →
          </Link>
        </div>
        <ul className={styles.billingHistoryList}>
          {billingHistory.map(entry => (
            <li key={entry.id}>
              <div>
                <p className={styles.billingDate}>{entry.date}</p>
                <p className={styles.billingDescription}>{entry.description}</p>
              </div>
              <div className={styles.billingAmountBlock}>
                <span className={styles.billingAmount}>${entry.amount.toFixed(2)}</span>
                <span className={clsx(styles.billingStatus, entry.status === 'paid' ? styles.billingPaid : styles.billingPending)}>
                  {entry.status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/portal/billing" className={styles.billingCta}>
          View full billing history
        </Link>
      </section>

      <section className={clsx(styles.sectionCard, styles.accessCard)} id="access-history">
        <div className={styles.sectionHeader}>
          <h3>Access &amp; Instructions</h3>
          <span>Automated security tracking</span>
        </div>
        <div className={styles.accessGrid}>
          <div className={styles.accessInstructions}>
            <h4>Access instructions</h4>
            <p>Use your member key fob for bay access. Concierge unlock is available on request.</p>
            <ul>
              <li>Primary keypad PIN: <strong>2046 · ✶</strong></li>
              <li>Loading dock call box: &ldquo;Member 09&rdquo;</li>
              <li>Tire warmers + charge prep available with 2h notice</li>
            </ul>
          </div>
          <div className={styles.accessHistory}>
            <h4>Recent access history</h4>
            <ul>
              {accessEvents.map(event => (
                <li key={event.id}>
                  <div>
                    <p className={styles.accessTimestamp}>{event.timestamp}</p>
                    <p className={styles.accessVehicle}>{event.vehicle}</p>
                    {event.note && <p className={styles.accessNote}>{event.note}</p>}
                  </div>
                  <span className={clsx(styles.accessBadge, event.eventType === 'IN' ? styles.accessIn : styles.accessOut)}>
                    {event.eventType === 'IN' ? 'In' : 'Out'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3>Quick Actions</h3>
          <span>Need something handled?</span>
        </div>

        <div className={styles.quickActions}>
          {quickActions.map(action => (
            <button type="button" key={action.label} className={styles.quickActionButton}>
              <action.icon size={18} />
              {action.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
