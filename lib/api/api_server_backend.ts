import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import jwt from 'jsonwebtoken'

const API_BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';


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

  const baseUrl = process.env.BACKEND_API_URL || 'http://localhost:3001'

  // Don't add /api prefix if it's already in the endpoint
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  
  console.log('[adminFetcher] Requesting:', url)  
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.user.accessToken}`,
      ...options?.headers,
    },
    credentials: 'include',
  })

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
  const baseUrl = process.env.BACKEND_API_URL || 'http://localhost:3001'
  
  console.log('[publicFetcher] Making request to:', `${baseUrl}${endpoint}`)
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

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

// Driver API functions
export async function getDrivers() {
  return adminFetcher<any[]>(`/api/users?role=DRIVER`)
}

// Client API functions
export async function getClients(restaurantId: string) {
  return adminFetcher<any[]>(`/api/restaurants/${restaurantId}/clients`)
}

// Restaurant-specific endpoint for dashboard stats
export async function getRestaurantDashboardStats(restaurantId: string) {
  return adminFetcher<any>(`/api/restaurant/${restaurantId}/dashboard`)
}

// Restaurant drivers endpoint
export async function getRestaurantDrivers(restaurantId: string) {
  return adminFetcher<any[]>(`/api/restaurant/${restaurantId}/drivers`)
}