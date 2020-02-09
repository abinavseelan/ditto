import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

const redis = new Redis();

export default (req, res, next): void => {
  req.redis = redis;
  next();
};
