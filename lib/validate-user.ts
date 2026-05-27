// lib/validate-user.ts
import bcrypt from 'bcryptjs'
import { findUserForLogin } from '@/lib/api/api_server_backend'

export async function validateUserCredentials(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim()
  
  console.log('[VALIDATE] Starting validation for:', normalizedEmail);

  // Use the public version for login
  const user = await findUserForLogin(normalizedEmail)
  
  console.log('[VALIDATE] User found:', user ? {
    id: user.id,
    email: user.email,
    role: user.role,
    hasPassword: !!user.password,
  } : 'No user');

  if (!user) {
    console.log('[VALIDATE] User not found');
    return { ok: false as const, reason: 'not_found' as const }
  }

  if (user.role !== 'ADMIN' && user.role !== 'RESTAURANT') {
    console.log('[VALIDATE] Invalid role:', user.role);
    return { ok: false as const, reason: 'role' as const }
  }

  console.log('[VALIDATE] Comparing passwords...');
  const valid = bcrypt.compareSync(password, user.password)
  console.log('[VALIDATE] Password valid:', valid);
  
  if (!valid) {
    console.log('[VALIDATE] Invalid password');
    return { ok: false as const, reason: 'password' as const }
  }

  const needsSetup = user.role === 'RESTAURANT' && !user.restaurantId

  console.log('[VALIDATE] Validation successful! Returning user with id:', user.id);
  
  return {
    ok: true as const,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
      restaurantName: user.restaurantName ?? null,
      needsSetup,
    },
  }
}