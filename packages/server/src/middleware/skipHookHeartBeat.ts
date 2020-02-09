import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to handle pings from github to set up / revalidate the hook
 */
export default (req: Request, res: Response, next: NextFunction) => {
  const { hook_id: hookId } = req.body;

  if (hookId) {
    return res.sendStatus(204);
  }

  return next();
}
