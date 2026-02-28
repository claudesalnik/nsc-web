import { AccessStatus, MembershipTier, OwnerStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Seeding Newcastle Sunday Club data...');

  // Clean existing data (respect FK order)
  await prisma.vehicleStatusEvent.deleteMany();
  await prisma.vehiclePhoto.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.storageSpot.deleteMany();
  await prisma.owner.deleteMany();

  const owners = await Promise.all([
    prisma.owner.create({
      data: {
        fullName: 'Oleg Lebedev',
        email: 'member@nsc.com',
        phone: '+1-916-555-1100',
        city: 'Newcastle, CA',
        company: 'NSC Holdings',
        membershipTag: 'Founding Member',
        membershipTier: MembershipTier.FOUNDER,
        status: OwnerStatus.ACTIVE,
        notes: 'Prefers SMS for pickup notifications.'
      }
    }),
    prisma.owner.create({
      data: {
        fullName: 'Maya Takahashi',
        email: 'maya@nsc.club',
        phone: '+1-415-555-9822',
        city: 'San Francisco, CA',
        company: 'Halo Bio',
        membershipTag: 'Heritage Tier',
        membershipTier: MembershipTier.PREMIUM,
        status: OwnerStatus.ACTIVE
      }
    }),
    prisma.owner.create({
      data: {
        fullName: 'Liam O\'Rourke',
        email: 'liam@nsc.club',
        phone: '+1-530-555-4432',
        city: 'Auburn, CA',
        company: 'Rhodes & Co.',
        membershipTag: 'Weekend Access',
        membershipTier: MembershipTier.STANDARD,
        status: OwnerStatus.ACTIVE
      }
    })
  ]);

  const spots = await Promise.all([
    prisma.storageSpot.create({
      data: {
        code: 'A01',
        displayName: 'Aisle A · Spot 01',
        size: 'Standard',
        level: 'Main Floor',
        climate: 'Climate',
        zone: 'Aisle A',
        section: 'Main Floor',
        rowLabel: 'Row A',
        isTransient: false
      }
    }),
    prisma.storageSpot.create({
      data: {
        code: 'A02',
        displayName: 'Aisle A · Spot 02',
        size: 'Standard',
        level: 'Main Floor',
        climate: 'Climate',
        zone: 'Aisle A',
        section: 'Main Floor',
        rowLabel: 'Row A',
        isTransient: false
      }
    }),
    prisma.storageSpot.create({
      data: {
        code: 'B01',
        displayName: 'Basement · Vault 1',
        size: 'Oversize',
        level: 'Lower Level',
        climate: 'Standard',
        zone: 'Vault B',
        section: 'Lower Level',
        rowLabel: 'Vault Row 1',
        isTransient: false
      }
    }),
    prisma.storageSpot.create({
      data: {
        code: 'CX1',
        displayName: 'Checkout Lane 1',
        size: 'Transient',
        level: 'Main Floor',
        climate: 'Transient',
        zone: 'Checkout',
        section: 'Main Floor',
        rowLabel: 'Lane CX',
        isTransient: true
      }
    })
  ]);

  const ownersByName = Object.fromEntries(owners.map((owner) => [owner.fullName, owner]));
  const spotsByCode = Object.fromEntries(spots.map((spot) => [spot.code, spot]));

  await prisma.vehicle.create({
    data: {
      ownerId: ownersByName['Oleg Lebedev'].id,
      vin: 'WP0AB299XTS720123',
      year: 1996,
      make: 'Porsche',
      model: '911',
      trim: 'Carrera 4S',
      color: 'Polar Silver',
      licensePlate: 'NSC964',
      plateState: 'CA',
      currentStatus: AccessStatus.IN,
      currentSpotId: spotsByCode['A01'].id,
      photos: {
        create: [
          {
            url: 'https://images.nsc.club/vehicles/porsche-964-front.jpg',
            caption: 'Post-detail check-in',
            isPrimary: true
          }
        ]
      },
      statusEvents: {
        create: [
          {
            status: AccessStatus.IN,
            note: 'Returned after Sunrise Drive.',
            spot: { connect: { id: spotsByCode['A01'].id } }
          }
        ]
      }
    }
  });

  await prisma.vehicle.create({
    data: {
      ownerId: ownersByName['Oleg Lebedev'].id,
      vin: 'ZFF67NFA3F0201881',
      year: 2015,
      make: 'Ferrari',
      model: '458 Speciale',
      color: 'Rosso Corsa',
      licensePlate: 'NSC458',
      plateState: 'CA',
      currentStatus: AccessStatus.OUT,
      currentSpotId: null,
      notes: 'Due for tire inspection on return.',
      photos: {
        create: [
          {
            url: 'https://images.nsc.club/vehicles/458s-quarter.jpg',
            caption: 'Delivery day',
            isPrimary: true
          },
          {
            url: 'https://images.nsc.club/vehicles/458s-detail.jpg',
            caption: 'PPF detail'
          }
        ]
      },
      statusEvents: {
        create: [
          {
            status: AccessStatus.IN,
            note: 'Checked in after service.',
            spot: { connect: { id: spotsByCode['A02'].id } },
            occurredAt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
          },
          {
            status: AccessStatus.OUT,
            note: 'Weekend rally checkout.',
            occurredAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000)
          }
        ]
      }
    }
  });

  await prisma.vehicle.create({
    data: {
      ownerId: ownersByName['Maya Takahashi'].id,
      vin: 'WBA6D6C5XHG389445',
      year: 2017,
      make: 'BMW',
      model: 'M6',
      trim: 'Competition',
      color: 'San Marino Blue',
      licensePlate: 'M6CA77',
      plateState: 'CA',
      currentStatus: AccessStatus.IN,
      currentSpotId: spotsByCode['B01'].id,
      photos: {
        create: [
          {
            url: 'https://images.nsc.club/vehicles/bmw-m6-blue.jpg',
            isPrimary: true
          }
        ]
      },
      statusEvents: {
        create: [
          {
            status: AccessStatus.MAINTENANCE,
            note: 'Scheduled climate recalibration. Holding in vault.',
            spot: { connect: { id: spotsByCode['B01'].id } }
          },
          {
            status: AccessStatus.IN,
            note: 'Moved to vault during heat wave.',
            occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            spot: { connect: { id: spotsByCode['B01'].id } }
          }
        ]
      }
    }
  });

  await prisma.vehicle.create({
    data: {
      ownerId: ownersByName['Liam O\'Rourke'].id,
      vin: '1C4RJFDJ5LC123908',
      year: 2020,
      make: 'Jeep',
      model: 'Grand Cherokee Trackhawk',
      color: 'Granite Crystal',
      licensePlate: 'TRKHWK1',
      plateState: 'CA',
      currentStatus: AccessStatus.IN,
      currentSpotId: spotsByCode['A02'].id,
      photos: {
        create: [
          {
            url: 'https://images.nsc.club/vehicles/trackhawk-profile.jpg',
            caption: 'Fresh ceramic coat',
            isPrimary: true
          }
        ]
      },
      statusEvents: {
        create: [
          {
            status: AccessStatus.IN,
            note: 'Assigned after CX1 checkout.',
            spot: { connect: { id: spotsByCode['A02'].id } }
          }
        ]
      }
    }
  });

  await prisma.vehicle.create({
    data: {
      ownerId: ownersByName['Maya Takahashi'].id,
      vin: 'SCFRMFAV0MG011377',
      year: 2021,
      make: 'Aston Martin',
      model: 'Vantage',
      color: 'Onyx Black',
      licensePlate: 'NSC007',
      plateState: 'CA',
      currentStatus: AccessStatus.OUT,
      currentSpotId: null,
      photos: {
        create: [
          {
            url: 'https://images.nsc.club/vehicles/vantage-front.jpg',
            caption: 'Delivery inspection',
            isPrimary: true
          }
        ]
      },
      statusEvents: {
        create: [
          {
            status: AccessStatus.IN,
            note: 'Delivery into CX1 for onboarding.',
            spot: { connect: { id: spotsByCode['CX1'].id } }
          },
          {
            status: AccessStatus.OUT,
            note: 'Client-initiated checkout for Napa run.',
            occurredAt: new Date(new Date().getTime() - 12 * 60 * 60 * 1000)
          }
        ]
      }
    }
  });

  console.info('✅ Seed complete.');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
