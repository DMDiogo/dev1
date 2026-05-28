// lib/auth.ts
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { validateUserCredentials } from '@/lib/validate-user'
import type { Role } from '@/types/next-auth'

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://aodelivery-api.angolaerp.co.ao'

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
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('[NextAuth] Missing credentials');
            return null;
          }

          console.log('[NextAuth] Validating credentials for:', credentials.email);
          
          // First, validate credentials locally (this works)
          const result = await validateUserCredentials(
            credentials.email,
            credentials.password
          );

          if (!result.ok) {
            console.log('[NextAuth] Validation failed:', result.reason);
            return null;
          }

          console.log('[NextAuth] Local validation successful for:', result.user.email);
          
          // Now try to get token from backend
          const backendUrl = `${BACKEND_API_URL}/api/auth/login`;
          console.log('[NextAuth] Attempting to fetch token from:', backendUrl);
          
          try {
            const loginResponse = await fetch(backendUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            });

            console.log('[NextAuth] Backend response status:', loginResponse.status);
            console.log('[NextAuth] Backend response headers:', {
              contentType: loginResponse.headers.get('content-type'),
              status: loginResponse.status
            });

            if (!loginResponse.ok) {
              const errorText = await loginResponse.text();
              console.error('[NextAuth] Backend error response:', errorText);
              return null;
            }

            const loginData = await loginResponse.json();
            console.log('[NextAuth] Backend response data keys:', Object.keys(loginData));
            console.log('[NextAuth] Full backend response:', JSON.stringify(loginData, null, 2));
            
            //const backendToken = loginData.loginToken || loginData.token;
            const backendToken = loginData.access_token || loginData.loginToken || loginData.token;

            console.log('token ', loginData.access_token);
            console.log('logintoken ', loginData.loginToken);
            console.log('logindata ', loginData.token);
            
            if (!backendToken) {
              console.error('[NextAuth] No token found in response. Available fields:', Object.keys(loginData));
              return null;
            }

            console.log('[NextAuth] Successfully got token from backend');
            
            return {
              id: result.user.id,
              name: result.user.name,
              email: result.user.email,
              role: result.user.role,
              restaurantId: result.user.restaurantId,
              restaurantName: result.user.restaurantName ?? null,
              accessToken: backendToken,
            };
            
          } catch (fetchError: unknown) {
            // Properly handle unknown error type
            console.error('[NextAuth] Fetch error occurred');
            
            if (fetchError instanceof Error) {
              console.error('[NextAuth] Error message:', fetchError.message);
              console.error('[NextAuth] Error name:', fetchError.name);
              console.error('[NextAuth] Error stack:', fetchError.stack);
              
              // Check for specific error types
              if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
                console.error('[NextAuth] Network error - unable to reach backend API');
                console.error('[NextAuth] Make sure the backend URL is correct and accessible');
              }
            } else {
              console.error('[NextAuth] Unknown error type:', fetchError);
            }
            
            // Return null to indicate authentication failure
            return null;
          }
          
        } catch (error: unknown) {
          console.error('[NextAuth] Authorize error occurred');
          if (error instanceof Error) {
            console.error('[NextAuth] Error message:', error.message);
            console.error('[NextAuth] Error stack:', error.stack);
          } else {
            console.error('[NextAuth] Unknown error:', error);
          }
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
        token.accessToken = user.accessToken;
        console.log('[JWT Callback] Token saved with accessToken:', !!token.accessToken);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.restaurantId = token.restaurantId as string;
        session.user.restaurantName = token.restaurantName as string;
        session.user.accessToken = token.accessToken as string;
        console.log('[Session Callback] Session has accessToken:', !!session.user.accessToken);
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
}