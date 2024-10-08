'use client'

import { Button, Label, Modal, TextInput } from 'flowbite-react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import toast, { Toaster } from 'react-hot-toast'
import { ResponseData } from 'types/custom'
import { parseQueryParams } from 'lib/useRoomPageInit'

const basePath = process.env.BASE_PATH || ''
let socket: Socket

type ButtonHandleType = 'create' | 'into' | 'share'

const Main = () => {
  const [openModal, setOpenModal] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const handleType = useRef<ButtonHandleType>()
  const [waiting, setWaiting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [disableBtn, setDisableBtn] = useState(true)
  const [cnaClick, setCanClick] = useState(false)
  const router = useRouter()
  const params = useParams()
  const isCancelLink = useRef(false)
  const inputRefs = useRef({ roomName: '', username: '' })
  const joinSignal = useRef(false)

  const validateInput = () => {
    if (
      ['into', 'share'].includes(handleType.current || '') &&
      inputRefs.current.roomName.length >= 3 &&
      inputRefs.current.username.length > 0
    ) {
      setDisableBtn(false)
    } else if (
      handleType.current === 'create' &&
      inputRefs.current.roomName.length >= 3
    ) {
      setDisableBtn(false)
    } else {
      setDisableBtn(true)
    }
  }

  const showModal = useCallback((type: ButtonHandleType) => {
    handleType.current = type
    setDisableBtn(true)
    setOpenModal(true)
    if (type !== 'share') {
      initializeInput()
    }
  }, [])

  useEffect(() => {
    // 使用单独server.js启动时需要注释下面这行
    fetch(`${basePath}/api/socket`)
    const queryParams = parseQueryParams(
      typeof window !== 'undefined' ? window.location?.href : ''
    )
    if (queryParams?.share) {
      inputRefs.current.roomName = queryParams.share
      showModal('share')
    }
    return () => {
      if (socket?.connected) {
        socket.disconnect()
      }
    }
  }, [showModal])

  const onChange = (
    type: 'roomName' | 'username',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    inputRefs.current[type] = e.target.value
    validateInput()
  }

  const onAfterClose = () => {
    setCanClick(false)
    setLoading(false)
  }

  const initializeInput = () => {
    inputRefs.current.roomName = ''
    inputRefs.current.username = ''
  }

  const cancelInto = () => {
    isCancelLink.current = true
    socket.disconnect()
    toast.dismiss()
    toast.success('取消成功')
    setWaiting(false)
  }

  const into = async () => {
    let joinData: ResponseData<{ uid: string; createAt: string }>['data'] = {
      uid: '',
      createAt: '',
    }
    const roomName = inputRefs.current.roomName
    const joinName = inputRefs.current.username
    try {
      socket = io('/link', {
        path: `${basePath}/socket.io/`,
        reconnection: true,
        addTrailingSlash: false,
        reconnectionAttempts: 3,
        query: {
          roomName,
          joinName,
        },
      })
    } catch (e) {
      console.error(e)
      toast.dismiss()
      toast.error('连接失败~')
      return
    } finally {
      setLoading(false)
      validateInput()
    }
    socket.on('connect', () => {
      setOpenModal(false)
      onAfterClose()
      setWaiting(true)
      socket.on('disconnect', () => {
        if (joinSignal.current) {
          toast.dismiss()
          joinSignal.current = false
          router.replace(
            `/room/joiner?roomName=${roomName}&uid=${joinData?.uid}&createAt=${joinData?.createAt}&joinName=${joinName}`
          )
        } else if (!isCancelLink.current) {
          toast.dismiss()
          toast.error('空间不存在')
          setWaiting(false)
        } else {
          isCancelLink.current = false
        }
      })
      socket.on(
        'join',
        (res: ResponseData<{ uid: string; createAt: string }>['data']) => {
          console.log('准备跳转：断开Link')
          // 先断开这个连接后才能跳转
          joinSignal.current = true
          joinData = res
          socket.disconnect()
        }
      )
    })
  }

  const create = async () => {
    try {
      const roomName = inputRefs.current.roomName
      const data = await fetch(`${basePath}/api/create`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName }),
      })
      const res = (await data.json()) as ResponseData<{ cuid: string }>
      if (res.success) {
        toast.dismiss()
        router.replace(
          `/room/creator?roomName=${roomName}&cuid=${res?.data?.cuid}`
        )
      } else {
        toast.dismiss()
        toast.error(res.msg || '服务器崩溃了, 请刷新页面重试~')
        setLoading(false)
      }
    } catch (e) {
      toast.dismiss()
      validateInput()
    }
  }

  const confirm = async () => {
    toast.promise(
      new Promise((resolve, reject) => {
        if (handleType.current === 'create') {
          create()
        } else {
          into()
        }
      }),
      {
        loading: 'Waiting...',
        success: <b>success</b>,
        error: <b>error</b>,
      }
    )
    setDisableBtn(true)
  }

  return (
    <main className='flex justify-center justify-items-center h-5/6 select-none'>
      <div className='flex flex-col justify-center items-center w-full px-16'>
        <button
          onClick={() => showModal('create')}
          className='inline-block h-10 leading-10 mt-4 mb-4  bg-cyan-300 hover:bg-cyan-400 px-4 rounded'
        >
          创建空间
        </button>
        <button
          onClick={waiting ? cancelInto : () => showModal('into')}
          className='inline-block h-10 leading-10 mt-4 mb-4 bg-gray-300 hover:bg-gray-400 px-4 rounded'
        >
          {waiting ? '取消进入' : '进入空间'}
        </button>
      </div>
      <Modal
        show={openModal}
        size='md'
        popup
        onClose={() => setOpenModal(false)}
        initialFocus={nameInputRef}
      >
        <Modal.Header />
        <Modal.Body>
          <div className='space-y-6'>
            <h3 className='text-xl font-medium text-gray-900 dark:text-white'>
              {handleType.current === 'create' ? '创建' : '进入'}
            </h3>
            <div>
              <div className='mb-2 block'>
                <Label htmlFor='roomName' value='空间名' />
              </div>
              <TextInput
                id='roomName'
                ref={nameInputRef}
                required
                defaultValue={
                  parseQueryParams(
                    typeof window !== 'undefined' ? window.location?.href : ''
                  )?.share || ''
                }
                onChange={e => {
                  onChange.call(null, 'roomName', e)
                }}
              />
            </div>
            {['into', 'share'].includes(handleType.current || '') && (
              <div>
                <div className='mb-2 block'>
                  <Label htmlFor='username' value='昵称' />
                </div>
                <TextInput
                  id='username'
                  required
                  onChange={e => {
                    onChange.call(null, 'username', e)
                  }}
                />
              </div>
            )}
            <div>
              <Button
                size='sm'
                color='light'
                style={{ margin: '0 auto' }}
                onClick={confirm}
                disabled={disableBtn}
              >
                enter
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Toaster />
    </main>
  )
}

export default Main
