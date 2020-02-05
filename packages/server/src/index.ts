import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import githubHandler from './handlers/github';

const app = express();
const port = __PORT__;

app.use(morgan('dev'));
app.use(bodyParser.json());

app.post('/hooks/github', githubHandler); 

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
