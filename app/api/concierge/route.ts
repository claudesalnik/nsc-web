import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ConciergeRequestType } from '@prisma/client';

// GET /api/concierge — member fetches their own requests
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const owner = await prisma.owner.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!owner) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  const requests = await prisma.conciergeRequest.findMany({
    where: { memberId: owner.id },
    include: { vehicle: { select: { year: true, make: true, model: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(requests);
}

// POST /api/concierge — member creates a new concierge request
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const owner = await prisma.owner.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!owner) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  const body = await req.json();
  const { type, notes, requestedDate, vehicleId } = body;

  if (!type || !['DETAILING', 'BATTERY_RUN', 'OTHER'].includes(type)) {
    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  }

  const created = await prisma.conciergeRequest.create({
    data: {
      memberId: owner.id,
      vehicleId: vehicleId || null,
      type: type as ConciergeRequestType,
      notes: notes || null,
      requestedDate: requestedDate ? new Date(requestedDate) : null,
    },
    include: { vehicle: { select: { year: true, make: true, model: true } } },
  });

  // TODO: Send notification to admin when a new concierge request is created.
  // e.g. sendAdminNotification({ type: 'NEW_CONCIERGE_REQUEST', requestId: created.id, memberId: owner.id })

  return NextResponse.json(created, { status: 201 });
}
