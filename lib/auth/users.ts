type Role = 'admin' | 'member';

type InviteStatus = 'active' | 'pending' | 'revoked';

type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  status: InviteStatus;
};

// TODO: Replace this hardcoded seed with Prisma-backed member invites.
const INVITED_MEMBERS: StoredUser[] = [
  {
    id: 'admin-1',
    name: 'NSC Admin',
    email: 'admin@nsc.com',
    password: process.env.NSC_ADMIN_PASSWORD || 'admin',
    role: 'admin',
    status: 'active',
  },
  {
    id: 'member-1',
    name: 'NSC Member',
    email: 'member@nsc.com',
    password: process.env.NSC_MEMBER_PASSWORD || 'member123',
    role: 'member',
    status: 'active',
  },
  {
    id: 'pending-1',
    name: 'Pending Member',
    email: 'pending@nsc.com',
    password: 'placeholder',
    role: 'member',
    status: 'pending',
  },
];

export type PublicUser = Omit<StoredUser, 'password'>;

export type VerifyFailureReason = 'NOT_INVITED' | 'INVITE_PENDING' | 'INVALID_PASSWORD';

export type VerifyResult =
  | {
      success: true;
      user: PublicUser;
    }
  | {
      success: false;
      reason: VerifyFailureReason;
    };

export function verifyUser(email: string, password: string): VerifyResult {
  const normalizedEmail = email.trim().toLowerCase();
  const match = INVITED_MEMBERS.find((member) => member.email.toLowerCase() === normalizedEmail);

  if (!match) {
    return { success: false, reason: 'NOT_INVITED' };
  }

  if (match.status !== 'active') {
    if (match.status === 'pending') {
      return { success: false, reason: 'INVITE_PENDING' };
    }
    return { success: false, reason: 'NOT_INVITED' };
  }

  if (match.password !== password) {
    return { success: false, reason: 'INVALID_PASSWORD' };
  }

  const { password: _password, ...safeUser } = match;
  void _password;

  return {
    success: true,
    user: safeUser,
  };
}
