import Marquee from 'react-fast-marquee'
import { HiInformationCircle, HiOutlineExclamationCircle } from 'react-icons/hi'
import { Alert, Button, Drawer, Spinner, Modal } from 'flowbite-react'
import React, { useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import {
  ClientToServerEvents,
  Member,
  ResponseData,
  RoomProps,
  notifyInfo,
} from 'types/custom'
import { Socket } from 'socket.io-client'
import { useRouter } from 'next/navigation'
import { parseQueryParams } from 'lib/useRoomPageInit'

interface Props {
  notify?: string
  peopleCount?: string
  type: RoomProps['type']
  socket?: Socket<ClientToServerEvents> | null
  isLink?: boolean
  notifyInfo?: notifyInfo
  members?: Member[]
  onAllow?: (props: Member) => void
}

type handleType = 'destroy' | 'exit' | 'share'
const RoomHeader: React.FC<Props> = props => {
  const router = useRouter()
  const [openDrawer, setDrawer] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [btnsLoading, setBtnsLoading] = useState<{ [key: string]: boolean }>()
  const shareRef = useRef(false)

  const onOpenDrawer = (type: boolean) => {
    setDrawer(type)
  }

  const onOk = (type: handleType) => {
    if (type === 'destroy') {
      const queryParams = parseQueryParams(location.href)
      props.socket?.emit('destroy', {
        cuid: queryParams.cuid,
        roomName: queryParams.roomName,
      })
    } else {
      props.socket?.disconnect()
    }
  }

  const onGoHome = () => {
    router.replace('/')
  }

  // 同意用户进入房间
  const agreeJoin = (uid?: string) => {
    if (uid) {
      setBtnsLoading({ ...btnsLoading, [uid]: true })
    } else {
      return
    }
    const queryParams = parseQueryParams(location.href)
    fetch('/api/link', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid, roomName: queryParams.roomName }),
    })
      .then(data => data.json())
      .then((res: ResponseData<{ success: string }>['data']) => {
        if (res?.success) {
          props.onAllow?.({ uid: uid })
        }
      })
      .finally(() => {
        if (uid) {
          setBtnsLoading({ ...btnsLoading, [uid]: false })
        }
      })
  }

  const onClickHandle = (type?: handleType) => {
    shareRef.current = type === 'share'
    setOpenModal(true)
  }

  return (
    <>
      {!props.isLink ? (
        <div className='relative'>
          <Alert color='failure' icon={HiInformationCircle}>
            <span>断开连接</span>
          </Alert>
          <Button
            className='!absolute top-1/2 right-2 !-translate-y-1/2'
            size='sm'
            onClick={onGoHome}
          >
            返回
          </Button>
        </div>
      ) : (
        <>
          <Drawer
            title='成员'
            open={openDrawer}
            onClose={() => onOpenDrawer(false)}
            position='right'
          >
            <Drawer.Header title='成员' titleIcon={() => <></>} />
            {props.members?.map(item => (
              <div
                key={item.uid}
                className='flex flex-wrap justify-between items-center mb-6'
              >
                <span className='break-words'>
                  {decodeURIComponent(item.name || 'unknown')}
                </span>
                <Button size='sm' onClick={() => agreeJoin(item.uid)}>
                  同意
                </Button>
              </div>
            ))}
          </Drawer>
          <header className='flex items-center justify-between -mt-2 -ml-2 -mr-2 p-1 bg-neutral-200'>
            <div className='w-2/5'>
              {props.notify && (
                <Marquee gradient={false}>{props.notify}</Marquee>
              )}
            </div>
            <div className='flex justify-center'>
              <span className='flex items-center mr-4'>
                在线人数：
                {props.notifyInfo?.userCount || (
                  <Spinner color='info' aria-label='Info spinner example' />
                )}
              </span>
              {props.type === 'creator' ? (
                <>
                  <Button size='xs' onClick={() => onOpenDrawer(true)}>
                    成员
                  </Button>
                  <Button
                    className='ml-2'
                    size='xs'
                    onClick={() => onClickHandle()}
                  >
                    销毁
                  </Button>
                  <Button
                    className='ml-2'
                    size='xs'
                    onClick={() => onClickHandle('share')}
                  >
                    分享
                  </Button>
                </>
              ) : (
                <>
                  <Button size='xs' onClick={() => onClickHandle()}>
                    退出
                  </Button>
                  <Button
                    className='ml-2'
                    size='xs'
                    onClick={() => onClickHandle('share')}
                  >
                    分享
                  </Button>
                </>
              )}
            </div>
          </header>
        </>
      )}
      <Modal
        show={openModal}
        size='md'
        position='top-right'
        onClose={() => setOpenModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            {shareRef.current ? (
              <QRCodeCanvas
                value={`${location.origin}?share=${
                  parseQueryParams(location.href)?.roomName
                }`}
                className='ml-auto mr-auto'
              />
            ) : (
              <>
                <HiOutlineExclamationCircle className='mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200' />
                <h3 className='mb-5 text-lg font-normal text-gray-500 dark:text-gray-400'>
                  确认{props.type === 'creator' ? '销毁' : '退出'}
                </h3>
                <div className='flex justify-center gap-8'>
                  <Button
                    color='failure'
                    onClick={() => {
                      onOk(props.type === 'creator' ? 'destroy' : 'exit')
                      setOpenModal(false)
                    }}
                  >
                    确认
                  </Button>
                  <Button color='gray' onClick={() => setOpenModal(false)}>
                    取消
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default RoomHeader
