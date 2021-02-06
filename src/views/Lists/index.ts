import { NextFunction, Request, Response } from 'express';
import List from '../../db/models/List';

const create = async (req: Request, res: Response, next: NextFunction) => {
  res.json({ id: await List.create() });
  next();
};

const get = async (req: Request, res: Response, next: NextFunction) => {
  res.json(await List.get(req.params.listId));
  next();
};

export default {
  create,
  get,
};
