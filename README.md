使用[NextJS](https://nextjs.org/) + [Socket.IO](https://socket.io/zh-CN/) + [MongoDB](https://www.npmjs.com/package/mongodb) 开发的同步信息应用  

版本（**NextJS版本与MongoDB版本换成其他的可能有bug**）  
NextJS -> 13.2.5-canary.27  
Socket.IO -> ^4.7.2  
MongoDB -> ^6.0.0  

需要在.env.local添加两个环境变量  
START_ORIGIN -> 本地启动路径/默认http://127.0.0.1:3000
MONGODB_URI  -> MongoDB连接地址
MONGODB_DB   -> 需要保存数据的数据库/默认chat

## TODO

- [ ] 加入时显示前面信息
- [ ] 创建者对加入者进行控制
- [ ] 会话信息销毁
- [ ] 显示页面优化
- [ ] 样式美化


## Getting Started

First, run the development server:

```bash
pnpm dev
pnpm build
pnpm start

# 需要使用额外服务器启动
pnpm server
```




## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
