'use client';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import 'public/style/page.css';
import { io, Socket } from 'socket.io-client';
import { useParams, useSearchParams } from 'next/navigation';
import { ResponseData } from 'types/custom';

let socket: Socket;
type JoinList = {
  uid?: string;
  ip?: string;
  joinName?: string;
  sid?: string;
  joined?: boolean;
};

const ChatPage = () => {
  const search = useSearchParams();
  const params = useParams();
  const sendMsg = useRef('');
  const [content, setContent] = useState<{ msg: string; ip: string }[]>([]);
  const [inputVal, setInputVal] = useState('');
  const joinListRef = useRef<JoinList[]>([]);
  const [connectionStatus, setConnectionStatus] = useState(true);
  const [footerVisible, setFootVisible] = useState(false);
  const [joinList, setJoinList] = useState<JoinList[]>([]);
  const [joinListVisible, setJoinListVisible] = useState(false);
  const isFrist = useRef(true);
  const change = (e: ChangeEvent) => {
    setInputVal((e.target as HTMLInputElement).value);
    sendMsg.current = (e.target as HTMLInputElement).value;
  };

  const send = useCallback(() => {
    if (!sendMsg.current) return;
    socket.emit('msg', {
      msg: sendMsg.current,
      time: new Date().toISOString(),
      roomName: search?.get('roomName'),
      user: search?.get('joinName'),
    });
    setInputVal('');
    sendMsg.current = '';
  }, [search]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Enter') {
        e.preventDefault();
        send();
      }
    },
    [send]
  );

  useEffect(() => {
    window.document.addEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  const socketInitializer = async () => {
    if (params?.slug === 'into') {
      socket = io(
        `/chat?roomName=${search?.get('roomName') || ''}&uid=${
          search?.get('uid') || ''
        }`,
        {
          reconnection: true,
          addTrailingSlash: false,
          reconnectionAttempts: 3,
        }
      );
    } else {
      socket = io(
        `/chat?roomName=${search?.get('roomName') || ''}&cuid=${
          search?.get('cuid') || ''
        }`,
        {
          reconnection: true,
          addTrailingSlash: false,
          reconnectionAttempts: 3,
        }
      );
      socket.on('join', (res: ResponseData<JoinList>['data']) => {
        console.log(res);
        joinListRef.current.push({
          uid: res?.uid || '',
          joinName: res?.joinName || '',
        });
        setJoinList([...joinListRef.current]);
      });
    }
    socket.on('disconnect', () => {
      setConnectionStatus(false);
      setFootVisible(false);
    });
    socket.on('connect', () => {
      setConnectionStatus(true);
      setFootVisible(true);
    });
    socket.on('msg', data => {
      console.log(data);
      setContent(content => [...content, ...data]);
      window.scrollTo(0, document.body.scrollHeight);
    });
  };

  useEffect(() => {
    if (isFrist.current) {
      socketInitializer();
      isFrist.current = false;
    }
    return () => {
      if (socket?.connected) {
        socket.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showJoinList = (e: React.MouseEvent) => {
    setJoinListVisible(!joinListVisible);
  };

  const agreeJoin = (index: number, uid?: string) => {
    if (!uid) return;
    fetch('/api/link', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid, roomName: search?.get('roomName') }),
    })
      .then(data => data.json())
      .then((res: ResponseData<{ success: string }>['data']) => {
        if (res?.success && index >= 0) {
          joinListRef.current.splice(index, 1);
          setJoinList([...joinListRef.current]);
        }
      });
  };

  return (
    <>
      {!connectionStatus && (
        <div className='bg-red-500 text-zinc-50 text-center'>断开连接</div>
      )}
      <ul className='messages'>
        {content.map(item => {
          return (
            <li key={item.msg + Math.random()}>
              <div className='msg-addres'>
                <span>{item.ip}</span>
              </div>
              <div className='msg-content'>
                <span>{item.msg}</span>
              </div>
            </li>
          );
        })}
      </ul>
      {footerVisible && (
        <form className='message-form'>
          <input
            className='message-input'
            autoComplete='off'
            value={inputVal}
            onChange={change}
          />
          <button type='button' onClick={send}>
            Send
          </button>
          {params?.slug !== 'into' && (
            <button type='button' onClick={showJoinList}>
              join
            </button>
          )}
        </form>
      )}
      {joinListVisible && (
        <ul className='join-list'>
          {joinList?.length
            ? joinList.map((item, index) => (
                <li key={item.uid}>
                  <span>{decodeURIComponent(item.joinName || '')}</span>
                  <button onClick={() => agreeJoin(index, item.uid)}>
                    {item.joined ? 'close' : 'agree'}
                  </button>
                </li>
              ))
            : 'No Applicant'}
        </ul>
      )}
    </>
  );
};

export default ChatPage;
