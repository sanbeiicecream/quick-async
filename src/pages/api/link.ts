import { NextApiRequest } from 'next'
import type { NextApiResponseServerIO } from 'types/next'
import mongodbUtils from 'lib/utils'
import { ResponseData } from 'types/custom'
import logger from 'lib/logger'
import dayjs from 'dayjs';

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  let resData: ResponseData = {
    status: 200,
    msg: '等待中',
    success: true
  }
  if (!res.socket.server.io) {
    resData = {
      status: 500,
      msg: '服务发生异常，请稍后再试',
      success: false
    }
  }
  const roomName = req.body?.roomName
  const uid = req.body?.uid
  if (!roomName || !uid) {
    resData = {
      status: 400,
      msg: '参数错误',
      success: false
    }
  }
  // 查找空间创建者socketID
  const socketIdOfRoom = await mongodbUtils.queryDataByKey(roomName, 'id');
  if (socketIdOfRoom) {
    logger.info(`空间存在-同意加入：${req.body?.roomName}`)
    // 向申请者socket发送同意信息
    const sockets = await res.socket.server.io.of('/link').in(dayjs().format('YYYY-MM-DD')).fetchSockets()
    sockets.find(item => {
      if (item.id === global.uidSocketIdMap[uid]) {
        item.emit('join', { uid, createAt: new Date().getTime() })
        return true
      }
    })
    // to(global.uidSocketIdMap[uid])?.emit('join',
    //   { uid, createAt: new Date().getTime() })
    // 删除加入时socketid与uid的map
    delete global.uidSocketIdMap[uid]
    // 生成一个新的允许加入的uid，加入时需要匹配才能加入
    if (Array.isArray(global.cuidList)) {
      global.uidList.push(uid)
    }
  } else {
    resData = {
      status: 404,
      msg: '空间不存在',
      success: false
    }
  }
  res.status(200).send({ msg: resData.msg, success: resData.success })
}