import { Request, Response, NextFunction } from 'express';

import { ACTION_TYPE } from '../constants';


/**
 * Middleware to drop other PR related events.
 */
export default (req: Request, res: Response, next: NextFunction) => {
  const { action } = req.body;

  if (action !== ACTION_TYPE.OPENED && action !== ACTION_TYPE.SYNC) {
    return res.sendStatus(204);
  }

  return next();
}
