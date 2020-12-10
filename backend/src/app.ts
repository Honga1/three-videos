import Express from 'express';
import path from 'path';
import proxy from 'express-http-proxy';

const appRoot = process.env.PWD;
if (appRoot === undefined) {
  throw new Error('process.env.PWD not exposed to server');
}

const PORT = process.env.PORT || 5000;

const app = Express();
app.get('/three_videos_is_up', proxy('three-videos-api.jaeperris.com'));
app.post('/three_videos_demo', (req, res, next) => {
  let reqAsBuffer = false;
  let reqBodyEncoding: 'true' | null = 'true';

  const isMultipartRequest =
    req.headers['content-type'] && req.headers['content-type'].indexOf('multipart') > -1;

  if (isMultipartRequest) {
    reqAsBuffer = true;
    reqBodyEncoding = null;
  }

  return proxy('three-videos-api.jaeperris.com', {
    reqAsBuffer: reqAsBuffer,
    reqBodyEncoding: reqBodyEncoding,
    parseReqBody: false,
    proxyReqOptDecorator: (proxyReq) => {
      return proxyReq;
    },
    userResDecorator: (rsp, data, req, res) => {
      res.set('Access-Control-Allow-Origin', 'https://three-videos-api.jaeperris.com');
      return data.toString('utf-8');
    },
    limit: '100mb',
  })(req, res, next);
});

app.use(Express.static(path.join(appRoot, 'build')));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});
app.use(Express.static(path.join(__dirname, 'videos')));

app.listen(PORT, () => console.log(`${process.env.NODE_ENV}: Listening on ${PORT}`));
