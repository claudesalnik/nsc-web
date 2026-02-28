export type ConciergeRequest = {
  id: string;
  title: string;
  status: "queued" | "en-route" | "completed";
  eta?: string;
  submittedAt: string;
  detail?: string;
};

const MOCK_REQUESTS: ConciergeRequest[] = [
  {
    id: "rq-260228-01",
    title: "Pull-up GT4 for dawn run",
    status: "en-route",
    eta: "ETA 12 min",
    submittedAt: "2026-02-28T12:05:00-08:00",
    detail: "Warm fluids + tire blankets on arrival.",
  },
  {
    id: "rq-260228-02",
    title: "Battery maintainer health check",
    status: "queued",
    eta: "Queued",
    submittedAt: "2026-02-27T18:42:00-08:00",
    detail: "Confirm maintainer logs before Sunday departure.",
  },
];

const clone = <T,>(value: T): T =>
  typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));

export function getPendingConciergeRequests(email: string): ConciergeRequest[] {
  const normalized = email.trim().toLowerCase();
  const queue = normalized ? MOCK_REQUESTS : [];
  return clone(queue);
}
