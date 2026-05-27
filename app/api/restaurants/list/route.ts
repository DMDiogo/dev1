import { NextResponse } from 'next/server'
import { adminFetcher } from '@/lib/api/api_server_backend'

/**
 * Restaurantes disponíveis para associar a uma nova conta RESTAURANTE no registo.
 * Lista restaurantes que ainda não têm um gestor (utilizador RESTAURANT) associado.
 *
 * Nota: todos os admins partilham a mesma base de dados (Supabase).
 * Um restaurante criado por qualquer admin aparece aqui até ter conta de gestor.
 */
export async function GET() {
  try {
    // Since we're moving away from Prisma, we'll fetch from our new API endpoint
    // The backend should handle filtering for restaurants without staff
    const restaurants = await adminFetcher<any[]>('/api/restaurants/list')
    return NextResponse.json(restaurants)
  } catch (error) {
    console.error('[api/restaurants/list GET] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
