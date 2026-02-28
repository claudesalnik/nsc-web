'use server';

import { revalidatePath } from 'next/cache';
import { OwnerStatus, type MembershipTier } from '@prisma/client';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { serializeMember, type AdminMember } from '@/app/admin/data/serializers';

const REVALIDATE_PATHS = ['/admin/members', '/admin/vehicles'];

export type MemberProfileInput = {
  id: string;
  fullName?: string;
  phone?: string | null;
  city?: string | null;
  company?: string | null;
  membershipTag?: string | null;
  membershipTier: MembershipTier;
  status: OwnerStatus;
  notes?: string | null;
  joinedAt?: string;
};

export type InviteMemberInput = {
  email: string;
  membershipTier: MembershipTier;
};

export type MemberActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function updateMemberProfileAction(input: MemberProfileInput): Promise<MemberActionResult<AdminMember>> {
  await requireAdmin();
  const sanitized = sanitizeProfileInput(input);

  try {
    const updated = await prisma.owner.update({
      where: { id: sanitized.id },
      data: {
        fullName: sanitized.fullName ?? undefined,
        phone: sanitized.phone,
        city: sanitized.city,
        company: sanitized.company,
        membershipTag: sanitized.membershipTag,
        membershipTier: sanitized.membershipTier,
        status: sanitized.status,
        notes: sanitized.notes,
        joinedAt: sanitized.joinedAt ?? undefined,
      },
    });

    const owned = await prisma.vehicle.count({ where: { ownerId: updated.id } });

    await revalidateMembers();
    return { ok: true, data: serializeMember(updated, owned) };
  } catch (error) {
    return { ok: false, error: humanizeError(error) };
  }
}

export async function inviteMemberAction(input: InviteMemberInput): Promise<MemberActionResult<AdminMember>> {
  await requireAdmin();
  const email = input.email.trim().toLowerCase();
  if (!email) {
    return { ok: false, error: 'Email is required.' };
  }

  try {
    const created = await prisma.owner.create({
      data: {
        fullName: deriveNameFromEmail(email),
        email,
        membershipTier: input.membershipTier,
        status: OwnerStatus.PENDING,
        membershipTag: 'Invite pending',
        notes: 'Invitation issued via admin dashboard.',
      },
    });

    await revalidateMembers();
    return { ok: true, data: serializeMember(created, 0) };
  } catch (error) {
    return { ok: false, error: humanizeError(error) };
  }
}

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== 'admin') {
    throw new Error('UNAUTHORIZED');
  }
}

async function revalidateMembers() {
  await Promise.all(REVALIDATE_PATHS.map((path) => revalidatePath(path)));
}

function sanitizeProfileInput(input: MemberProfileInput) {
  return {
    id: input.id,
    fullName: input.fullName?.trim(),
    phone: input.phone?.trim() || null,
    city: input.city?.trim() || null,
    company: input.company?.trim() || null,
    membershipTag: input.membershipTag?.trim() || null,
    membershipTier: input.membershipTier,
    status: input.status,
    notes: input.notes?.trim() || null,
    joinedAt: input.joinedAt ? new Date(input.joinedAt) : undefined,
  } as const;
}

function deriveNameFromEmail(email: string) {
  const [local] = email.split('@');
  if (!local) return 'Pending Member';
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function humanizeError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === 'UNAUTHORIZED') {
      return 'Not allowed.';
    }
    return error.message;
  }
  return 'Unable to complete that request.';
}