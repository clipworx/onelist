'use client'
import { useEffect, useRef, useState } from 'react'
import { ShareIcon } from "@heroicons/react/24/outline";
import { io, Socket } from 'socket.io-client'
import { TrashIcon } from '@heroicons/react/24/outline'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

type Product = {
  status: 'not_started' | 'partial' | 'completed'
}
type CreatedBy = {
  nickname: string
  _id: string
}

type List = {
  _id: string
  name: string
  createdBy: CreatedBy
  createdAt: string
  products: Product[]
}

const getListStatus = (products: Product[]): 'not_started' | 'partial' | 'completed' => {
  const total = products.length
  const completedCount = products.filter((p) => p.status === 'completed').length
  
  if (completedCount === 0 && products.every((p) => p.status !== 'partial')) {
    return 'not_started'
  }
  if (completedCount === total) {
    return 'completed'
  }
  return 'partial'
}


export default function ListsPage() {
  const [lists, setLists] = useState<List[]>([])
  const [sharedLists, setSharedLists] = useState<List[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [email, setEmail] = useState("");
  const [sendEmailLoading, setSendEmailLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isSharedListsFetched, setIsSharedListsFetched] = useState(false);

  const socketRef = useRef<Socket | null>(null)
  useEffect(() => {
    // Create socket connection once
    socketRef.current = io(process.env.HOST!)
    const socket = socketRef.current

    // Listen for normal product updates
    socket.on('productUpdated', async () => {
      fetchLists()
      fetchSharedLists()
    })

    return () => {
      if (socket) {
        socket.off('productUpdated')
        socket.disconnect()
      }
    }
  }, [])



  const handleShare = (e: React.MouseEvent , id: string) => {
    e.preventDefault()
    const url = `${window.location.origin}/lists/${id}`;
    setShareUrl(url)
    setIsOpen(true);
    setSelectedListId(id);
    setStatusMessage("");
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    setIsDeleteConfirmOpen(true)
    e.preventDefault()
    setSelectedListId(id)
  }

  const onConfirmDelete = async () => {
    try { 
      const res = await fetch(`/api/lists/${selectedListId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete list')
      }

      // Remove the deleted list from the state
      setLists((prev) => prev.filter((list) => list._id !== selectedListId))
      setSharedLists((prev) => prev.filter((list) => list._id !== selectedListId))
    } catch (err: any) {
      setError(err.message || 'Failed to delete list')
    } finally {
      setIsDeleteConfirmOpen(false)
    }
  }

  const handleSendEmail = async () => {
    if (!email.trim()) {
      setStatusMessage("Please enter an email.");
      return;
    }

    setSendEmailLoading(true);
    setStatusMessage("");

    try {
      const res = await fetch("/api/send_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, link: shareUrl }),
      });

      await fetch(`/api/lists/${selectedListId}/share`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to send email");
      setStatusMessage("Email sent successfully!");
      

    } catch (err) {
      setStatusMessage("Error sending email. Please try again.");
    } finally {
      setEmail("");
      setIsOpen(false);
      setShareUrl("");
      setSendEmailLoading(false);
      setSuccessModal(true);
      setTimeout(() => {
        setSuccessModal(false);
      }, 3000); // hides after 3 seconds
    }
  };

  const handleRefresh = () => {
    setIsSharedListsFetched(true);
    fetchSharedLists();
  };
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
  const fetchSharedLists = async () => {
    try {
      const res = await fetch(`/api/lists/shared`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to load lists')

      setSharedLists(data.lists)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
      setIsSharedListsFetched(false)
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (res.ok) setUserId(data.userId)
    }

    fetchUser()
    fetchSharedLists()
    fetchLists()
  }, [])

  if (loading) return <div className="p-4 text-gray-600">Loading lists...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Lists</h1>
        <button onClick={() => window.location.href = '/lists/new'} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">
          Create a new list
        </button>
      </div>

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
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-black">{list.name}</h2>
                    <div className="flex gap-2">
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

                      <button
                        className="text-blue-500 hover:text-blue-600 p-1"
                        onClick={(e) => handleShare(e, list._id)}
                        title="Share"
                      >
                        <ShareIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-600 p-1"
                        onClick={(e) => handleDelete(e, list._id)}
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Created by: {list.createdBy.nickname || 'Unknown'}
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
      {/* Shared Lists */}
      <div className="flex items-center justify-between mb-6 mt-6">
        <h1 className="text-2xl font-bold">Shared with you</h1>
        <button
          className="text-blue-500 hover:text-blue-600 p-1 disabled:text-gray-400"
          onClick={(e) => handleRefresh()}
          title="Refresh"
          disabled={isSharedListsFetched}
        >
          <ArrowPathIcon className="w-6 h-6" />
        </button>
      </div>
      <ul className="space-y-4">
        {sharedLists.map((list) => {
          const status = getListStatus(list.products)
          return (
            <a href={`/lists/${list._id}`} className="block" key={list._id}> 
              <li key={list._id} className="border rounded-xl p-4 bg-white shadow-sm">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-black">{list.name}</h2>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      Shared
                    </span>
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
                </div>
                <p className="text-sm text-gray-500">
                  Created by: {list.createdBy.nickname || 'Unknown'}
                </p>
                <p className="text-sm text-gray-500">
                  {list.products.length} product{list.products.length !== 1 ? 's' : ''}
                </p>
              </li>
            </a>
          )
        })}
      </ul>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-2 text-black">Share List</h2>
            <p className="text-sm text-gray-600 mb-4">
              The link has been copied to your clipboard. You can also send it by email:
            </p>

            {/* Email Input */}
            <input
              type="email"
              placeholder="Enter recipient's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-3 text-black"
            />

            {/* Status Message */}
            {statusMessage && (
              <p className="text-xs mb-3 text-gray-600">{statusMessage}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleSendEmail}
                disabled={sendEmailLoading}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs disabled:opacity-50"
              >
                {sendEmailLoading ? "Sending..." : "Send Email"}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {
        successModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-lg font-semibold mb-2 text-black">Success!</h2>
              <p className="text-sm text-gray-600 mb-4">Email sent successfully!</p>
              <button
                onClick={() => setSuccessModal(false)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )
      }
      {/* Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold text-gray-800">Delete List</h2>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to delete this list? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 mt-5">
              <button
                className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => {
                  onConfirmDelete();
                  setIsDeleteConfirmOpen(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
