
// types/next-auth.d.ts
import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

// Define Role type
export type Role = 'ADMIN' | 'RESTAURANT' | 'CLIENT' | 'DRIVER'

// Order status type (used for filtering orders)
export type OrderStatus = 
  | 'PENDING'
  | 'ACCEPTED_DRIVER'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      restaurantId: string | null;
      restaurantName: string | null;
      accessToken: string;
      needsSetup?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role: Role;  // Use the Role type, not string
    accessToken: string;
    restaurantId?: string | null;
    restaurantName?: string | null;
    needsSetup?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;  // Use the Role type
    accessToken: string;
    restaurantId?: string | null;
    restaurantName?: string | null;
    needsSetup?: boolean;
  }
}