import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'] & {
      role?: 'admin' | 'member';
    };
  }

  interface User {
    role?: 'admin' | 'member';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'admin' | 'member';
  }
}
