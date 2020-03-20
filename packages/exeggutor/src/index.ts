import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { validate, ValidationError } from 'express-validation';

import { dockerBuildPayloadValidation } from './validations';
import { DEFAULTS } from './constants';

import { DockerBuildQueue } from './queues';

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());

app.get('/ping', (req: Request, res: Response) => {
  res.status(200).send('Pong!');
});

app.post('/build/docker',
  validate(dockerBuildPayloadValidation, {}, {}),
  async (req: Request, res: Response) => {
    const {
      dockerRegistry,
      imageName,
      tag,
      expose,
    } = req.body;

    const jobId = await DockerBuildQueue.add({
      registry: {
        endpoint: dockerRegistry || DEFAULTS.DOCKER_REGISTRY,
        imageName,
        tag,
      },
      run: {
        expose,
      }
    });

    res.status(201).json({
      jobId,
    });
  }
);

app.use((err, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err)
  }

  return res.status(500).json(err)
})

process.on('unhandledRejection', (error: Error) => {
  // Will print "unhandledRejection err is not defined"
  console.log('UnhandledRejection', error.message);
});

const __PORT__ = 1337;

app.listen(__PORT__, () => {
  console.log(`Server running on port ${__PORT__}`);
});
