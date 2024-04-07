export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const log4js = require("log4js");
    const { initMongoDB, getDBAndConnection } = require("lib/mongodb");
    log4js.configure({
      appenders: {
        out: { type: "stdout" },
        app: { type: "file", filename: "logs/app.log", maxLogSize: '3M' },
      },
      categories: {
        app: { appenders: ["app", 'out'], level: 'error', pm2: true },
        default: { appenders: ["out"], level: "info", pm2: true },
      },
    })
    const logger = log4js.getLogger()
    global.appLogger = logger
    if (process.env.LOGGER === '1') {
      const appLogger = log4js.getLogger('app')
      global.appLogger = appLogger
    }
    global.logger = logger
    global.uidSocketIdMap = {}
    global.cuidList = []
    global.uidList = []
    initMongoDB()
    const { db } = await getDBAndConnection()
    if (!db) {
      logger.info('Mongodb连接失败')
      if (process.env.LOCAL_STORE === '0') {
        throw Error('Mongodb连接失败，请检查链接是否正确')
      }
    }
  }
}