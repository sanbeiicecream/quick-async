'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ResponseData } from 'types/custom';
import { io, Socket } from 'socket.io-client';

let socket: Socket;
const Main = () => {
  const [waiting, setWaiting] = useState(false);
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
    const roomName = window.prompt('空间名');
    if (!roomName) return;
    const joinName = window.prompt('昵称');
    if (!joinName) return;
    if (!roomName) return;
    socket = io(`/link?roomName=${roomName}&joinName=${joinName}`, {
      reconnection: true,
      addTrailingSlash: false,
      reconnectionAttempts: 3,
    });
    socket.on('connect', () => {
      console.log('连接成功');
      socket.on('disconnect', () => {
        console.log('断开连接');
        setWaiting(false);
      });
      socket.on(
        'join',
        (res: ResponseData<{ uid: string; createAt: string }>['data']) => {
          socket.disconnect();
          router.push(
            `/room/into?roomName=${roomName}&uid=${res?.uid}&createAt=${res?.createAt}&joinName=${joinName}`
          );
        }
      );
      setWaiting(true);
    });
  };
  useEffect(() => {
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
