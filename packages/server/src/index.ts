import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = __PORT__;

app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
})
