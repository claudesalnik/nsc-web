export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { ConciergeKanban } from './concierge-kanban';

export default async function AdminConciergeKanbanPage() {
  const requests = await prisma.conciergeRequest.findMany({
    include: {
      member: { select: { id: true, fullName: true, email: true } },
      vehicle: { select: { year: true, make: true, model: true, color: true } },
    },
    orderBy: [{ requestedDate: 'asc' }, { createdAt: 'asc' }],
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.45)]">Admin</p>
        <h1 className="text-2xl font-semibold text-[var(--text)]">Concierge requests</h1>
        <p className="mt-1 text-sm text-[rgba(var(--text-rgb),0.55)]">
          Drag cards between columns to update status. Changes save instantly.
        </p>
      </div>

      <ConciergeKanban initialRequests={JSON.parse(JSON.stringify(requests))} />
    </div>
  );
}
