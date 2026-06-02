export const DEFAULT_PRODUCT_CATEGORIES = [
  'PIZZAS',
  'HAMBURGERS',
  'REFRIGERANTES',
  'GELADOS',
  'SOBREMESAS',
  'ENTRADAS',
  'PRATOS',
  'SALADAS',
  'BEBIDAS',
  'OUTROS',
] as const

export function normalizeCategory(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, '_')
}
