import { requireRestaurant } from '@/lib/session'
import { adminFetcher } from '@/lib/api/api_server_backend'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { formatCurrency } from '@/lib/utils'
import NewProductButton from '@/components/products/NewProductButton'

export default async function RestaurantProductsPage() {
  const session = await requireRestaurant()
  const restaurantId = session.user.restaurantId!

  const [products, restaurant] = await Promise.all([
    adminFetcher<any[]>(`/api/products?restaurantId=${restaurantId}`),
    adminFetcher<any>(`/api/restaurants/${restaurantId}`),
  ])

  const restaurants = restaurant ? [restaurant] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Produtos</h1>
          <p className="text-gray-400 mt-1">{products.length} produtos no menu</p>
        </div>
        <NewProductButton restaurants={restaurants} />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Produto</TableHeader>
            <TableHeader>Preço</TableHeader>
            <TableHeader>IVA</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium text-white">
                {product.name}
              </TableCell>
              <TableCell>{formatCurrency(product.price)}</TableCell>
              <TableCell className="text-gray-500 text-xs">
                  {typeof product.taxPercentage === 'string' 
                    ? product.taxPercentage.replace('VAT_', '') 
                    : product.taxPercentage}%

              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
