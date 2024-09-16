import React, { useEffect } from 'react';
import { List } from 'antd';
import VirtualList from 'rc-virtual-list';
import useWindowDimensions from 'lib/useWindowDimension';
import { Messages } from 'types/custom';
import dayjs from 'dayjs';

const MessageList: React.FC<{ messages?: Messages }> = props => {
  const { height = 100 } = useWindowDimensions();
  const ContainerHeight = height - 100;
  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (Math.abs(e.currentTarget.scrollHeight - e.currentTarget.scrollTop - ContainerHeight) <= 1) {
    }
  };
  useEffect(() => {
  }, []);
  return (
    <main>
      <List>
        <VirtualList
          data={props.messages || []}
          height={ContainerHeight}
          itemHeight={47}
          itemKey="time"
          onScroll={onScroll}
        >
          {(item: Messages[0]) => (
            <List.Item key={item.time} className='break-words whitespace-pre-wrap pr-8'>
              <List.Item.Meta
                avatar={<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4290" width="32" height="32"><path d="M512 512H0A512 512 0 1 0 512 0 512 512 0 0 0 0 512z" fill="#CECECE" p-id="4291"></path><path d="M695.495111 136.206222c-15.971556-1.777778-56.234667 66.360889-56.234667 66.360889a425.159111 425.159111 0 0 0-254.492444 0s-40.263111-68.124444-56.234667-66.360889-72.448 233.543111-117.532444 777.415111a466.147556 466.147556 0 0 0 602.325333 0c-45.226667-543.872-101.560889-775.480889-117.831111-777.415111z" fill="#F2F2F2" p-id="4292"></path><path d="M836.551111 314.368a94.435556 94.435556 0 0 0-16.042667-2.261333c-27.463111-1.934222-55.139556-3.754667-82.488888-4.408889a470.840889 470.840889 0 0 0-161.450667 19.384889 144.753778 144.753778 0 0 1-129.123556 0 459.733333 459.733333 0 0 0-160.142222-19.541334c-27.022222 0.64-54.044444 2.517333-81.066667 4.565334-21.603556 1.664-42.951111 4.721778-44.088888 33.607111a25.6 25.6 0 0 0 9.472 22.442666c5.006222 3.968 14.222222 2.574222 18.488888 7.352889s3.100444 13.425778 3.356445 20.081778c2.161778 52.508444 9.016889 110.378667 54.741333 141.141333 37.148444 25.016889 84.408889 28.344889 127.118222 27.761778a93.240889 93.240889 0 0 0 88.177778-60.984889 431.886222 431.886222 0 0 0 15.985778-61.738666s13.582222-51.811556 32.583111-51.655111 32.583111 51.655111 32.583111 51.655111a424.049778 424.049778 0 0 0 15.985778 61.738666 93.070222 93.070222 0 0 0 88.177778 60.984889c42.666667 0.597333 89.969778-2.744889 127.118222-27.761778 45.710222-30.762667 52.622222-88.647111 54.741333-141.141333 0.256-6.656-1.152-15.089778 3.356445-20.081778s13.383111-3.384889 18.488889-7.352889a25.6 25.6 0 0 0 9.472-22.442666 30.151111 30.151111 0 0 0-25.315556-31.288889z" fill="#818488" p-id="4293"></path></svg>}
                title={
                  <div className='message-item-header'>
                    <span>{item.username}</span>
                    <span>{dayjs(item.time).format('YYYY-MM-DD HH-mm-ss')}</span>
                  </div>
                }
                description={<div>{item.msg}</div>}
              />
            </List.Item>
          )}
        </VirtualList>
      </List>
    </main>
  )
}

export default MessageList