import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ConciergeRequestStatus } from '@prisma/client';

const VALID_STATUSES: ConciergeRequestStatus[] = ['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'DONE'];

// PATCH /api/concierge/[id] — admin updates status; member can update notes/date if still PENDING
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, notes, requestedDate } = body;

  const existing = await prisma.conciergeRequest.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Check ownership or admin role
  const owner = await prisma.owner.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  const isAdmin = (session.user as { role?: string }).role === 'admin';
  const isOwner = owner?.id === existing.memberId;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Members can only update notes/date on PENDING requests; admins can change status
  const data: Record<string, unknown> = {};
  if (status && isAdmin) {
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    data.status = status as ConciergeRequestStatus;
  }
  if (notes !== undefined) data.notes = notes;
  if (requestedDate !== undefined) data.requestedDate = requestedDate ? new Date(requestedDate) : null;

  const updated = await prisma.conciergeRequest.update({
    where: { id },
    data,
    include: {
      vehicle: { select: { year: true, make: true, model: true } },
      member: { select: { fullName: true, email: true } },
    },
  });

  // TODO: Send notification to member when status changes.
  // e.g. if (data.status && data.status !== existing.status) {
  //   sendMemberNotification({ memberId: existing.memberId, newStatus: data.status, requestId: id })
  // }

  return NextResponse.json(updated);
}

// DELETE /api/concierge/[id] — member cancels a PENDING request; admin can delete any
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.conciergeRequest.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const owner = await prisma.owner.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  const isAdmin = (session.user as { role?: string }).role === 'admin';
  const isOwner = owner?.id === existing.memberId;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!isAdmin && existing.status !== 'PENDING') {
    return NextResponse.json({ error: 'Can only cancel pending requests' }, { status: 400 });
  }

  await prisma.conciergeRequest.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
