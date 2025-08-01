'use client'
import { useEffect, useState } from 'react'

type Product = {
  status: 'not_started' | 'partial' | 'completed'
}

type List = {
  _id: string
  name: string
  createdBy: {
    _id: string
    name?: string
    email?: string
  }
  createdAt: string
  products: Product[]
}

const getListStatus = (products: Product[]): 'not_started' | 'partial' | 'completed' => {
  const total = products.length
  const completed = products.filter((p) => p.status === 'completed').length

  if (completed === 0) return 'not_started'
  if (completed === total) return 'completed'
  return 'partial'
}

export default function ListsPage() {
  const [lists, setLists] = useState<List[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const res = await fetch('/api/lists')
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Failed to load lists')

        setLists(data.lists)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLists()
  }, [])

  if (loading) return <div className="p-4 text-gray-600">Loading lists...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Lists</h1>

      {lists.length === 0 ? (
        <p className="text-gray-500">No lists found.</p>
      ) : (
        <ul className="space-y-4">
          {lists.map((list) => {
            const status = getListStatus(list.products)
            return (
              <a href={`/lists/${list._id}`} className="block" key={list._id}>
                <li
                  key={list._id}
                  className="border rounded-xl p-4 bg-white shadow-sm"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h2 className="text-lg font-bold text-black ">{list.name}</h2>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : status === 'partial'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Created by: {list.createdBy?.name || list.createdBy?._id}
                  </p>
                  <p className="text-sm text-gray-500">
                    {list.products.length} product{list.products.length !== 1 ? 's' : ''}
                  </p>
                </li>
              </a>
            )
          })}
        </ul>
      )}
    </div>
  )
}
