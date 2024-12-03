'use client'
import Room from 'components/Room'
import useRoomPageInit from 'lib/useRoomPageInit'

const Joniner = () => {
  const { messages, isLink, socket, notifyInfo } = useRoomPageInit()
  return (
    <Room
      type='member'
      messages={messages}
      isLink={isLink}
      socket={socket}
      notifyInfo={notifyInfo}
    />
  )
}

export default Joniner
