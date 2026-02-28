import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/concierge — admin fetches all requests
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // TODO: enforce admin role check when roles are wired up
  // if ((session.user as { role?: string }).role !== 'admin') {
  //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  // }

  const requests = await prisma.conciergeRequest.findMany({
    include: {
      member: { select: { id: true, fullName: true, email: true } },
      vehicle: { select: { year: true, make: true, model: true, color: true } },
    },
    orderBy: [{ status: 'asc' }, { requestedDate: 'asc' }, { createdAt: 'asc' }],
  });

  return NextResponse.json(requests);
}
