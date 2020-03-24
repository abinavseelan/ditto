import { exec } from 'child_process';
import { promisify } from 'util';

import { STARTING_PORT } from '../constants';
import { Redis } from '../connectors';

const execPromise = promisify(exec);

class Port {
  public ports: {
    [portNumber: number]: string | null;
  }

  constructor(imagesCount) {
    this.ports = {};

    for (let i = 0; i < imagesCount; i++) {
      this.ports[STARTING_PORT + i] = null;
    }
  }

  async setupFromDb() {
    try {
      const imageRecords = await Redis.hgetall('images');
      const images = Object.keys(imageRecords);
  
      for (let i = 0; i < images.length; i++) {
        const image = JSON.parse(imageRecords[images[i]]);
  
        if (this.ports[image.port]) {
          this.ports[image.port] = image.containerId;
        }
      }
    } catch (err) {
      throw new Error('Unable to set up port details');
    }
  }

  async assign(image: string) {
    try {
      /**
       * 1. Check if image already present. If yes, clear old image and return cleared port
       * 2. Check for free port. If present, return
       * 3. LRU evict and return free port.
       */
      const data = await Redis.hget('pods', image);

      if (data) {
        // Image already present
        const podMeta = JSON.parse(data);
        await this.reclaim(podMeta.containerId, image, podMeta.port);
        return podMeta.port;
      }

      // Find an unused port
      const portList = Object.keys(this.ports);
      for (let i = 0; i < portList.length; i++) {
        const portNumber = portList[i];

        if (this.ports[portNumber] === null) {
          return portNumber;
        }
      }

      // LRU eviction
      const pods = await Redis.hgetall('pods');
      const podList = Object.keys(pods);

      let lruPod = JSON.parse(pods[podList[0]]);
      let lruIndex = 0;
      
      for (let i = 0; i < podList.length; i++) {
        const podData = JSON.parse(pods[podList[i]]);

        if (podData.lastAccess < lruPod.lastAccess) {
          lruPod = podData;
          lruIndex = i;
        }
      }

      await this.reclaim(lruPod.containerId, podList[lruIndex], lruPod.port);
      return lruPod.port;
    } catch (err) {
      return null;
    }
  }

  async reclaim(containerId: string, image: string, port: number) {
    try {
      console.log(`=== Reclaiming ${containerId} ${image}`);
      const stopResult = await execPromise(`docker container stop ${containerId}`);
      
      if (stopResult.stderr) {
        throw new Error(`Could not stop container: ${containerId}`);
      }

      // Removal need not throw if it errors out as the cleanup job will remove this.
      await execPromise(`docker container rm ${containerId}`);
      await Redis.hdel('pods', image);
      this.updatePort(port, null);
    } catch(err) {
      console.log("Port -> clear -> err", err)
    }
  }

  updatePort(port, containerId) {
    this.ports[port] = containerId;
  }
}

const port = new Port(10);

port.setupFromDb();

export default port;
