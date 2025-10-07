import dotenv from 'dotenv'
dotenv.config()

import { createServer } from 'http'
import next from 'next'
import { parse } from 'url'
import { Server as IOServer } from 'socket.io'
import type { IncomingMessage, ServerResponse } from 'http'
import { setIO } from './lib/socket'
import { watchListChanges } from './lib/change-stream'

const dev = process.env.NODE_ENV !== 'production'
const appdev = next({ dev })
const handle = appdev.getRequestHandler()

appdev.prepare().then(async () => {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const parsedUrl = parse(req.url || '', true)
    handle(req, res, parsedUrl)
  })

  const io = new IOServer(server, {
    cors: { origin: ['http://192.168.1.6:3000/', 'http://localhost:3000/', 'http://192.168.1.6:3000', 'http://localhost:3000', 'https://onelist.vercel.app/', 'https://onelist.vercel.app'] },
  })
  setIO(io)

  const PORT = parseInt(process.env.PORT || '3000', 10)
  server.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`)
  })
  await watchListChanges(io)
}).catch((err) => {
  console.error('❌ Error starting server:', err)
  process.exit(1)
})

