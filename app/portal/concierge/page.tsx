export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ConciergeRequestForm } from './concierge-request-form';
import { ConciergeRequestList } from './concierge-request-list';

export default async function ConciergeRequestPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/login?session=expired');

  const owner = await prisma.owner.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      fullName: true,
      vehicles: { select: { id: true, year: true, make: true, model: true } },
    },
  });

  if (!owner) redirect('/login');

  const requests = await prisma.conciergeRequest.findMany({
    where: { memberId: owner.id },
    include: { vehicle: { select: { year: true, make: true, model: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Members-only service</p>
        <h1 className="text-2xl font-semibold text-[var(--text)]">Concierge</h1>
        <p className="mt-1 text-sm text-[rgba(var(--text-rgb),0.6)]">
          Schedule detailing, battery maintenance, or other services for your stored vehicles.
        </p>
      </div>

      <ConciergeRequestForm vehicles={owner.vehicles} />

      {requests.length > 0 && (
        <ConciergeRequestList initialRequests={JSON.parse(JSON.stringify(requests))} />
      )}
    </div>
  );
}
