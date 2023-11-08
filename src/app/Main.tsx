'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ResponseData } from 'types/custom';
import { io, Socket } from 'socket.io-client';

let socket: Socket;
const Main = () => {
  const [waiting, setWaiting] = useState(false);
  const joinSignal = useRef(false);
  const router = useRouter();
  const create = async () => {
    const roomName = window.prompt('空间名称');
    if (!roomName) return;
    fetch('/api/create', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomName }),
    })
      .then(data => data.json())
      .then((res: ResponseData<{ cuid: string }>) => {
        if (res.success) {
          router.push(`/room?roomName=${roomName}&cuid=${res?.data?.cuid}`);
        } else {
          alert(res.msg || '服务器崩溃了, 请刷新页面重试~');
        }
      });
  };
  const into = () => {
    if (waiting) {
      socket.disconnect();
      return;
    }
    let joinData: ResponseData<{ uid: string; createAt: string }>['data'] = {
      uid: '',
      createAt: '',
    };
    const roomName = window.prompt('空间名');
    if (!roomName) return;
    const joinName = window.prompt('昵称');
    if (!joinName) return;
    if (!roomName) return;
    socket = io('/link', {
      reconnection: true,
      addTrailingSlash: false,
      reconnectionAttempts: 3,
      query: {
        roomName,
        joinName,
      },
    });
    socket.on('connect', () => {
      console.log('连接成功');
      socket.on('disconnect', () => {
        setWaiting(false);
        if (joinSignal.current) {
          joinSignal.current = false;
          router.push(
            `/room/into?roomName=${roomName}&uid=${joinData?.uid}&createAt=${joinData?.createAt}&joinName=${joinName}`
          );
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
      setWaiting(true);
    });
  };
  useEffect(() => {
    // 使用单独server.js启动时需要注释下面这行
    fetch('/api/socket');
    return () => {
      if (socket?.connected) {
        socket.disconnect();
      }
    };
  }, []);
  return (
    <>
      <div className='flex flex-col justify-center items-center w-full px-16'>
        <button
          className='inline-block h-10 leading-10 mt-4 mb-4  bg-cyan-300 hover:bg-cyan-400 px-4 rounded'
          onClick={create}
        >
          创建空间
        </button>
        <button
          className='inline-block h-10 leading-10 mt-4 mb-4 bg-gray-300 hover:bg-gray-400 px-4 rounded'
          onClick={into}
        >
          {waiting ? '取消进入' : '进入空间'}
        </button>
        {/* <Link href='/say' as='/say'>
          Go to About Page
        </Link> */}
      </div>
    </>
  );
};

export default Main;
