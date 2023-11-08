const { createServer } = require('http');
const url = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { initIo } = require('./lib/socketNameSpace.js')
const log4js = require('log4js')
const { initMongoDB } = require('./lib/mongodb.js')

log4js.configure({
  appenders: { console: { type: 'console' } },
  categories: { default: { appenders: ['console'], level: 'info' } }
});
global.logger = log4js.getLogger()
global.uidSocketIdMap = {}
global.cuidList = []
global.uidList = []

const dev = process.env.NODE_ENV !== 'production';
const hostname = '127.0.0.1';
const port = process.env?.START_ORIGIN || 2333;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = url.parse(req?.url || '', true);
      const { pathname, query } = parsedUrl;
      // 走nextJS的自定义路由处理
      // 手动渲染页面
      if (pathname === '/room') {
        await app.render(req, res, '/room');
      }
      else if (pathname === '/') {
        await app.render(req, res, '/');
      } else {
        // nextJS默认路由处理
        if (!['/api/create', '/api/login'].includes(pathname)) {
          await handle(req, res)
        }
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, { addTrailingSlash: false });
  // res.socket.server.io = io
  initIo(io)

  server.on('request', async (req, res) => {
    const url = req.url;
    if (['/api/create', '/api/login'].includes(url)) {
      if (!res.socket.server.io) {
        res.socket.server.io = io
      }
      await handle(req, res)
    }
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    initMongoDB()
  });
});

