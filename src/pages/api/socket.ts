import { Server } from "socket.io";
import { NextRequest } from "next/server";
import type { NextApiResponseServerIO } from 'types/next'
import logger from "lib/logger";
import initIo from 'lib/socketNameSpace'

export default function handler(req: NextRequest, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    console.log("Server already started!");
    res.end();
    return;
  }
  const io = new Server(res.socket.server as any, { addTrailingSlash: false });
  res.socket.server.io = io;
  initIo(io)
  logger.info("Socket server started successfully!")
  res.end();
}
