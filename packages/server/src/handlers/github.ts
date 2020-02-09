import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process'; 
import { Request, Response } from 'express';

const promisifiedExec = promisify(exec);

/**
 * https://xstate.js.org/viz/?gist=282fdcdc73881a0b71e22ffd317fa20a
 */
export default async (req: Request, res: Response) => {
  const { number: pullId, } = req.body;

  if (!pullId) {
    return res.status(400).json({
      message: 'PullId not provided',
    });
  }

  try {
    const { stdout, stderr } = await promisifiedExec(
      `git worktree add ${ req.body.pull_request.head.ref }`,
      { cwd: path.resolve(process.cwd(), '..', '..', '..', 'tmp')},
    );

    if (stderr) {
      console.log("===STDERR===");
      console.log(stderr);
      return res.status(500).send(stderr);
    }

    console.log("===STDOUT===");
    console.log(stdout);
  } catch (err) {
    console.log("===ERROR===");
    console.log(err);

    return res.status(500).send(err);
  }

  return res.sendStatus(204);
}
