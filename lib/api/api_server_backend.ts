import {
  buildClientsFromOrders,
  buildDriversFromAllOrders,
  buildDriversFromOrders,
  buildRestaurantDashboardStats,
  filterOrderItemsForRestaurant,
  filterOrdersForRestaurant,
  orderBelongsToRestaurant,
  unwrapList,
} from '@/lib/restaurant-data'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth';
//import jwt from 'jsonwebtoken'
import jwt, { JwtPayload } from 'jsonwebtoken'

import { NextResponse } from 'next/server'

export function getApiBaseUrl() {
  return (
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3001'
  ).replace(/\/$/, '')
}

const API_BASE_URL = getApiBaseUrl()


// app/api/test-backend/route.ts

// lib/api/api_server_backend.ts

// Add this function - it should be PUBLIC (no authentication required)
export async function findUserForLogin(email: string) {
  try {
    // Use your public backend endpoint
    const url = `${API_BASE_URL}/api/auth/find-user?email=${encodeURIComponent(email)}`;
    console.log(`[LOGIN] Looking up user: ${email}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[LOGIN] User not found: ${email}`);
        return null;
      }
      if (response.status === 403) {
        console.log(`[LOGIN] Access denied for user: ${email}`);
        return null;
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to find user');
    }
    
    const user = await response.json();
    console.log(`[LOGIN] User found: ${user.email} (${user.role})`);
    return user;
  } catch (error) {
    console.error('[LOGIN] Error finding user:', error);
    return null;
  }
}

// Keep your existing findUserByEmail for authenticated requests
export async function findUserByEmail(email: string) {
  const users = await fetcher<any[]>(`/api/users?search=${encodeURIComponent(email)}`, {}, true);
  return users.find(user => user.email === email) || null;
}

// Helper: Get client-side token
function getClientToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

// Main fetcher function
export async function fetcher<T = any>(
  endpoint: string, 
  options: RequestInit = {}, 
  requiresAuth: boolean = true
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[FETCH] ${options.method || 'GET'} ${url} (auth: ${requiresAuth})`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.headers) {
      const customHeaders = options.headers as Record<string, string>;
      Object.assign(headers, customHeaders);
    }

    if (requiresAuth) {
      let token: string | null = null;

      if (typeof window === 'undefined') {
        token = await getServerToken();
        console.log(`[Server] Token found: ${!!token}`);
      } else {
        token = getClientToken();
        if (!token) {
          try {
            const { getSession } = await import('next-auth/react');
            const session = await getSession();
            token = session?.user?.accessToken || null;
          } catch (e) {
            console.warn('[Client] Could not get NextAuth session:', e);
          }
        }
        console.log(`[Client] Token found: ${!!token}`);
      }

      if (!token) {
        console.error(`[Auth Error] No token for ${endpoint}`);
        throw new Error('Authentication required. Please log in.');
      }

      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: headers as HeadersInit,
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`[Non-JSON Response] ${url}:`, text.substring(0, 200));
      throw new Error(`Server returned non-JSON response for ${endpoint}`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[API Error] ${response.status} ${endpoint}:`, errorData);
      throw new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(`[FETCH] Success: ${endpoint}`);
    return data as T;

  } catch (error) {
    console.error(`[FETCH Error] ${endpoint}:`, error);
    throw error;
  }
}

// Helper: Get server-side token from NextAuth session
async function getServerToken(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);

    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG] Session exists:', !!session);
      if (session?.user) {
        console.log('[DEBUG] User has accessToken:', !!session.user.accessToken);
        console.log('[DEBUG] User role:', session.user.role);
        console.log('[DEBUG] User id:', session.user.id);
        if (session.user.accessToken) {
          console.log('[DEBUG] Token preview:', session.user.accessToken.substring(0, 30) + '...');
        }
      }
    }

    return session?.user?.accessToken || null;
  } catch (error) {
    console.error('[Server Token Error]:', error);
    return null;
  }
}

// Helper to safely get expiration from token
function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as JwtPayload | string | null
    if (decoded && typeof decoded === 'object' && decoded.exp) {
      return new Date(decoded.exp * 1000)
    }
    return null
  } catch (error) {
    console.error('[Token] Failed to decode:', error)
    return null
  }
}

// Convenience exports
// @/lib/api/api_server_backend.ts


export async function adminFetcher<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Get session to retrieve JWT token
  const session = await getServerSession(authOptions)
  
  console.log('[adminFetcher] Session ID:', session?.user?.id)
  console.log('[adminFetcher] Session role:', session?.user?.role)
  console.log('[adminFetcher] Has accessToken:', !!session?.user?.accessToken)
  
  if (!session?.user?.accessToken) {
    console.error('[adminFetcher] No access token found - redirecting to login')
    throw new Error('Authentication required. Please log in.')
  }

  // Decode the token to see what's inside
  const decodedToken = jwt.decode(session.user.accessToken)
  console.log('[adminFetcher] Decoded token:', decodedToken)
  const expiration = getTokenExpiration(session.user.accessToken)
  if (expiration) {
    console.log('[adminFetcher] Token expires at:', expiration.toISOString())
    console.log('[adminFetcher] Token is expired:', expiration < new Date())
  } else {
    console.log('[adminFetcher] Could not determine token expiration')
  }

  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  console.log('[adminFetcher] Requesting:', url)

  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.user.accessToken}`,
        ...options?.headers,
      },
      cache: 'no-store',
    })
  } catch (networkError) {
    const detail =
      networkError instanceof Error ? networkError.message : 'fetch failed'
    console.error('[adminFetcher] Network error:', url, networkError)
    throw new Error(
      `Não foi possível contactar a API (${baseUrl}). Verifique BACKEND_API_URL, VPN/internet e se o servidor está online. (${detail})`
    )
  }

  // Handle 401 Unauthorized - token might be expired
  if (response.status === 401) {
    console.error('[adminFetcher] Token expired or invalid')
    throw new Error('Session expired. Please log in again.')
  }

  if (!response.ok) {
    const error = await response.text()
    console.error('[adminFetcher] Error response:', response.status, error)
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

// In @/lib/api/api_server_backend.ts

// Public fetcher - NO authentication required
export async function publicFetcher<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = getApiBaseUrl()

  console.log('[publicFetcher] Making request to:', `${baseUrl}${endpoint}`)

  let response: Response
  try {
    response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      cache: 'no-store',
    })
  } catch (networkError) {
    const detail =
      networkError instanceof Error ? networkError.message : 'fetch failed'
    throw new Error(
      `Não foi possível contactar a API (${baseUrl}). (${detail})`
    )
  }

  if (!response.ok) {
    const error = await response.text()
    console.error('[publicFetcher] Error response:', response.status, error)
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

// Admin fetcher - REQUIRES authentication
export async function adminFetcher_v1<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Get session to retrieve JWT token
  const session = await getServerSession(authOptions)
  
  console.log('[adminFetcher] Debug - Session exists:', !!session)
  console.log('[adminFetcher] Debug - User exists:', !!session?.user)
  console.log('[adminFetcher] Debug - Access token exists:', !!session?.user?.accessToken)

  if (!session?.user?.accessToken) {
    console.error('[adminFetcher] No access token found - user not authenticated')
    throw new Error('Authentication required. Please log in.')
  }

  const baseUrl = process.env.BACKEND_API_URL || 'http://localhost:3001'
  
  console.log('[adminFetcher] Making request to:', `${baseUrl}${endpoint}`)
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.user.accessToken}`,
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('[adminFetcher] Error response:', response.status, error)
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}


// In @/lib/api/api_server_backend.ts
export async function adminFetcher_<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Get session to retrieve JWT token
  const session = await getServerSession(authOptions)
  
  // In your adminFetcher or where you make the request
  console.log('[Debug] Session exists:', !!session)
  console.log('[Debug] User exists:', !!session?.user)
  console.log('[Debug] Access token exists:', !!session?.user?.accessToken)
  console.log('[Debug] Access token preview:', session?.user?.accessToken?.substring(0, 50))

  if (!session?.user?.accessToken) {
    console.error('[adminFetcher] No access token found')
    throw new Error('Authentication required. Please log in.')
  }

  const baseUrl = process.env.BACKEND_API_URL || 'http://localhost:3001'

  const url = `${baseUrl}${endpoint}`
  
  console.log('[adminFetcher] Making request to:', url)
  console.log('[adminFetcher] Token exists:', !!session.user.accessToken)  

  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.user.accessToken}`,
      ...options?.headers,
    },
  })

  

  if (!response.ok) {
    const error = await response.text()
    console.error('[adminFetcher] Error response:', response.status, error)
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

export const publicFetcher_ = <T>(endpoint: string, options?: RequestInit) => 
  fetcher<T>(endpoint, options, false);

// Dashboard functions
export async function getDashboardMetrics(): Promise<any> {
  return adminFetcher<any>('/api/dashboard')
}

// Restaurant API functions
export async function getRestaurants() {
  return adminFetcher<any[]>(`/api/restaurants`)
}

export async function getRestaurantById(id: string) {
  return adminFetcher<any>(`/api/restaurants/${id}`)
}

// Product API functions  
export async function getProducts() {
  return adminFetcher<any[]>(`/api/products`)
}

// Order API functions
export async function getOrders(search?: string) {
  const query = search ? `?q=${encodeURIComponent(search)}` : ''
  return adminFetcher<any[]>(`/api/orders${query}`)
}

export async function getOrderById(id: string) {
  return adminFetcher<any>(`/api/orders/${id}`)
}

type StaffUser = {
  id: string
  name: string
  email: string
  telephone?: string | null
  role: string
  status?: string
  createdAt: string
}

type DriverUser = StaffUser & {
  role: 'DRIVER'
  status?: string
  driverOrders?: { status?: string }[]
  _count?: { driverOrders?: number }
}

// User API functions
export async function getStaffUsers(): Promise<StaffUser[]> {
  const [adminsRaw, restaurantsRaw] = await Promise.all([
    adminFetcher<any>(`/api/users?role=ADMIN`),
    adminFetcher<any>(`/api/users?role=RESTAURANT`),
  ])

  const users: StaffUser[] = [
    ...unwrapList<StaffUser>(adminsRaw),
    ...unwrapList<StaffUser>(restaurantsRaw),
  ]

  return users.sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() -
      new Date(a.createdAt ?? 0).getTime()
  )
}

export async function getUserById(id: string) {
  return adminFetcher<any>(`/api/users/${id}`)
}

export async function updateUserStatus(id: string, status: string) {
  return adminFetcher<any>(`/api/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

async function getDriversFromOrders(): Promise<DriverUser[]> {
  const ordersRaw = await adminFetcher<any>(`/api/orders`)
  return buildDriversFromAllOrders(
    unwrapList(ordersRaw)
  ) as DriverUser[]
}

// Driver API functions
export async function getDrivers(): Promise<DriverUser[]> {
  let lastError: unknown = null

  try {
    const raw = await adminFetcher<any>(`/api/users?role=DRIVER`)
    const fromUsers = unwrapList<DriverUser>(raw)
    if (fromUsers.length > 0) return fromUsers
  } catch (error) {
    lastError = error
    console.warn(
      '[getDrivers] /api/users?role=DRIVER failed, trying orders:',
      error
    )
  }

  try {
    const fromOrders = await getDriversFromOrders()
    if (fromOrders.length > 0) return fromOrders
  } catch (error) {
    lastError = error
    console.error('[getDrivers] orders fallback failed:', error)
  }

  if (lastError instanceof Error) throw lastError
  if (lastError) throw new Error(String(lastError))
  return []
}

export async function getDriverById(id: string): Promise<DriverUser | null> {
  try {
    const user = await getUserById(id)
    if (user?.role === 'DRIVER') return user as DriverUser
  } catch (error) {
    console.warn('[getDriverById] user API failed:', error)
  }

  const drivers = await getDrivers()
  return drivers.find((driver) => driver.id === id) ?? null
}

// Client API functions
export async function getClients(restaurantId: string) {
  const orders = unwrapList(
    await adminFetcher<any>(`/api/orders?restaurantId=${restaurantId}`)
  )
  return buildClientsFromOrders(orders as any, restaurantId)
}

export async function getRestaurantOrders(restaurantId: string) {
  const orders = unwrapList(
    await adminFetcher<any>(`/api/orders?restaurantId=${restaurantId}`)
  )
  return filterOrdersForRestaurant(orders as any, restaurantId)
}

export async function getRestaurantOrderById(
  restaurantId: string,
  orderId: string
) {
  const order = await adminFetcher<any>(`/api/orders/${orderId}`)

  if (!order || !orderBelongsToRestaurant(order, restaurantId)) {
    throw new Error('Pedido nÃ£o encontrado')
  }

  return filterOrderItemsForRestaurant(order, restaurantId)
}

// Restaurant-specific dashboard stats (aggregated from available endpoints)
export async function getRestaurantDashboardStats(restaurantId: string) {
  const [ordersRaw, productsRaw] = await Promise.all([
    adminFetcher<any>(`/api/orders?restaurantId=${restaurantId}`),
    adminFetcher<any>(`/api/products?restaurantId=${restaurantId}`),
  ])

  return buildRestaurantDashboardStats(
    unwrapList(ordersRaw),
    unwrapList(productsRaw),
    restaurantId
  )
}

// Restaurant drivers â€” derived from orders (no admin-only /api/users access)
export async function getRestaurantDrivers(restaurantId: string) {
  const ordersRaw = await adminFetcher<any>(
    `/api/orders?restaurantId=${restaurantId}`
  )

  return buildDriversFromOrders(unwrapList(ordersRaw), restaurantId)
}