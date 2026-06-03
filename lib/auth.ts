// lib/auth.ts
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authenticateWithBackend, enrichRestaurantSession } from '@/lib/authenticate'
import type { Role } from '@/types/next-auth'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const result = await authenticateWithBackend(
          credentials.email,
          credentials.password
        )

        if (!result.ok) {
          console.log('[NextAuth] Login failed:', result.reason)
          return null
        }

        return {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          restaurantId: result.user.restaurantId,
          restaurantName: result.user.restaurantName,
          restaurantStatus: result.user.restaurantStatus,
          restaurantLogo: result.user.restaurantLogo,
          needsSetup: result.user.needsSetup,
          accessToken: result.accessToken,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.restaurantId = user.restaurantId
        token.restaurantName = user.restaurantName
        token.restaurantStatus = user.restaurantStatus
        token.restaurantLogo = user.restaurantLogo
        token.needsSetup = user.needsSetup
        token.accessToken = user.accessToken
      }

      if (trigger === 'update' && session) {
        if ('restaurantId' in session) {
          token.restaurantId = session.restaurantId as string | null
        }
        if ('restaurantName' in session) {
          token.restaurantName = session.restaurantName as string | null
        }
        if ('restaurantStatus' in session) {
          token.restaurantStatus = session.restaurantStatus as string | null
        }
        if ('restaurantLogo' in session) {
          token.restaurantLogo = session.restaurantLogo as string | null
        }
        if ('needsSetup' in session) {
          token.needsSetup = session.needsSetup as boolean
        }
      }

      if (token.role === 'RESTAURANT' && !token.restaurantId && token.id && token.email) {
        const enriched = await enrichRestaurantSession({
          id: token.id as string,
          email: token.email as string,
          role: token.role as string,
          restaurantId: token.restaurantId as string | null,
          restaurantName: token.restaurantName as string | null,
          restaurantStatus: token.restaurantStatus as string | null,
          restaurantLogo: token.restaurantLogo as string | null,
          needsSetup: token.needsSetup as boolean,
          accessToken: token.accessToken as string,
        })

        if (enriched.restaurantId) {
          token.restaurantId = enriched.restaurantId
          token.restaurantName = enriched.restaurantName ?? null
          token.restaurantStatus = enriched.restaurantStatus ?? null
          token.restaurantLogo = enriched.restaurantLogo ?? null
          token.needsSetup = false
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.restaurantId = token.restaurantId as string
        session.user.restaurantName = token.restaurantName as string
        session.user.restaurantStatus = token.restaurantStatus as string
        session.user.restaurantLogo = (token.restaurantLogo as string | null) ?? null
        session.user.needsSetup = token.needsSetup as boolean
        session.user.accessToken = token.accessToken as string
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
