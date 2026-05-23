import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

/**
 * Restaurantes disponíveis para associar a uma nova conta RESTAURANTE no registo.
 * Lista restaurantes que ainda não têm um gestor (utilizador RESTAURANT) associado.
 *
 * Nota: todos os admins partilham a mesma base de dados (Supabase).
 * Um restaurante criado por qualquer admin aparece aqui até ter conta de gestor.
 */
export async function GET() {
  const restaurants = await prisma.restaurant.findMany({
    where: {
      staff: {
        none: { role: 'RESTAURANT' },
      },
    },
    select: { id: true, name: true, address: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(restaurants)
}
