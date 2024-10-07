import { NextApiRequest } from 'next'
import type { NextApiResponseServerIO } from 'types/next'
import mongodbUtils from 'lib/utils'
import { ResponseData } from 'types/custom'
import { v4 as uuidv4 } from 'uuid';
import logger from 'lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  let resData: ResponseData = {
    status: 200,
    msg: '创建成功',
    success: true
  }
  if (!res.socket.server.io) {
    logger.error('使用额外的server.js启动，第一次请求需要挂载socket.io对象')
    resData = {
      status: 500,
      msg: '服务发生异常，请稍后再试',
      success: false
    }
    return res.status(resData.status || 500).json({ msg: resData.msg, success: resData.success })
  }
  const roomName = req.body?.roomName
  if (!roomName) {
    resData = {
      status: 400,
      msg: '参数错误',
      success: false
    }
    return res.status(resData.status || 500).json({ msg: resData.msg, success: resData.success })
  }
  const hasDoc = await mongodbUtils.hasDocByName(req.body?.roomName)
  if (!global.mongoConnected) {
    resData = {
      status: 500,
      msg: '数据库服务未能连接',
      success: false,
      data: null
    }
    return res.status(resData.status || 500).json({ msg: resData.msg, success: resData.success, data: resData.data })
  }
  if (hasDoc) {
    logger.info(`空间已存在：${req.body?.roomName}`)
    resData = {
      status: 200,
      msg: '空间已存在',
      success: false
    }
    return res.status(resData.status || 500).json({ msg: resData.msg, success: resData.success })
  } else {
    const cuid = uuidv4()
    resData = {
      status: 200,
      msg: '空间可以创建',
      success: true,
      data: {
        cuid
      }
    }
    global.cuidList?.push(cuid)
    return res.status(resData.status || 500).json({ msg: resData.msg, success: resData.success, data: resData.data })
  }
}