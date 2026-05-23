import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { decode } from 'next-auth/jwt'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

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
            return null
          }

          const email = credentials.email.toLowerCase().trim()
          const password = credentials.password

          // Token temporário gerado por POST /api/auth/login (Prisma validado lá)
          if (password.length > 80) {
            const decoded = await decode({
              token: password,
              secret: process.env.NEXTAUTH_SECRET!,
            })

            if (decoded?.loginBridge && decoded.sub) {
              const user = await prisma.user.findUnique({
                where: { id: decoded.sub },
                include: { restaurant: { select: { name: true } } },
              })

              if (
                user &&
                (user.role === 'ADMIN' || user.role === 'RESTAURANT')
              ) {
                return {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  restaurantId: user.restaurantId,
                  restaurantName: user.restaurant?.name ?? null,
                }
              }
            }
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email },
            include: { restaurant: { select: { name: true } } },
          })

          if (!user) return null
          if (user.role !== 'ADMIN' && user.role !== 'RESTAURANT') return null

          const valid = bcrypt.compareSync(password, user.password)
          if (!valid) return null

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            restaurantId: user.restaurantId,
            restaurantName: user.restaurant?.name ?? null,
          }
        } catch (error) {
          console.error('[auth] authorize:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.restaurantId = user.restaurantId
        token.restaurantName = user.restaurantName
      }
      return token
    },
    async session({ session, token }) {
      if (!session.user || !token?.id) return session

      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        include: { restaurant: { select: { name: true } } },
      })

      if (dbUser) {
        session.user.id = dbUser.id
        session.user.name = dbUser.name
        session.user.email = dbUser.email
        session.user.role = dbUser.role
        session.user.restaurantId = dbUser.restaurantId
        session.user.restaurantName = dbUser.restaurant?.name ?? null
      } else {
        session.user.id = token.id as string
        session.user.role = token.role
        session.user.restaurantId = token.restaurantId
        session.user.restaurantName = token.restaurantName
      }

      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
