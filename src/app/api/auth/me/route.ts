import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '@/lib/auth' // your existing verifyToken

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.token
  if (!token) return res.status(401).json({ message: 'Unauthorized' })

  try {
    const user = verifyToken(token)
    return res.status(200).json(user)
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}
