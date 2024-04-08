import Marquee from 'react-fast-marquee';
import { Alert, Button, Drawer, Modal, Spin, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { ClientToServerEvents, Member, ResponseData, RoomProps, ServerToClientEvents, notifyInfo } from 'types/custom';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { parseQueryParams } from 'lib/useRoomPageInit';
const { confirm } = Modal;


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
const RoomHeader: React.FC<Props> = props => {
  const router = useRouter()
  const [open, setOpen] = useState(false);
  const [btnsLoading, setBtnsLoading] = useState<{ [key: string]: boolean }>()
  const showModal = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const showConfirm = () => {
    confirm({
      icon: <ExclamationCircleFilled />,
      content: '确定销毁吗？',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        const queryParams = parseQueryParams(location.href)
        props.socket?.emit('destroy', { cuid: queryParams.cuid, roomName: queryParams.roomName })
      },
    });
  };

  const onExit = () => {
    confirm({
      icon: <ExclamationCircleFilled />,
      content: '确定退出吗？',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        props.socket?.disconnect()
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const onGoHome = () => {
    router.replace('/')
  }

  const agreeJoin = (uid?: string) => {
    if (uid) {
      setBtnsLoading({ ...btnsLoading, [uid]: true })
    }
    const queryParams = parseQueryParams(location.href)
    if (!uid) return;
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
      }).finally(() => {
        if (uid) {
          setBtnsLoading({ ...btnsLoading, [uid]: false })
        }
      });
  };

  return (
    <>
      {!props.isLink ?
        <div className='relative'>
          <Alert message="断开连接" type="error" showIcon />
          <Button className='!absolute top-1/2 right-2 !-translate-y-1/2' size='small' onClick={onGoHome}>返回</Button>
        </div> :
        <>
          <Drawer title='成员' open={open} onClose={onClose} mask={false} width='260px' classNames={{ header: 'drawer-header' }}>
            {props.members?.map(item =>
              <div key={item.uid} className='flex flex-wrap justify-between mb-6'>
                <span className='break-words'>{decodeURIComponent(item.name || 'unknown')}</span>
                <Button size='small' onClick={() => agreeJoin(item.uid)} loading={btnsLoading?.[item.uid || '']}>连接</Button>
              </div>)}
          </Drawer>
          <header className='flex items-center justify-between -mt-2 -ml-2 -mr-2 h-8 bg-neutral-200'>
            <div className='w-2/5'>
              {
                props.notify && <Marquee gradient={false}>
                  {props.notify}
                </Marquee>
              }
            </div>
            <div>
              <span className='mr-4'>在线人数：{props.notifyInfo?.userCount || <Spin size="small" />}</span>
              {
                props.type === 'creator' ?
                  <>
                    <Button size='small' onClick={showModal}>成员</Button>
                    <Button type="primary" danger className='ml-2' size='small' onClick={showConfirm}>销毁</Button>
                  </>
                  : <Button size='small' onClick={onExit}>退出</Button>
              }
            </div>
          </header >
        </>
      }
    </>
  )
}

export default RoomHeader