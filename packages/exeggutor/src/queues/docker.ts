import { exec } from 'child_process';
import { promisify } from 'util';

import BaseQueue from './queue';
import { DockerJobEntity } from '../types';
import { Redis, Port } from '../connectors';

const execPromise = promisify(exec);

class DockerBuildQueue extends BaseQueue<DockerJobEntity> {
  constructor() {
    super('Docker Build Queue', async (job) => {
      /**
       * 1. Pull image
       * 2. Run image mapped to port.
       *    2.1 If existing image with older tag, stop and re-run
       *    2.2 If new image, drop last used image and run
       */
      let assignedPort;
      try {
        const {
          data: {
            registry,
            run,
          }
        } = job;

        const image = `${registry?.endpoint}/${registry?.imageName}:${registry?.tag}`;
  
        console.log(`=== Pulling Docker Image: ${image}`);

        const dockerPullResult = await execPromise(`docker pull ${image}`);
        if (dockerPullResult.stderr) {
          throw new Error(`Could not pull docker image: ${dockerPullResult.stderr}`);
        }
        job.progress(50);
  
        console.log(`=== Running Docker Image: ${image}`);

        const dockerRunResult = await execPromise(`docker container run -p 1338:${run.expose} -d ${image}`);
        if (dockerRunResult.stderr) {
          throw new Error(`Could not run docker image: ${dockerRunResult.stderr}`);
        }
        job.progress(90);
  
        const containerId = dockerRunResult.stdout;

        console.log(`==== Container ID for ${image}: ${containerId}`);

        await Redis.hset('pods', image, JSON.stringify({
          createdAt: Date.now(),
          lastAccess: Date.now(),
          containerId,
          port: assignedPort,
        })),

        job.progress(100);
      } catch (err) {
        console.log("DockerBuildQueue -> constructor -> err", err)
      }
    });
  }
}
 
export default new DockerBuildQueue();
