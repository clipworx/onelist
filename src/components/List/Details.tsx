'use client'

import { useEffect, useState } from 'react'
import ProductItem from '@/components/Product/Item'

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

type List = {
  _id: string
  name: string
  products: Product[]
  createdBy: {
    _id: string
    email: string
  }
}

export default function ListDetails({ listId }: { listId: string }) {
  const [list, setList] = useState<List | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchList() {
      try {
        const res = await fetch(`/api/lists/${listId}`)
        const data = await res.json()
        setList(data)
      } catch (err) {
        console.error('Failed to fetch list:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchList()
  }, [listId])

  if (loading) return <p>Loading...</p>
  if (!list) return <p>List not found.</p>

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">{list.name}</h2>
      <ul className="space-y-2">
        {list.products.map((product) => (
          <ProductItem
            key={product._id}
            listId={list._id}
            product={product}
            userId={list.createdBy._id} 
            onUpdated={async () => {
              const updatedRes = await fetch(`/api/lists/${listId}`)
              const updatedList = await updatedRes.json()
              setList(updatedList)
            }}
          />
        ))}

      </ul>
    </div>
  )
}
