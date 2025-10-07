'use client'

import { useEffect, useRef, useState } from 'react'
import ProductItem from '@/components/Product/Item'
import { io, Socket } from 'socket.io-client'
import { useParams } from 'next/navigation'

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

type List = {
  _id: string
  name: string
  products: Product[]
  createdBy: {
    _id: string
    email: string
  }
}

export default function ListDetails() {
  const params = useParams()
  const [list, setList] = useState<List | null>(null)
  const [loading, setLoading] = useState(true)
  
  const socketRef = useRef<Socket | null>(null)
  useEffect(() => {
    // Create socket connection once
    socketRef.current = io(process.env.HOST!)
    const socket = socketRef.current

    async function fetchList() {
      try {
        const res = await fetch(`/api/lists/${params.id}`)
        const data = await res.json()
        setList(data)
      } catch (err) {
        console.error('Failed to fetch list:', err)
      } finally {
        setLoading(false)
      }
    }

    // Listen for normal product updates
    socket.on('productUpdated', async () => {
      const updatedRes = await fetch(`/api/lists/${params.id}`)
      const updatedList = await updatedRes.json()
      setList(updatedList)
    })

    // Listen for quantityLacking changes
    socket.on('productQuantityLackingUpdated', (data) => {
      console.log('📦 Quantity lacking updated:', data)

      // Update state without refetching the whole list
      setList((prevList) => {
        if (!prevList) return prevList
        return {
          ...prevList,
          products: prevList.products.map((p) =>
            p._id === data.productId
              ? { ...p, quantityLacking: data.quantityLacking }
              : p
          ),
        }
      })
      console.log(
        `Product ${data.productId} quantityLacking updated to ${data.quantityLacking}`
      )
    })

    fetchList()

    return () => {
      if (socket) {
        socket.off('productUpdated')
        socket.off('productQuantityLackingUpdated')
        socket.disconnect()
      }
    }
  }, [params.id])

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
              const updatedRes = await fetch(`/api/lists/${params.id}`)
              const updatedList = await updatedRes.json()
              setList(updatedList)
            }}
          />
        ))}

      </ul>
    </div>
  )
}
