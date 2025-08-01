'use client'

import { useState } from 'react'

type Product = {
  name: string
  unit: string
  quantity: number
  addedBy?: string
  completedBy?: string | null
  quantityLacking?: number
}

const units = ['pcs', 'kg', 'g', 'lb', 'oz', 'liter', 'ml', 'pack', 'bottle', 'can']

export default function CreateListPage() {
  const [listName, setListName] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAddProduct = () => {
    setProducts([...products, { name: '', unit: 'pcs', quantity: 1 }])
  }

  const handleProductChange = <K extends keyof Product>(
    index: number,
    field: K,
    value: string
  ) => {
    const updated = [...products]

    if (field === 'quantity') {
      updated[index][field] = Number(value) as Product[K]
    } else {
      updated[index][field] = value as Product[K]
    }

    setProducts(updated)
  }



  const handleSubmit = async () => {
    if (!listName.trim()) return alert('List name is required')
    setLoading(true)
    setMessage('')

    const res = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: listName, products }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setListName('')
      setProducts([{ name: '', unit: 'pcs', quantity: 1 }])
      setMessage('List created successfully!')
    } else {
      setMessage(data.error || 'Failed to create list')
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Create New List</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">List Name</label>
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
          placeholder="e.g. Grocery Run"
        />
      </div>

      <div className="overflow-x-auto mt-4">
  <table className="w-full table-auto border border-gray-200 text-black">
    <thead className="bg-gray-100">
      <tr className="text-left text-sm">
        <th className="p-2">Product</th>
        <th className="p-2">Unit</th>
        <th className="p-2">Qty</th>
        <th className="p-2 text-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      {products.map((product, index) => (
        <tr key={index} className="border-t border-gray-200 text-white">
          <td className="p-2">
            <input
              type="text"
              value={product.name}
              onChange={(e) => handleProductChange(index, 'name', e.target.value)}
              placeholder="e.g. Milk"
              className="w-full px-2 py-1 border rounded-md text-sm"
            />
          </td>
          <td className="p-2">
            <select
              value={product.unit}
              onChange={(e) => handleProductChange(index, 'unit', e.target.value)}
              className="w-full px-2 py-1 border rounded-md text-sm"
            >
              {units.map((unit) => (
                <option className="text-black" key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </td>
          <td className="p-2">
            <input
              type="number"
              value={product.quantity}
              onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
              min={1}
              className="w-full px-2 py-1 border rounded-md text-sm"
            />
          </td>
          <td className="p-2 text-center">
            <button
              type="button"
              onClick={() => setProducts(products.filter((_, i) => i !== index))}
              className="text-red-500 text-sm hover:underline"
            >
              Remove
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

<button
  type="button"
  onClick={handleAddProduct}
  className="mt-3 w-full bg-blue-100 text-blue-800 font-medium py-2 rounded-md"
>
  + Add Product
</button>


      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 transition"
      >
        {loading ? 'Saving...' : 'Create List'}
      </button>

      {message && (
        <p className="mt-3 text-center text-sm text-green-600">{message}</p>
      )}
    </main>
  )
}
