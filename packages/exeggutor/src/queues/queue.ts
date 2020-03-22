import Queue from 'bull';

class BaseQueue<T> {
  public queue: Queue.Queue<T>;

  constructor(name: string, cb: any) {
    this.queue = new Queue(name, 'redis://localhost:6379');

    this.queue.process(cb);
  }

  async add(job: T, options?: Queue.JobOptions) {
    const jobId = await this.queue.add(job, options);
    return jobId;
  }

  async getJob(jobId: Queue.JobId) {
    const jobDetails = await this.queue.getJob(jobId);

    return jobDetails;
  }

  async getJobs() {
    const jobs = await this.queue.getJobs(['']);

    return jobs;
  }
}

export default BaseQueue;
