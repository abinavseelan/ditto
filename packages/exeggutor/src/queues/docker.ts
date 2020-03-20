import { spawn } from 'child_process';

import BaseQueue from './queue';
import { DockerJobEntity } from '../../src/types';

class DockerBuildQueue extends BaseQueue<DockerJobEntity> {
  constructor() {
    super('Docker Build Queue', (job) => {
      /**
       * 1. Pull image
       * 2. Run image mapped to port.
       *    2.1 If existing image with older tag, stop and re-run
       *    2.2 If new image, drop last used image and run
       */

      console.log(job);
      // const dockerPull = spawn('docker', ['pull'])
    });
  }
}

const dockerBuildQueue = new DockerBuildQueue();

export default dockerBuildQueue;
