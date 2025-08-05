import { Server as IOServer } from 'socket.io'

let io: IOServer | undefined

export const setIO = (serverIO: IOServer) => {
  io = serverIO
}

export const getIO = (): IOServer => {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}
