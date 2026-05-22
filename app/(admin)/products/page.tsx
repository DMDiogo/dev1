import { prisma } from '@/lib/prisma'
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

export default async function ProductsPage() {
  const [products, restaurants] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: 'asc' },
      include: { restaurant: { select: { name: true } } },
    }),
    prisma.restaurant.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Produtos
          </h1>
          <p className="text-gray-400 mt-1">
            {products.length} produtos em todos os restaurantes
          </p>
        </div>
        <NewProductButton restaurants={restaurants} />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Produto</TableHeader>
            <TableHeader>Restaurante</TableHeader>
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
              <TableCell className="text-gray-400">
                {product.restaurant.name}
              </TableCell>
              <TableCell>{formatCurrency(product.price)}</TableCell>
              <TableCell className="text-gray-500 text-xs">
                {product.taxPercentage.replace('VAT_', '')}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
