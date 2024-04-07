import { NamespaceSpecificClientToServerEvents, NamespaceSpecificServerToClientEvents, NamespaceSpecificSocketData } from '../types/custom';
import { Namespace, Server } from "socket.io";
import { v4 as uuidv4 } from 'uuid';
import dayjs from "dayjs";
const mongodbUtils = require("./utils.js")

let chatSpace: Namespace<NamespaceSpecificServerToClientEvents, NamespaceSpecificClientToServerEvents, NamespaceSpecificSocketData>
let linkSpace: Namespace<NamespaceSpecificServerToClientEvents, NamespaceSpecificClientToServerEvents, NamespaceSpecificSocketData>
function chat(io: Server) {
  chatSpace = io.of("/chat");
  global.chatSpace = chatSpace
  chatSpace.adapter.on("join-room", (roomName, id) => {
    const room = chatSpace.adapter.rooms?.get?.(roomName)
    logger.info(`客户端：${id}，加入房间：${roomName}，人数：${room?.size}`);
  });
  chatSpace.adapter.on("leave-room", (roomName, id) => {
    const room = chatSpace.adapter.rooms?.get?.(roomName)
    logger.info(`客户端：${id}，离开房间：${roomName}，人数：${room?.size}`);
    if (!room?.size) {
      chatSpace.in(roomName).disconnectSockets();
    }
  });
  chatSpace.on('connection', async socket => {
    const roomName = decodeURIComponent(socket.handshake.url.match(/[?&]roomName=([^&]*)/)?.[1] || '');
    const cuid = socket.handshake.url.match(/[?&]cuid=([^&]*)/)?.[1] || '';
    const uid = socket.handshake.url.match(/[?&]uid=([^&]*)/)?.[1] || '';
    logger.info(`客户端socket请求连接，ID: ${socket.id}，CUID: ${cuid}，UID: ${uid}`)
    if (roomName) {
      if (global.cuidList?.includes?.(cuid)) {
        const ip = socket.handshake.headers.referer;
        // 创建空间
        if (await mongodbUtils.hasDocByName(roomName)) {
          logger.info(`空间已存在-${roomName}，ID: ${socket.id}`)
          socket.disconnect()
          return
        }
        await mongodbUtils.createCollection(roomName, socket.id)
        socket.join(roomName)
        // 生成一个创建者的uid
        // 空间创建后返回，后续加入需要一致才能成功
        const cuid = uuidv4()
        logger.info(`空间已创建-${roomName}，socketID: ${socket.id}, cuid: ${cuid}`)
        socket.emit('connection', { cuid })
      } else if (global.uidList?.includes?.(uid)) {
        // 加入者
        socket.join(roomName)
      } else {
        // 无权限
        socket.disconnect()
        return
      }
      chatSpace.to(roomName).emit('notify', {
        userCount: chatSpace.adapter.rooms?.get?.(roomName)?.size
      })
      socket.on('destroy', res => {
        if (res.roomName === roomName && res.cuid === cuid) {
          chatSpace.in(roomName).disconnectSockets();
        }
      })
    } else {
      logger.info(`参数不对！`)
      socket.disconnect()
    }
    // 处理uid过期问题
    // const index = global.cuidList?.findIndex(item => item === cuid)
    // if (index >= 0) {
    //   global.cuidList.splice(index, 1)
    // }
    socket.on('msg', (res) => {
      chatSpace.to(res.roomName).emit('msg', [{
        ...res
      }])
    })
    socket.on('disconnect', () => {
      logger.info(`客户端断开连接，ID: ${socket.id}`)
      chatSpace.to(roomName).emit('notify', {
        userCount: chatSpace.adapter.rooms?.get?.(roomName)?.size
      })
      if (uid) {
        const index = global.uidList?.findIndex(item => item === uid)
        if (index >= 0) {
          global.uidList.splice(index, 1)
        }
      }
    })
  });
}

function link(io: Server) {
  linkSpace = io.of("/link");
  global.linkSpace = linkSpace
  linkSpace.on('connection', async socket => {
    try {
      const roomName = decodeURIComponent(socket.handshake.url.match(/[?&]roomName=([^&]*)/)?.[1] || '');
      const joinName = socket.handshake.url.match(/[?&]joinName=([^&]*)/)?.[1] || '';
      if (!roomName) return socket.disconnect()
      const socketIdOfRoom = await mongodbUtils.queryDataByKey(roomName, 'id');
      if (!socketIdOfRoom) {
        logger.info(`数据库中未创建空间，无法加入，ID: ${socket.id}`)
        return socket.disconnect()
      }
      socket.join(dayjs().format('YYYY-MM-DD'))
      const chatRoom = chatSpace.adapter.rooms?.get?.(roomName);
      if (!chatRoom?.size) {
        logger.info(`空间创建者下线，需要密钥认证，ID: ${socket.id}`)
        return socket.disconnect()
      } else {
        const ip = socket.handshake.headers.referer;
        // 通知创建者
        // 生成一个加入者uid，绑定当前socketid
        const uid = uuidv4()
        global.uidSocketIdMap[uid] = socket.id
        chatSpace.to(roomName).to(socketIdOfRoom)?.emit?.('join', { uid, ip, name: joinName })
        logger.info(`客户端：${socket.id}，申请加入房间：${roomName}`);
      }
    } catch (e) {
      appLogger.error(e)
      return socket.disconnect()
    }

  })
}

const initIo = (io: Server) => {
  chat(io)
  link(io)
}



export default initIo