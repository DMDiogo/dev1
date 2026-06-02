'use client'

import { useId } from 'react'
import Label from '@/components/ui/Label'
import Input from '@/components/ui/Input'
import { DEFAULT_PRODUCT_CATEGORIES } from '@/lib/product-categories'

export default function CategoryField({
  defaultValue = '',
  required = true,
}: {
  defaultValue?: string
  required?: boolean
}) {
  const listId = useId()

  return (
    <div>
      <Label htmlFor="category">Categoria *</Label>
      <Input
        id="category"
        name="category"
        list={listId}
        required={required}
        defaultValue={defaultValue}
        placeholder="Ex: PIZZAS ou escreva uma nova"
        autoComplete="off"
      />
      <datalist id={listId}>
        {DEFAULT_PRODUCT_CATEGORIES.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>
      <p className="text-xs text-gray-500 mt-1.5">
        Escolha da lista ou escreva uma categoria nova (ex: GELADOS).
      </p>
    </div>
  )
}
