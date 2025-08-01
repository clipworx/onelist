'use client'

import { useState } from 'react'

type Product = {
  _id: string
  name: string
  unit: string
  quantity: number
  status: 'not_started' | 'partial' | 'completed'
  quantityLacking: number
  completedBy: string | null
  addedBy?: string
}

type ProductItemProps = {
  listId: string
  product: Product
  userId: string
  onUpdated: () => void
}

export default function ProductItem({
  listId,
  product,
  userId,
  onUpdated,
}: ProductItemProps) {
  const [status, setStatus] = useState(product.status)
  const [quantityLacking, setQuantityLacking] = useState(product.quantityLacking || 0)
  const [updating, setUpdating] = useState(false)

  const handleUpdate = async () => {
    setUpdating(true)
    try {
        console.log('Updating product:', {
          listId,
          productId: product._id,
          status,
          quantityLacking,
          userId,
        })
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lists/${listId}/products/${product._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          quantityLacking,
          userId,
        }),
      })

      onUpdated()
    } catch (err) {
      console.error('Failed to update product:', err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <li
      key={product._id}
      className="p-3 border rounded bg-gray-50 hover:bg-gray-100 space-y-2 text-gray-800"
    >
      <div className="flex justify-between items-center">
        <div>
          <span className="font-medium">{product.name}</span>{' '}
          ({product.quantity} {product.unit})
        </div>
        <div className="text-sm text-gray-600 capitalize">
          Status: {product.status}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Product['status'])}
          className="border px-2 py-1 rounded"
        >
          <option value="not_started">Not Started</option>
          <option value="partial">Partial</option>
          <option value="completed">Completed</option>
        </select>

        {status === 'partial' && (
          <input
            type="number"
            min={0}
            max={product.quantity}
            value={quantityLacking}
            onChange={(e) => setQuantityLacking(Number(e.target.value))}
            className="w-20 border px-2 py-1 rounded"
            placeholder="Qty lacking"
          />
        )}

        <button
          onClick={handleUpdate}
          disabled={updating}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          {updating ? 'Saving...' : 'Save'}
        </button>
      </div>
    </li>
  )
}
