import { fetcher } from '@/lib/api/api_server_backend'
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
    fetcher<any[]>('/api/products', {}, true), // requires auth
    fetcher<any[]>('/api/restaurants', {}, false) // public endpoint
  ])

  console.log('Products loaded:', products?.length || 0);
  console.log('Restaurants loaded:', restaurants?.length || 0);

  console.log(products[0]);

  // Helper function to format tax percentage
  const formatTaxPercentage = (taxPercentage: string | number | null | undefined): string => {
    console.log('IVA ', taxPercentage);
    if (!taxPercentage) return '0%';
    
    if (typeof taxPercentage === 'string') {
      return taxPercentage.replace('VAT_', '') + '%';
    }
    
    if (typeof taxPercentage === 'number') {
      return taxPercentage + '%';
    }
    
    return '0%';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Produtos
          </h1>
          <p className="text-gray-400 mt-1">
            {products?.length || 0} produtos em todos os restaurantes
          </p>
        </div>
        <NewProductButton restaurants={restaurants || []} />
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
          {products?.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium text-white">
                {product.name}
              </TableCell>
              <TableCell className="text-gray-400">
                {product.restaurant?.name ?? 'Desconhecido'}
              </TableCell>
              <TableCell>{formatCurrency(product.price || 0)}</TableCell>
              <TableCell className="text-gray-500 text-xs">
                {formatTaxPercentage(product.taxPercentage)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {(!products || products.length === 0) && (
        <div className="text-center py-12 text-gray-400">
          Nenhum produto encontrado. Clique em "Novo Produto" para adicionar.
        </div>
      )}
    </div>
  )
}