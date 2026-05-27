// lib/auth.ts
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { validateUserCredentials } from '@/lib/validate-user'
import jwt from 'jsonwebtoken'
import type { Role } from '@/types/next-auth'

// In lib/auth.ts - authorize function
import { publicFetcher } from '@/lib/api/api_server_backend'

// lib/auth.ts - Update the generateAccessToken function

function generateAccessToken(user: any) {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET or NEXTAUTH_SECRET is not defined')
  }
  
  console.log('[JWT] Generating token for user:', { id: user.id, role: user.role, email: user.email });
  
  // IMPORTANT: Match the exact format your backend expects
  // Your backend uses jwt.verify and expects userId (not just id)
  const token = jwt.sign(
    { 
      userId: user.id,      // Must be 'userId' (not just 'id')
      role: user.role,      // Must include role
      email: user.email,    // Include email
      // Add any other fields your backend might expect
    },
    secret,
    { expiresIn: '7d' }     // Must match backend expiration
  );
  
  console.log('[JWT] Token generated successfully');
  return token;
}

// Helper function to generate JWT token for your backend
function generateAccessToken_(user: any) {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET or NEXTAUTH_SECRET is not defined')
  }
  
  console.log('[JWT] Generating token for user:', { id: user.id, role: user.role, email: user.email });
  
  // Create token matching your backend's expected format
  const token = jwt.sign(
    { 
      userId: user.id, 
      role: user.role, 
      email: user.email 
    },
    secret,
    { expiresIn: '7d' }
  );
  
  console.log('[JWT] Token generated:', token.substring(0, 50) + '...');
  return token;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { 
    strategy: 'jwt', 
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.COOKIE_DOMAIN || undefined,
      }
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.COOKIE_DOMAIN || undefined,
      }
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Host-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.COOKIE_DOMAIN || undefined,
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
          
          const result = await validateUserCredentials(
            credentials.email,
            credentials.password
          );

          if (!result.ok) {
            console.log('[NextAuth] Validation failed:', result.reason);
            return null;
          }

          console.log('[NextAuth] Validation successful for:', result.user.email);
          console.log('[NextAuth] User object from validation:', JSON.stringify(result.user, null, 2));
          
          // Generate access token for backend API
          const accessToken = generateAccessToken(result.user);
          
          const userWithToken = {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            restaurantId: result.user.restaurantId,
            restaurantName: result.user.restaurantName ?? null,
            accessToken: accessToken,
          };
          
          console.log('[NextAuth] Returning user with token:', {
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
        token.accessToken = user.accessToken;
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
        session.user.accessToken = token.accessToken as string;
        
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