'use client'
import '@/style/room.css'
import Room from "components/Room"
import useRoomPageInit from 'lib/useRoomPageInit'
import { useEffect, useRef, useState } from 'react'
import { Member, ResponseData } from 'types/custom'

const Creator = () => {
  const { messages, isLink, socket, notifyInfo } = useRoomPageInit()
  const isFrist = useRef(true)
  const [members, setMembers] = useState<Member[]>([])
  const onAllow = (member: Member) => {
    setMembers(data => data?.filter(item => item.uid !== member.uid))
  }
  useEffect(() => {
    if (isFrist) {
      socket?.on('join', (res: ResponseData<Member>['data']) => {
        setMembers(data => {
          const newData = data?.concat({
            uid: res?.uid || '',
            name: res?.name || ''
          })
          return newData
        })
      });
    }
    isFrist.current = false
  }, [socket])
  return (
    <>
      {members.forEach(item => <div>{item.name}</div>)}
      <Room
        type='creator'
        messages={messages}
        isLink={isLink}
        socket={socket}
        notifyInfo={notifyInfo}
        members={members}
        onAllow={onAllow}
      />
    </>
  )
}

export default Creator