export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initMongoDB, getDBAndConnection } = require("lib/mongodb");
    const logger = require('lib/logger')
    global.uidSocketIdMap = {}
    global.cuidList = []
    global.uidList = []
    initMongoDB()
    const { db } = await getDBAndConnection()
    logger.default.info(`Mongodb连接${db ? '成功' : '失败'}`)
    if (!db) {
      if (process.env.LOCAL_STORE === '0') {
        throw Error('Mongodb连接失败，请检查链接是否正确')
      }
    }
  }
}