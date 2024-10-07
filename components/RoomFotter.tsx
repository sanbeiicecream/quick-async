'use client'
import { Button, TextInput } from 'flowbite-react'
import { useState } from 'react'
import { Socket } from 'socket.io-client'
import { ClientToServerEvents, RoomProps } from 'types/custom'
import { parseQueryParams } from 'lib/useRoomPageInit'

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
      username: props.type !== 'member' ? 'creator' : queryParams.joinName,
    })
  }
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value)
  }
  return (
    <footer className='flex gap-2'>
      <TextInput
        id='base'
        type='text'
        sizing='md'
        className='w-full'
        value={inputVal}
        onChange={onChange}
      />
      <Button className='ml-2' onClick={onSend}>
        send
      </Button>
    </footer>
  )
}

export default RoomFotter
