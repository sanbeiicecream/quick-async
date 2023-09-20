import { initMongoDB } from "lib/mongodb";
import log4js from "log4js";


const bootHandler = async () => {
  log4js.configure({
    appenders: { console: { type: 'console' } },
    categories: { default: { appenders: ['console'], level: 'info' } },
  });
  global.logger = log4js.getLogger()
  global.uidSocketIdMap = {}
  global.cuidList = []
  global.uidList = []
  initMongoDB()
  return { info: '初始化完成' }
};

export default bootHandler;