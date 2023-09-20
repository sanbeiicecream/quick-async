const { MongoClient } = require("mongodb")

// 配置log4js，输出到控制台

// let cachedClient: MongoClient;
// let cachedDb: Db;
// let mongoClient

function initMongoDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (MONGODB_URI) {
    try {
      global.mongoClient = new MongoClient(MONGODB_URI, { minPoolSize: 10, maxPoolSize: 50 });
    } catch {
      logger.warn('数据库连接失败')
    }
  } else {
    logger.warn('数据库连接失败')
  }
}

async function performDatabaseOperations(cb) {
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB = process.env.MONGODB_DB || 'chat';
  let connection;
  try {
    if (!MONGODB_URI) {
      throw new Error("Define the MONGODB_URI environmental variable");
    }
    // check the MongoDB DB
    if (!MONGODB_DB) {
      throw new Error("Define the MONGODB_DB environmental variable");
    }
    connection = await mongoClient?.connect?.();
    const db = connection.db(MONGODB_DB);
    // 执行数据库操作
    await cb?.(db)
  } finally {
    if (connection) {
      connection.close(); // 关闭连接并返回到连接池
    }
  }
}

async function getDBAndConnection() {
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB = process.env.MONGODB_DB || 'chat';
  if (!MONGODB_URI) {
    throw new Error("Define the MONGODB_URI environmental variable");
  }
  // check the MongoDB DB
  if (!MONGODB_DB) {
    throw new Error("Define the MONGODB_DB environmental variable");
  }
  let connection = null
  let db = null
  try {
    connection = await global.mongoClient?.connect?.();
    db = global.mongoClient.db(MONGODB_DB);
    return { connection, db }
  } catch (e) {
    console.log(`Error worth logging: ${e}`);
    logger.error(e)
  }
  return { connection: null, db: null }
}

module.exports = { getDBAndConnection, performDatabaseOperations, initMongoDB }