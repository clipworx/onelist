'use client'

import { useEffect, useState } from 'react'
import { Pencil } from "lucide-react"
import { io } from 'socket.io-client'
type CreatedBy = {
  nickname: string
  _id: string
}
type AddedBy = {
  nickname: string
  _id: string
}
type Product = {
  _id: string
  name: string
  unit: string
  quantity: number
  status: 'not_started' | 'partial' | 'completed'
  quantityLacking: number
  completedBy: CreatedBy | null
  addedBy?: AddedBy
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
  let [status, setStatus] = useState(product.status)
  const [quantityLacking, setQuantityLacking] = useState(product.quantityLacking || 0)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState("")
  const [editingStatus, setEditingStatus] = useState(false)
  const handleUpdate = async () => {
    setUpdating(true)
    try {
      const qtyLacking = Number(quantityLacking) // force numeric comparison

      if (qtyLacking < 0 || qtyLacking > product.quantity) {
        setError(`Value must be between 0 and ${product.quantity}`)
        setUpdating(false)
        return
      }

      let newStatus: 'completed' | 'not_started' | 'partial'

      if (qtyLacking === product.quantity) {
        newStatus = 'not_started'
      } else if (qtyLacking === 0) {
        newStatus = 'completed'
      } else {
        newStatus = 'partial'
      }

      setStatus(newStatus)

      await fetch(`/api/lists/${listId}/products/${product._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          quantityLacking: qtyLacking,
          userId,
        }),
      })
      onUpdated()
    } catch (err) {
      console.error('Failed to update product:', err)
    } finally {
      setUpdating(false)
      setEditingStatus(false)
    }
  }
  const handleStatusChange = (newStatus: 'completed' | 'not_started' | 'partial') => {
    setStatus(newStatus)

    if (newStatus === 'completed') {
      setQuantityLacking(0)
    } else if (newStatus === 'not_started') {
      setQuantityLacking(product.quantity)
    } else {
      // partial — user will input quantity manually
      // Optional: keep existing quantity if valid
      setQuantityLacking(prev =>
        prev > product.quantity ? product.quantity : prev
      )
    }
  }

  return (
    <li
      key={product._id}
      className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-800 shadow-sm"
    >
      {/* Top row: name & status */}
      <div className="flex justify-between items-center">
        {/* Product name & quantity */}
        <div>
          <span className="font-semibold text-lg">{product.name}</span>{" "}
          <span className="text-gray-500 text-sm">
            ({product.quantity} {product.unit})
          </span>

          {/* Quantity Lacking always visible when partial */}
          {product.status === "partial" && (
            <div className="text-sm text-gray-700 mt-1">
              <span className="font-medium">Quantity Lacking:</span>{" "}
              {product.quantityLacking}
            </div>
          )}
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              product.status === "completed"
                ? "bg-green-100 text-green-700"
                : product.status === "partial"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {product.status.replace("_", " ")}
          </span>

          {/* Edit icon */}
          {!editingStatus && (
            <button
              onClick={() => setEditingStatus(true)}
              className="p-1 rounded hover:bg-gray-200"
              title="Edit Status"
            >
              <Pencil size={16} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Edit Mode */}
      {editingStatus && (
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3 border-t border-gray-200 pt-3">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as Product["status"])}
            className="border px-2 py-1 rounded"
          >
            <option value="not_started">Not Started</option>
            <option value="partial">Partial</option>
            <option value="completed">Completed</option>
          </select>

          {status === "partial" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Quantity Lacking:</span>
              <input
                type="number"
                min={0}
                max={product.quantity}
                value={quantityLacking}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  if (value > product.quantity) {
                    setError(`Value cannot exceed ${product.quantity}`)
                  } else {
                    setError("")
                  }
                  setQuantityLacking(value)
                }}
                className={`w-20 border px-2 py-1 rounded ${
                  error ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Qty lacking"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              {updating ? "Saving..." : "Save"}
            </button>

            <button
              onClick={() => setEditingStatus(false)}
              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </li>
  )
}
