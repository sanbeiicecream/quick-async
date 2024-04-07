import { Logger } from 'log4js';
import { MongoClient } from 'mongodb';
import { Namespace } from 'socket.io';


declare global {
  var logger: Logger
  var appLogger: Logger
  var mongoConnected: boolean
  var joinList: { [key: string]: { uid: string, createAt: string }[] }
  var uidSocketIdMap: { [key: string]: string }
  var cuidList: string[]
  var uidList: string[]
  var chatSpace: Namespace
  var linkSpace: Namespace
  var mongoClient: MongoClient
}

export { };