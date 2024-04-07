const { MongoServerError } = require('mongodb')
const { getDBAndConnection } = require('./mongodb.js')

async function hasDocByName(name) {
  const allCollections = await getAllCollectionFromDb()
  return allCollections?.some?.(item => item.name === name)
}

async function getAllCollectionFromDb() {
  const { db, connection } = await getDBAndConnection()
  if (!db || !connection) {
    return
  }
  let collections = []
  try {
    collections = await db.listCollections().toArray()
  } catch (e) {
    if (e instanceof MongoServerError) {
      logger.error(e)
    }
  } finally {
    await connection?.close()
  }
  return collections;
}

async function createCollection(collectionName, id) {
  const { db, connection } = await getDBAndConnection()
  if (!db || !connection) {
    return
  }
  try {
    await db.createCollection(collectionName);
    await addData(collectionName, { name: collectionName, data: [], delete: 0, id })
  } finally {
    await connection?.close()
  }
}

async function addData(collectionName, data) {
  const { db, connection } = await getDBAndConnection()
  if (!db || !connection) {
    return
  }
  try {
    if (Array.isArray(data)) {
      await db.collection(collectionName).updateOne(
        { name: collectionName }, // 使用字段名称和字段值来定位文档
        { $push: { data: data[0] } }
      )
    } else {
      await db.collection(collectionName).insertOne(data);
    }
  } catch (e) {
    logger.error(e)
  } finally {
    await connection?.close()
  }
}

async function queryDataByKey(collectionName, key) {
  const { db, connection } = await getDBAndConnection()
  if (!db || !connection) {
    return
  }
  try {
    const res = await db.collection(collectionName).findOne({ name: collectionName }, { projection: { _id: 0 } })
    return res?.[key];
  } finally {
    await connection?.close()
  }
}


module.exports = { hasDocByName, createCollection, addData, queryDataByKey, getAllCollectionFromDb }