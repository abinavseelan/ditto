import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());

app.get('/ping', (req: Request, res: Response) => {
  res.status(200).send('Pong!');
});

app.listen(__PORT__, () => {
  console.log(`Server running on port ${__PORT__}`);
})
