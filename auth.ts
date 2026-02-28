import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { verifyUser } from '@/lib/auth/users';
import type { PublicUser } from '@/lib/auth/users';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'Member Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = typeof credentials?.email === 'string' ? credentials.email : '';
        const password = typeof credentials?.password === 'string' ? credentials.password : '';

        if (!email || !password) {
          throw new Error('MISSING_CREDENTIALS');
        }

        const result = verifyUser(email, password);

        if (!result.success) {
          throw new Error(result.reason);
        }

        return result.user;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const typedUser = user as PublicUser;
        if (typedUser.role) {
          token.role = typedUser.role;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role;
      }
      return session;
    },
  },
});

export const handlers = { GET, POST };
