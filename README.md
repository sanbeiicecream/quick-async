> 升级到Next.js 15
> 更新依赖
> 优化代码

使用[NextJS](https://nextjs.org/) + [Socket.IO](https://socket.io/zh-CN/) + [MongoDB](https://www.npmjs.com/package/mongodb) 开发的匿名聊天应用  


版本（**NextJS版本与MongoDB版本换成其他的可能有bug**）  
NodeJS -> 19.0.0+
NextJS -> 15.0.0+
Socket.IO -> ^4.7.2  
MongoDB -> ^6.9.0 

需要在.env.local添加两个环境变量  
START_ORIGIN -> 本地启动路径/默认http://127.0.0.1:3000  
MONGODB_URI  -> MongoDB连接地址  
MONGODB_DB   -> 需要保存数据的数据库/默认chat  
LOCAL_STORE -> 是否启用本地数据库（文本形式）  
LOGGER -> 是否记录日志 0->不记录 1->记录  
## TODO


- [x] 创建者对加入者进行控制
- [x] 会话信息销毁
- [x] 显示页面优化
- [x] 样式美化
- [x] 房间链接二维码
- [ ] 传输文件格式
- [ ] 更多功能...

## Getting Started

First, run the development server:

```bash
pnpm dev
pnpm dev-turbo
pnpm build
pnpm start
```
