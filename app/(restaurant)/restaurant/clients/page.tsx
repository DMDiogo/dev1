import { requireRestaurant } from '@/lib/session'
import { getClients } from '@/lib/api/api_server_backend'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { formatDate } from '@/lib/utils'

export default async function RestaurantClientsPage() {
  const session = await requireRestaurant()
  const restaurantId = session.user.restaurantId!

  const clients = await getClients(restaurantId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Clientes</h1>
        <p className="text-gray-400 mt-1">
          {clients.length} clientes com pedidos no seu restaurante
        </p>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Nome</TableHeader>
            <TableHeader>Email</TableHeader>
            <TableHeader>Telefone</TableHeader>
            <TableHeader>Pedidos</TableHeader>
            <TableHeader>Registo</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium text-white">
                {client.name}
              </TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.telephone}</TableCell>
              <TableCell>{client.orders?.length ?? 0}</TableCell>
              <TableCell className="text-gray-500 text-xs">
                {formatDate(client.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
