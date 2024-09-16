'use client'
import MessageList from "components/MessageList"
import RoomFotter from "components/RoomFotter"
import RoomHeader from "./RoomHeader";
import { Member, Messages, RoomProps, notifyInfo } from "types/custom";
import { Alert } from "antd";
import { Socket } from "socket.io-client";

interface Props {
  type: RoomProps['type']
  messages?: Messages
  isLink?: boolean
  socket?: Socket | null
  notifyInfo?: notifyInfo
  members?: Member[]
  roomName?: string
  onAllow?: (props: Member) => void
}
const Room: React.FC<Props> = props => {
  return (
    <div className="flex p-2 flex-col justify-between h-screen">
      <RoomHeader
        type={props.type}
        socket={props.socket}
        isLink={props.isLink}
        notifyInfo={props.notifyInfo}
        members={props.members}
        onAllow={props.onAllow}
      />
      <MessageList messages={props.messages} />
      {props.isLink && <RoomFotter socket={props.socket} type={props.type} />}
    </div>
  )
}

export default Room