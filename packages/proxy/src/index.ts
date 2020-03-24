import express, { Request, Response } from 'express';
import morgan from 'morgan';
import httpProxy from 'http-proxy';

import Redis from './connectors/redis';

const proxy = httpProxy.createProxyServer();

const app = express();

app.use(morgan('dev'));

const __PORT__ = 1338;

app.all('/:baseUrl/*', async (req: Request, res: Response) => {
  const { baseUrl } = req.params;
  
  const image = await Redis.hget('urlMaps', baseUrl);

  if (!image) {
    return res.sendStatus(404);
  }

  const pod = await Redis.hget('pods', image);

  if (!pod) {
    return res.sendStatus(500);
  }

  const podMeta = JSON.parse(pod);
  await Redis.hset('pods', image, JSON.stringify({
    ...podMeta,
    lastAccess: Date.now(),
  }));

  req.url = req.url.split(baseUrl)[1];
  return proxy.web(req, res, { target: `http://localhost:${podMeta.port}` });
});

app.listen(__PORT__, () => {
  console.log(`Proxy Server running on port ${__PORT__}`);
});
