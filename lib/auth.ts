// lib/auth.ts - Simplified version
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { validateUserCredentials } from '@/lib/validate-user'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('[NextAuth] Missing credentials');
            return null;
          }

          console.log('[NextAuth] Validating credentials for:', credentials.email);
          
          const result = await validateUserCredentials(
            credentials.email,
            credentials.password
          );

          if (!result.ok) {
            console.log('[NextAuth] Validation failed:', result.reason);
            return null;
          }

          console.log('[NextAuth] Validation successful for:', result.user.email);
          
          return {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            restaurantId: result.user.restaurantId,
            restaurantName: result.user.restaurantName,
          };
        } catch (error) {
          console.error('[NextAuth] Authorize error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.restaurantId = user.restaurantId;
        token.restaurantName = user.restaurantName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.restaurantId = token.restaurantId as string;
        session.user.restaurantName = token.restaurantName as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
}