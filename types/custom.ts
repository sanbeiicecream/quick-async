export type ResponseData<T = { [key: string]: any } | null> = Partial<{
  status: number,
  msg: string,
  success: boolean
  data: T
}>


export type RoomProps = {
  type: 'creator' | 'member' | 'manager'
}

export type Member = {
  uid?: string;
  ip?: string;
  name?: string;
};


type Message = {
  msg: string,
  time: string,
  username: string,
  ip?: string
}

export type Messages = Message[]


export type notifyInfo = {
  userCount?: number
  notification?: string
}


export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}


export interface NamespaceSpecificClientToServerEvents {
  msg: (arg: any) => void
  connection: (arg: any) => void
  notify: (arg: notifyInfo) => void;
  join: (arg: Member) => void;
  destroy: (arg: { roomName: string, cuid: string }) => void;
}

export interface NamespaceSpecificServerToClientEvents {
  msg: (arg: any) => void;
  notify: (arg: any) => void;
  destroy: (arg: { roomName: string, cuid: string }) => void;
}


export interface ClientToServerEvents extends NamespaceSpecificClientToServerEvents { }

export interface ServerToClientEvents extends NamespaceSpecificServerToClientEvents { }

export type NamespaceSpecificSocketData = { [key: string]: any }