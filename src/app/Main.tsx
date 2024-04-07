'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ResponseData } from 'types/custom';
import { io, Socket } from 'socket.io-client';
import { Modal, Form, Input, message } from 'antd';

type FieldType = {
  roomName?: string
  username?: string
};
let socket: Socket;
const Main = () => {
  const [waiting, setWaiting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [handleType, setHandleType] = useState<'create' | 'into'>()
  const [form] = Form.useForm();
  const [canHandle, setCanHandle] = useState(false)
  const [loading, setLoading] = useState(false);
  const joinSignal = useRef(false);
  const isCancelLink = useRef(false)
  const router = useRouter();
  const onAfterClose = () => {
    form.resetFields()
    setCanHandle(false)
    setLoading(false)
  }
  const create = async () => {
    const roomName = form.getFieldValue('roomName')
    const data = await fetch('/api/create', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomName }),
    })
    const res = await data.json() as ResponseData<{ cuid: string }>
    if (res.success) {
      router.replace(`/room/creator?roomName=${roomName}&cuid=${res?.data?.cuid}`);
    } else {
      message.info(res.msg || '服务器崩溃了, 请刷新页面重试~');
      setLoading(false)
    }
  };
  const cancelInto = () => {
    isCancelLink.current = true
    socket.disconnect();
    message.success('取消成功')
    setWaiting(false)
  }
  const into = async () => {
    let joinData: ResponseData<{ uid: string; createAt: string }>['data'] = {
      uid: '',
      createAt: '',
    };
    const roomName = form.getFieldValue('roomName')
    const joinName = form.getFieldValue('username')
    try {
      socket = io('/link', {
        reconnection: true,
        addTrailingSlash: false,
        reconnectionAttempts: 3,
        query: {
          roomName,
          joinName,
        },
      });
    } catch (e) {
      console.error(e)
      message.error('连接失败~')
      return
    } finally {
      setLoading(false)
    }
    socket.on('connect', () => {
      setIsModalOpen(false)
      onAfterClose()
      setWaiting(true);
      socket.on('disconnect', () => {
        if (joinSignal.current) {
          joinSignal.current = false;
          router.replace(
            `/room/joiner?roomName=${roomName}&uid=${joinData?.uid}&createAt=${joinData?.createAt}&joinName=${joinName}`
          );
        } else if (!isCancelLink.current) {
          message.warning('空间不存在')
          setWaiting(false);
        } else {
          isCancelLink.current = false
        }
      });
      socket.on(
        'join',
        (res: ResponseData<{ uid: string; createAt: string }>['data']) => {
          console.log('准备跳转：断开Link');
          // 先断开这个连接后才能跳转
          joinSignal.current = true;
          joinData = res;
          socket.disconnect();
        }
      );
    });
  }

  useEffect(() => {
    // 使用单独server.js启动时需要注释下面这行
    fetch('/api/socket');
    return () => {
      if (socket?.connected) {
        socket.disconnect();
      }
    };
  }, []);

  const showModal = (type: 'create' | 'into') => {
    setHandleType(type)
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onChange = () => {
    if (handleType === 'create') {
      setCanHandle(!!form.getFieldValue('roomName'))
    } else {
      setCanHandle(!!form.getFieldValue('roomName') && !!form.getFieldValue('username'))
    }
  }

  const onOk = async () => {
    form.validateFields().then(async () => {
      setLoading(true)
      if (handleType === 'create') {
        await create()
      } else {
        await into()
      }
    }).catch(e => {
      console.log(e)
    })
  }

  return (
    <>
      <Modal
        centered
        maskClosable={false}
        open={isModalOpen}
        onOk={onOk}
        onCancel={handleCancel}
        okText={handleType === 'create' ? '创建' : '进入'}
        cancelText="关闭"
        okButtonProps={{ disabled: !canHandle }}
        afterClose={onAfterClose}
        confirmLoading={loading}
      >
        <Form
          name="basic"
          form={form}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          style={{ maxWidth: 600, paddingTop: '2rem' }}
          initialValues={{ remember: true }}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="空间名"
            name="roomName"
          >
            <Input onChange={onChange} maxLength={18} />
          </Form.Item>

          {handleType === 'into' &&
            <Form.Item<FieldType>
              label="昵称"
              name="username"
            >
              <Input onChange={onChange} maxLength={18} />
            </Form.Item>
          }
        </Form>
      </Modal >
      <div className='flex flex-col justify-center items-center w-full px-16'>
        <button
          className='inline-block h-10 leading-10 mt-4 mb-4  bg-cyan-300 hover:bg-cyan-400 px-4 rounded'
          onClick={() => showModal('create')}
        >
          创建空间
        </button>
        <button
          className='inline-block h-10 leading-10 mt-4 mb-4 bg-gray-300 hover:bg-gray-400 px-4 rounded'
          onClick={waiting ? cancelInto : () => showModal('into')}
        >
          {waiting ? '取消进入' : '进入空间'}
        </button>
      </div>
    </>
  );
};

export default Main;
