import { Server } from 'socket.io'
import { NextRequest } from 'next/server'
import type { NextApiResponseServerIO } from 'types/next'
import logger from 'lib/logger'
import initIo from 'lib/socketNameSpace'
const basePath = process.env.BASE_PATH || ''

export default function handler(
  req: NextRequest,
  res: NextApiResponseServerIO
) {
  logger.info(basePath)
  if (res.socket.server.io) {
    logger.info('Server already started!')
    res.end()
    return
  }
  const io = new Server(res.socket.server as any, {
    addTrailingSlash: false,
    path: `${basePath}/socket.io/`,
  })
  res.socket.server.io = io
  initIo(io)
  logger.info('Socket server started successfully!')
  res.end()
}
