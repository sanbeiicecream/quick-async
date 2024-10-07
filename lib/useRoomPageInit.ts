'use client';

import { notifyInfo } from './../types/custom';
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, Messages } from 'types/custom';

export function parseQueryParams(url: string): Record<string, string> {
  if (!url) return {}
  const urlParams = new URLSearchParams(new URL(url).search);
  const queryParams: Record<string, string> = {};
  for (const [key, value] of urlParams.entries()) {
    queryParams[key] = value;
  }

  return queryParams;
}

// 聊天页面socketio初始化
const useRoomPageInit = () => {
  let queryParams = useRef({ roomName: '', cuid: '', uid: '' })
  const socket = useRef<Socket<ClientToServerEvents> | null>();
  const [messages, setMessages] = useState<Messages>([]);
  const [notifyInfo, setNotifyInfo] = useState<notifyInfo>();
  const [isLink, setIsLink] = useState(false)
  const isFirst = useRef(true)
  const socketInitializer = useCallback(() => {
    const query = {
      roomName: queryParams.current.roomName,
      cuid: queryParams.current.cuid,
      uid: queryParams.current.uid
    };
    socket.current = io('/chat', {
      reconnection: true,
      addTrailingSlash: false,
      reconnectionAttempts: 3,
      forceNew: true,
      query,
    })
    socket.current.on('disconnect', () => {
      // 断开连接
      console.log('断开连接')
      setIsLink(false)
    });
    socket.current.on('connect', () => {
      // 连接成功
      console.log('连接成功')
      setIsLink(true)
    });
    socket.current.on('msg', data => {
      // 发送消息
      setMessages(messages => [...messages, ...data]);
    });
    socket.current.on('notify', data => {
      setNotifyInfo(data)
    });
  }, []);

  useEffect(() => {
    if (!isFirst.current) {
      return
    }
    queryParams.current = parseQueryParams(location.href) as any
    socketInitializer()
    isFirst.current = false
  }, [socketInitializer])


  return { socket: socket.current, messages, isLink, notifyInfo }
}

export default useRoomPageInit