export type VehicleStatus = 'IN_STORAGE' | 'CHECKED_OUT';

export type MemberTier = 'FOUNDER' | 'PREMIUM' | 'STANDARD';

export type MemberRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  company?: string;
  tier: MemberTier;
  joined: string;
  conciergeNotes?: string;
  vehiclesOwned: number;
};

export type StorageSpotRecord = {
  id: string;
  code: string;
  level: string;
  size: 'Standard' | 'Oversize' | 'Heritage';
  climate: 'Standard' | 'Climate';
};

export type VehicleRecord = {
  id: string;
  ownerId: string;
  year: number;
  make: string;
  model: string;
  color: string;
  status: VehicleStatus;
  storageSpotId: string;
  vin: string;
  photoUrl?: string;
  notes?: string;
};

export const mockMembers: MemberRecord[] = [
  {
    id: 'mem-lf',
    name: 'Lucas Finch',
    email: 'lucas@nsc.club',
    phone: '(415) 555-3018',
    city: 'San Francisco, CA',
    company: 'Finch Capital',
    tier: 'FOUNDER',
    joined: '2021-06-18',
    conciergeNotes: 'Prefers early morning check-outs before 7am.',
    vehiclesOwned: 4,
  },
  {
    id: 'mem-mo',
    name: 'Maya Ortiz',
    email: 'maya@nsc.club',
    phone: '(916) 555-7782',
    city: 'Auburn, CA',
    company: 'Ortiz Design Lab',
    tier: 'PREMIUM',
    joined: '2022-02-04',
    conciergeNotes: 'Event lead for Foothill Drives.',
    vehiclesOwned: 3,
  },
  {
    id: 'mem-wr',
    name: 'Wyatt Rhodes',
    email: 'wyatt@nsc.club',
    phone: '(530) 555-8839',
    city: 'Newcastle, CA',
    company: 'Rhodes & Co.',
    tier: 'STANDARD',
    joined: '2020-10-10',
    conciergeNotes: 'Weekend access only. Needs battery tender checked monthly.',
    vehiclesOwned: 2,
  },
  {
    id: 'mem-nr',
    name: 'Nadia Reyes',
    email: 'nadia@nsc.club',
    phone: '(650) 555-4442',
    city: 'Menlo Park, CA',
    company: 'Halo Bio',
    tier: 'PREMIUM',
    joined: '2023-09-14',
    conciergeNotes: '1969 911 requires soft cover only.',
    vehiclesOwned: 1,
  },
  {
    id: 'mem-es',
    name: 'Erika Samuels',
    email: 'erika@nsc.club',
    phone: '(510) 555-8844',
    city: 'Oakland, CA',
    company: 'North Pier Advisors',
    tier: 'PREMIUM',
    joined: '2021-12-01',
    conciergeNotes: 'Concierge wash scheduled every other Friday.',
    vehiclesOwned: 3,
  },
  {
    id: 'mem-kl',
    name: 'Kenzo Lee',
    email: 'kenzo@nsc.club',
    phone: '(415) 555-1044',
    city: 'Corte Madera, CA',
    company: 'Newlight Ventures',
    tier: 'STANDARD',
    joined: '2024-04-09',
    conciergeNotes: 'New member — onboarding call complete.',
    vehiclesOwned: 1,
  },
];

export const mockStorageSpots: StorageSpotRecord[] = [
  { id: 'spot-a04', code: 'Bay A04', level: 'Gallery Lane', size: 'Standard', climate: 'Climate' },
  { id: 'spot-b11', code: 'Bay B11', level: 'Lower Vault', size: 'Standard', climate: 'Climate' },
  { id: 'spot-c02', code: 'Bay C02', level: 'Main Floor', size: 'Oversize', climate: 'Standard' },
  { id: 'spot-d07', code: 'Bay D07', level: 'Main Floor', size: 'Standard', climate: 'Standard' },
  { id: 'spot-e03', code: 'Bay E03', level: 'Gallery Lane', size: 'Standard', climate: 'Climate' },
  { id: 'spot-f01', code: 'Bay F01', level: 'Mezzanine', size: 'Oversize', climate: 'Standard' },
  { id: 'spot-heritage-2', code: 'Heritage-2', level: 'Private Heritage Wing', size: 'Heritage', climate: 'Climate' },
  { id: 'spot-c12', code: 'Bay C12', level: 'Main Floor', size: 'Standard', climate: 'Standard' },
];

export const mockVehicles: VehicleRecord[] = [
  {
    id: 'veh-f930',
    ownerId: 'mem-lf',
    year: 2022,
    make: 'Ferrari',
    model: '296 GTB',
    color: 'Rosso Corsa',
    status: 'IN_STORAGE',
    storageSpotId: 'spot-a04',
    vin: 'ZFF90CPAXN0281412',
    photoUrl: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'veh-gt4r',
    ownerId: 'mem-mo',
    year: 2020,
    make: 'Porsche',
    model: '718 GT4 RS',
    color: 'Arctic Silver',
    status: 'CHECKED_OUT',
    storageSpotId: 'spot-b11',
    vin: 'WP0ZZZ98ZLK263882',
    photoUrl: 'https://images.unsplash.com/photo-1485163819542-13adeb5e0068?auto=format&fit=crop&w=600&q=80',
    notes: 'Out for Sierra foothill drive — due back Sunday.',
  },
  {
    id: 'veh-ur99',
    ownerId: 'mem-wr',
    year: 2019,
    make: 'Lamborghini',
    model: 'Urus',
    color: 'Nero Noctis',
    status: 'IN_STORAGE',
    storageSpotId: 'spot-c02',
    vin: 'ZPBUA1ZL5KLA12877',
    photoUrl: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'veh-bc12',
    ownerId: 'mem-kl',
    year: 2024,
    make: 'Mercedes-Benz',
    model: 'G 63',
    color: 'Emerald Green',
    status: 'CHECKED_OUT',
    storageSpotId: 'spot-d07',
    vin: 'W1NYC7HJ5RX477201',
    photoUrl: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'veh-gt12',
    ownerId: 'mem-es',
    year: 2021,
    make: 'McLaren',
    model: '720S Spider',
    color: 'Volcano Yellow',
    status: 'IN_STORAGE',
    storageSpotId: 'spot-e03',
    vin: 'SBM14FCA6MW005921',
    photoUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'veh-bron',
    ownerId: 'mem-wr',
    year: 2023,
    make: 'Ford',
    model: 'Bronco Raptor',
    color: 'Azure Gray',
    status: 'CHECKED_OUT',
    storageSpotId: 'spot-f01',
    vin: '1FMEE5JR2PLB11082',
    photoUrl: 'https://images.unsplash.com/photo-1449130015084-2d48a345ae68?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'veh-rsf9',
    ownerId: 'mem-nr',
    year: 1969,
    make: 'Porsche',
    model: '911 S',
    color: 'Signal Orange',
    status: 'IN_STORAGE',
    storageSpotId: 'spot-heritage-2',
    vin: '9110300771',
    photoUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80',
  },
];
