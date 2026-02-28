import { Prisma } from '@prisma/client';

export type {
  Owner,
  Vehicle,
  StorageSpot,
  VehiclePhoto,
  VehicleStatusEvent,
  AccessStatus,
} from '@prisma/client';

export type VehicleWithRelations = Prisma.VehicleGetPayload<{
  include: {
    owner: true;
    currentSpot: true;
    photos: true;
    statusEvents: true;
  };
}>;
