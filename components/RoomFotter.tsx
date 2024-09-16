'use client'
import { Input, Button } from "antd";
import { useState } from "react";
import { Socket } from "socket.io-client";
import { ClientToServerEvents, RoomProps } from "types/custom";
import { parseQueryParams } from 'lib/useRoomPageInit';

interface Props {
  socket?: Socket<ClientToServerEvents> | null
  type: RoomProps['type']
}

const RoomFotter = (props: Props) => {
  const [inputVal, setInputVal] = useState<string>()
  const onSend = () => {
    setInputVal('')
    const queryParams = parseQueryParams(location.href)
    props.socket?.emit('msg', {
      msg: inputVal,
      time: new Date().toISOString(),
      roomName: queryParams.roomName,
      username: props.type !== 'member' ? 'creator' : queryParams.joinName
    })
  }
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value)
  }
  return (
    <footer className="flex">
      <Input value={inputVal} onPressEnter={onSend} onChange={onChange} />
      <Button className="ml-2" onClick={onSend} >send</Button>
    </footer>
  )
}

export default RoomFotter