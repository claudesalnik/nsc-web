export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { serializeVehicle, serializeSpot } from '@/app/admin/data/serializers';
import VehiclesDashboard from './vehicles-dashboard';

export default async function AdminVehiclesPage() {
  const [vehicles, owners, spots] = await Promise.all([
    prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: true,
        currentSpot: true,
        photos: { orderBy: { isPrimary: 'desc' } },
        statusEvents: { orderBy: { occurredAt: 'desc' }, take: 5 },
      },
    }),
    prisma.owner.findMany({ orderBy: { fullName: 'asc' } }),
    prisma.storageSpot.findMany({ orderBy: { code: 'asc' } }),
  ]);

  const initialVehicles = vehicles.map(serializeVehicle);
  const memberOptions = owners.map((owner) => ({ id: owner.id, name: owner.fullName, email: owner.email }));
  const storageSpots = spots.map(serializeSpot);

  return (
    <VehiclesDashboard
      initialVehicles={initialVehicles}
      members={memberOptions}
      storageSpots={storageSpots}
    />
  );
}
