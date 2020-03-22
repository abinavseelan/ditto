import { exec } from 'child_process';
import { promisify } from 'util';

import BaseQueue from './queue';

const execPromise = promisify(exec);

class CleanupQueue extends BaseQueue<{}> {
  constructor() {
    super('Cleanup Queue', async (job) => {
      /**
       * 1. Clean all dangling / unused docker images
       */

      try {
        console.log('=== Cleaning unused Docker Images');
        const dockerCleanResult = await execPromise('docker system prune -a -f');

        if (dockerCleanResult.stderr) {
          throw new Error('Could not cleanup docker images');
        }

        job.progress(100);
        console.log(`==== Cleaned images: ${dockerCleanResult.stdout}`);
      } catch (err) {
        console.log("DockerBuildQueue -> constructor -> err", err)
        throw new Error(err);
      }
    });
  }
}

export default new CleanupQueue();
