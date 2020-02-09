import { Request, Response } from 'express';

import { createWorkTree } from './utils';
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
    await createWorkTree(req.body.pull_request.head.ref);
  } catch (err) {
    if (err && err.type !== 'STDERR') {
      console.log("===ERROR===");
      console.log(err);
    }

    return res.status(500).send(err);
  }

  return res.sendStatus(204);
}
