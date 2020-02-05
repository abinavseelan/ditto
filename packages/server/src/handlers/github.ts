import { Request, Response } from 'express';

import { ACTION, PULL_ID, ACTION_TYPE, HOOK_PING } from '../constants';

export default async (req: Request, res: Response) => {
  const { [PULL_ID]: pullId, [ACTION]: action, [HOOK_PING]: hook_id } = req.body;

  console.log(req.body);

  if (hook_id) {
    // This is a ping from Github
    return res.sendStatus(204);
  }

  if (!pullId) {
    return res.status(400).json({
      message: 'PullId not provided',
    });
  }

  if (action !== ACTION_TYPE.OPENED || action !== ACTION_TYPE.SYNC) {
    return res.sendStatus(204);
  }

  return res.sendStatus(204);
}
