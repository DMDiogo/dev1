import { adminFetcher } from '@/lib/api/api_server_backend'
import { unwrapList } from '@/lib/restaurant-data'
import UsersSearch from '@/components/users/UsersSearch'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const users = unwrapList(
    await adminFetcher<any[]>(`/api/users?role=CLIENT`)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Clientes</h1>
        <p className="text-gray-400 mt-1">
          {users.length} cliente{users.length !== 1 ? 's' : ''} registados
        </p>
      </div>
      <UsersSearch users={users} initialQuery={q?.trim() ?? ''} />
    </div>
  )
}
