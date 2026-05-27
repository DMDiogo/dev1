// lib/api/api_server_backend.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const API_BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';


// Helper: Get client-side token
function getClientToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

// Helper: Get server-side token from NextAuth session
async function getServerToken(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG] Session exists:', !!session);
      if (session?.user) {
        console.log('[DEBUG] User has accessToken:', !!session.user.accessToken);
      }
    }
    
    return session?.user?.accessToken || null;
  } catch (error) {
    console.error('[Server Token Error]:', error);
    return null;
  }
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

// lib/api/api_server_backend.ts

// Add this NEW function for login (no authentication required)
export async function findUserForLogin(email: string) {
  try {
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

// NEW: Public function for login - NO AUTHENTICATION REQUIRED
export async function findUserForLogin_(email: string) {
  try {
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

// Keep this for authenticated requests (admin features)
export async function findUserByEmail_v3(email: string) {
  const users = await fetcher<any[]>(`/api/users?search=${encodeURIComponent(email)}`, {}, true);
  return users.find(user => user.email === email) || null;
}

// Rest of your existing functions...
export async function findUserById(id: string) {
  return adminFetcher(`/api/users/${id}`);
}

export const adminFetcher = <T>(endpoint: string, options?: RequestInit) => 
  fetcher<T>(endpoint, options, true);

export const publicFetcher = <T>(endpoint: string, options?: RequestInit) => 
  fetcher<T>(endpoint, options, false);

// Other functions remain the same...
export async function getDashboardMetrics(): Promise<any> {
  console.log('Getting dashboard metrics...');
  return adminFetcher('/api/admin/dashboard');
}

export async function createUser(data: any) {
  return publicFetcher('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ... rest of your API functions (getRestaurants, createRestaurant, etc.)

// Helper: Get client-side token
function getClientToken_(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

// Helper: Get server-side token from NextAuth session
async function getServerToken_(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG] Session exists:', !!session);
      if (session?.user) {
        console.log('[DEBUG] User has accessToken:', !!session.user.accessToken);
      }
    }
    
    return session?.user?.accessToken || null;
  } catch (error) {
    console.error('[Server Token Error]:', error);
    return null;
  }
}

// lib/api/api_server_backend.ts
// lib/api/api_server_backend.ts

// Add this public version for login
export async function publicFindUserByEmail(email: string) {
  try {
    const url = `${API_BASE_URL}/api/users/public/find-by-email?email=${encodeURIComponent(email)}`;
    console.log(`[PUBLIC FIND USER] GET ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to find user');
    }
    
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('[PUBLIC FIND USER] Error:', error);
    return null;
  }
}

// Keep your original findUserByEmail for authenticated requests
export async function findUserByEmail_v2(email: string) {
  // This now requires authentication (for admin features)
  const users = await fetcher<any[]>(`/api/users?search=${encodeURIComponent(email)}`, {}, true);
  return users.find(user => user.email === email) || null;
}

// Public version for authentication (no token required)
export async function publicFindUserByEmail_(email: string) {
  try {
    const url = `${API_BASE_URL}/api/users?search=${encodeURIComponent(email)}`;
    console.log(`[PUBLIC FETCH] GET ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`[Public API Error] ${response.status}:`, await response.text());
      return null;
    }
    
    const users = await response.json();
    return users.find((user: any) => user.email === email) || null;
  } catch (error) {
    console.error('[Public Fetch Error]', error);
    return null;
  }
}

// Or create a dedicated login endpoint that doesn't require auth
export async function loginUser(email: string, password: string) {
  try {
    const url = `${API_BASE_URL}/api/auth/login`;
    console.log(`[LOGIN] POST ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Login Error]', error);
    throw error;
  }
}

// Main fetcher function - the generic one (renamed from fetcher_ to fetcher)
export async function fetcher_<T = any>(
  endpoint: string, 
  options: RequestInit = {}, 
  requiresAuth: boolean = true
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[FETCH] ${options.method || 'GET'} ${url} (auth: ${requiresAuth})`);
    
    // Create headers as Record<string, string>
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add custom headers from options
    if (options.headers) {
      const customHeaders = options.headers as Record<string, string>;
      Object.assign(headers, customHeaders);
    }
    
    // Add auth token if required
    if (requiresAuth) {
      let token: string | null = null;
      
      // Server-side (Next.js Server Components)
      if (typeof window === 'undefined') {
        token = await getServerToken();
        console.log(`[Server] Token found: ${!!token}`);
        if (token) console.log(`[Server] Token preview: ${token.substring(0, 30)}...`);
      } 
      // Client-side (Browser)
      else {
        token = getClientToken();
        
        // Fallback to NextAuth session if no token in storage
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
    
    // Handle non-JSON responses
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

// Convenience exports
export const adminFetcher_ = <T>(endpoint: string, options?: RequestInit) => 
  fetcher<T>(endpoint, options, true);

export const publicFetcher_ = <T>(endpoint: string, options?: RequestInit) => 
  fetcher<T>(endpoint, options, false);

// Your specific API functions
export async function getDashboardMetrics_(): Promise<any> {
  console.log('Getting dashboard metrics...');
  return adminFetcher('/api/admin/dashboard');
}

export async function findUserByEmail_v1(email: string) {
  const users = await fetcher<any[]>(`/api/users?search=${encodeURIComponent(email)}`, {}, true);
  return users.find(user => user.email === email) || null;
}

export async function createUser_(data: any) {
  return publicFetcher('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function findUserById_(id: string) {
  return adminFetcher(`/api/users/${id}`);
}

// Restaurant API functions
export async function getRestaurants() {
  return adminFetcher(`/api/restaurants`);
}

export async function createRestaurant(data: any) {
  return adminFetcher(`/api/restaurants`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getRestaurantById(id: string) {
  return adminFetcher(`/api/restaurants/${id}`);
}

export async function updateRestaurant(id: string, data: any) {
  return adminFetcher(`/api/restaurants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteRestaurant(id: string) {
  return adminFetcher(`/api/restaurants/${id}`, {
    method: 'DELETE',
  });
}

// Product API functions
export async function getProducts() {
  return adminFetcher(`/api/products`);
}

export async function createProduct(data: any) {
  return adminFetcher(`/api/products`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getProductById(id: string) {
  return adminFetcher(`/api/products/${id}`);
}

export async function updateProduct(id: string, data: any) {
  return adminFetcher(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string) {
  return adminFetcher(`/api/products/${id}`, {
    method: 'DELETE',
  });
}

// Order API functions
export async function getOrders() {
  return adminFetcher(`/api/orders`);
}

export async function getOrderById(id: string) {
  return adminFetcher(`/api/orders/${id}`);
}

export async function updateOrder(id: string, data: any) {
  return adminFetcher(`/api/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Dashboard API functions
export async function getDashboardStats() {
  return adminFetcher(`/api/dashboard`);
}