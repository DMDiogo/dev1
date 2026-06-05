'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import NewProductButton from '@/components/products/NewProductButton'
import EditProductModal from '@/components/products/EditProductModal'

type Product = {
  id: string
  name: string
  description?: string | null
  category?: string | null
  price: number
  taxPercentage?: string | number | null
  status?: string | null
  restaurant?: { name?: string } | null
}

type RestaurantOption = { id: string; name: string }

function formatTaxPercentage(taxPercentage: string | number | null | undefined) {
  if (!taxPercentage) return '0%'
  if (typeof taxPercentage === 'string') {
    return taxPercentage.replace('VAT_', '') + '%'
  }
  return `${taxPercentage}%`
}

function statusBadge(status: string | null | undefined) {
  if (status === 'INACTIVE') {
    return <Badge variant="danger">Inactivo</Badge>
  }
  if (status === 'STAND_BY') {
    return <Badge variant="warning">Em análise</Badge>
  }
  return <Badge variant="success">Activo</Badge>
}

export default function ProductsPanel({
  products,
  restaurants,
  showRestaurantColumn = true,
  editable = false,
}: {
  products: Product[]
  restaurants: RestaurantOption[]
  showRestaurantColumn?: boolean
  /** Painel restaurante: editar preço, IVA, descrição e estado */
  editable?: boolean
}) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products

    return products.filter((product) => {
      const name = product.name?.toLowerCase() ?? ''
      const restaurant = product.restaurant?.name?.toLowerCase() ?? ''
      const category = product.category?.toLowerCase() ?? ''
      const description = product.description?.toLowerCase() ?? ''
      const price = String(product.price ?? '')

      return (
        name.includes(q) ||
        restaurant.includes(q) ||
        category.includes(q) ||
        description.includes(q) ||
        price.includes(q)
      )
    })
  }, [products, query])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Produtos</h1>
          <p className="text-gray-400 mt-1">
            {filtered.length} de {products.length} produto
            {products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <NewProductButton restaurants={restaurants} />
      </div>

      <div className="relative max-w-xl">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar por nome, restaurante, categoria ou preço..."
          className="w-full bg-surface border border-surface-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-500/50"
        />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Produto</TableHeader>
            <TableHeader>Categoria</TableHeader>
            {showRestaurantColumn && <TableHeader>Restaurante</TableHeader>}
            <TableHeader>Preço</TableHeader>
            <TableHeader>IVA</TableHeader>
            <TableHeader>Estado</TableHeader>
            {editable && <TableHeader className="text-right">Acções</TableHeader>}
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <p className="font-medium text-white">{product.name}</p>
                {product.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </TableCell>
              <TableCell className="text-gray-400 text-xs uppercase">
                {product.category ?? '—'}
              </TableCell>
              {showRestaurantColumn && (
                <TableCell className="text-gray-400">
                  {product.restaurant?.name ?? 'Desconhecido'}
                </TableCell>
              )}
              <TableCell>{formatCurrency(product.price || 0)}</TableCell>
              <TableCell className="text-gray-500 text-xs">
                {formatTaxPercentage(product.taxPercentage)}
              </TableCell>
              <TableCell>{statusBadge(product.status)}</TableCell>
              {editable && (
                <TableCell className="text-right">
                  <EditProductModal product={product} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          {products.length === 0
            ? 'Nenhum produto encontrado. Clique em "Novo Produto" para adicionar.'
            : 'Nenhum produto corresponde à pesquisa.'}
        </div>
      )}
    </div>
  )
}
