import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import githubHandler from './handlers/github';
import skipHookHeartBeat from './middleware/skipHookHeartBeat';
import dedupeEvents from './middleware/dedupeEvents';

// import redisMiddleware from './middleware/redis';

const app = express();
const port = __PORT__;

/**
 * Middleware setup
 */
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(skipHookHeartBeat);
app.use(dedupeEvents);
// app.use(redisMiddleware);

app.post('/hooks/github', githubHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
