export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { serializeMember, serializeSpot, serializeVehicle } from '@/app/admin/data/serializers';
import MembersDashboard from './members-dashboard';

export default async function MembersAdminPage() {
  const [owners, vehicles, spots] = await Promise.all([
    prisma.owner.findMany({ orderBy: { fullName: 'asc' } }),
    prisma.vehicle.findMany({
      include: {
        owner: true,
        currentSpot: true,
        photos: { orderBy: { isPrimary: 'desc' } },
        statusEvents: { orderBy: { occurredAt: 'desc' }, take: 10 },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.storageSpot.findMany({ orderBy: { code: 'asc' } }),
  ]);

  const vehicleCounts = new Map<string, number>();
  vehicles.forEach((vehicle) => {
    vehicleCounts.set(vehicle.ownerId, (vehicleCounts.get(vehicle.ownerId) ?? 0) + 1);
  });

  const initialMembers = owners.map((owner) => serializeMember(owner, vehicleCounts.get(owner.id) ?? 0));
  const fleet = vehicles.map(serializeVehicle);
  const storageSpots = spots.map(serializeSpot);

  return (
    <MembersDashboard
      initialMembers={initialMembers}
      initialVehicles={fleet}
      storageSpots={storageSpots}
    />
  );
}
