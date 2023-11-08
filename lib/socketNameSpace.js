const dayjs = require("dayjs");
const mongodbUtils = require("./utils.js")
const { v4: uuidv4 } = require('uuid');
let chatSpace
let linkSpace
function chat(io) {
  chatSpace = io.of("/chat");
  global.chatSpace = chatSpace
  chatSpace.adapter.on("join-room", (room, id) => {
    logger.info(`客户端：${id}，加入房间：${room}`);
  });
  chatSpace.adapter.on("leave-room", (room, id) => {
    logger.info(`客户端：${id}，离开房间：${room}`);
  });
  chatSpace.on('connection', async socket => {
    logger.info(`客户端socket连接，ID: ${socket.id}`)
    const roomName = decodeURIComponent(socket.handshake.url.match(/[?&]roomName=([^&]*)/)?.[1] || '');
    const cuid = socket.handshake.url.match(/[?&]cuid=([^&]*)/)?.[1] || '';
    const uid = socket.handshake.url.match(/[?&]uid=([^&]*)/)?.[1] || '';
    if (roomName) {
      if (global.cuidList?.includes?.(cuid)) {
        // 创建者
        if (socket.handshake.headers['x-forwarded-for'] != null) {
          ip = socket.handshake.headers['x-forwarded-for'] + '';
        } else {
          ip = socket.handshake.address;
        }
        // 创建空间
        if (await mongodbUtils.hasDocByName(roomName)) {
          socket.disconnect()
          logger.info(`空间已存在-${roomName}，ID: ${socket.id}`)
          return
        }
        await mongodbUtils.createCollection(roomName, socket.id)
        logger.info(`空间已创建-${roomName}，socketID: ${socket.id}, cuid: ${cuid}`)
        socket.join(roomName)
        // 生成一个创建者的uid
        // 空间创建后返回，后续加入需要一致才能成功
        // const validateUid = uuidv4()
        // socket.emit('connection', { validateUid })
      } else if (global.uidList?.includes?.(uid)) {
        // 加入者
        socket.join(roomName)
      } else {
        // 无权限
        socket.disconnect()
        return
      }
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
      if (uid) {
        const index = global.uidList?.findIndex(item => item === uid)
        if (index >= 0) {
          global.uidList.splice(index, 1)
        }
      }
    })
  });
}

function link(io) {
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
        chatSpace.to(roomName).to(socketIdOfRoom)?.emit?.('join', { uid, ip, joinName })
        logger.info(`客户端：${socket.id}，申请加入房间：${roomName}`);
      }
    } catch (e) {
      logger.error(e)
      return socket.disconnect()
    }

  })
}

exports.initIo = (io) => {
  chat(io)
  link(io)
}
