// lib/auth.ts
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { validateUserCredentials } from '@/lib/validate-user'
import type { Role } from '@/types/next-auth'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { 
    strategy: 'jwt', 
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
      }
    },
    callbackUrl: {
      name: `next-auth.callback_url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
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
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('[NextAuth] Missing credentials');
            return null;
          }

          console.log('[NextAuth] Validating credentials for:', credentials.email);
          
          // First, validate credentials locally
          const result = await validateUserCredentials(
            credentials.email,
            credentials.password
          );

          if (!result.ok) {
            console.log('[NextAuth] Validation failed:', result.reason);
            return null;
          }

          console.log('[NextAuth] Validation successful for:', result.user.email);
          
          // IMPORTANT: Get a token from YOUR BACKEND API, don't generate your own
          const backendUrl = process.env.BACKEND_API_URL || 'https://aodelivery-api.angolaerp.co.ao';
          const loginResponse = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!loginResponse.ok) {
            const errorData = await loginResponse.json();
            console.error('[NextAuth] Backend login failed:', errorData);
            return null;
          }

          const loginData = await loginResponse.json();
          
          if (!loginData.loginToken) {
            console.error('[NextAuth] No token returned from backend');
            return null;
          }

          console.log('[NextAuth] Successfully got token from backend API');
          
          // Return user with the BACKEND'S token, not a generated one
          const userWithToken = {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            restaurantId: result.user.restaurantId,
            restaurantName: result.user.restaurantName ?? null,
            accessToken: loginData.loginToken, // Use the token from your backend!
          };
          
          console.log('[NextAuth] Returning user with backend token:', {
            id: userWithToken.id,
            role: userWithToken.role,
            hasToken: !!userWithToken.accessToken
          });
          
          return userWithToken;
        } catch (error) {
          console.error('[NextAuth] Authorize error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('[JWT Callback] Before update:', { 
        hasToken: !!token.accessToken, 
        hasUser: !!user,
        userId: token.id
      });
      
      // When user signs in, add their data to the token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.restaurantId = user.restaurantId;
        token.restaurantName = user.restaurantName;
        token.accessToken = user.accessToken; // This is now the backend's token
        console.log('[JWT Callback] Added to JWT:', { 
          id: token.id, 
          role: token.role,
          hasAccessToken: !!token.accessToken,
          accessTokenPreview: token.accessToken ? token.accessToken.substring(0, 30) + '...' : 'none'
        });
      } else {
        console.log('[JWT Callback] No user object, keeping existing token');
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log('[Session Callback] Before update:', {
        hasSessionUser: !!session.user,
        hasTokenAccessToken: !!token.accessToken,
        tokenKeys: Object.keys(token)
      });
      
      // Add token data to session
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.restaurantId = token.restaurantId as string;
        session.user.restaurantName = token.restaurantName as string;
        session.user.accessToken = token.accessToken as string; // This is the backend's token
        
        console.log('[Session Callback] After update:', {
          id: session.user.id,
          role: session.user.role,
          hasAccessToken: !!session.user.accessToken,
          accessTokenPreview: session.user.accessToken ? session.user.accessToken.substring(0, 30) + '...' : 'none'
        });
      } else {
        console.log('[Session Callback] Missing session.user or token');
      }
      
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
}