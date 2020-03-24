import { exec } from 'child_process';
import { createHash } from 'crypto';
import { promisify } from 'util';

import BaseQueue from './queue';
import { DockerJobEntity } from '../types';
import { Redis, Port } from '../connectors';
import { CleanupQueue } from '.';

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
      let containerId;
      let image;

      try {
        const {
          data: {
            registry,
            run,
          }
        } = job;

        image = `${registry?.endpoint}/${registry?.imageName}:${registry?.tag}`;
  
        console.log(`=== Pulling Docker Image: ${image}`);

        const dockerPullResult = await execPromise(`docker pull ${image}`);
        if (dockerPullResult.stderr) {
          throw new Error(`Could not pull docker image: ${dockerPullResult.stderr}`);
        }
        job.progress(50);
  
        assignedPort = await Port.assign(image);
        console.log(`=== Running Docker Image: ${image}`);

        const dockerRunResult = await execPromise(`docker container run -p ${assignedPort}:${run.expose} -d ${image}`);
        if (dockerRunResult.stderr) {
          throw new Error(`Could not run docker image: ${dockerRunResult.stderr}`);
        }
        job.progress(90);
  
        containerId = dockerRunResult.stdout;

        console.log(`==== Container ID for ${image}: ${containerId}`);

        await Promise.all([
          Redis.hset('pods', image, JSON.stringify({
            createdAt: Date.now(),
            lastAccess: Date.now(),
            containerId,
            port: assignedPort,
          })),
          Redis.hset('urlMaps', createHash('md5').update(image).digest('hex'), image),
        ]);

        job.progress(100);
      } catch (err) {
        if (containerId) {
          Port.reclaim(containerId, image, assignedPort);
        }
        CleanupQueue.add({});
        console.log("DockerBuildQueue -> constructor -> err", err)
      }
    });
  }
}
 
export default new DockerBuildQueue();
